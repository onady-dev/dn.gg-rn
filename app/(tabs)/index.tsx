import teamState from "@/atoms/TeamState";
import Player from "@/class/Player";
import Team from "@/class/Team";
import PlusBtn from "@/components/PlusBtn";
import SelectAblePlayerBtn from "@/components/SelectAblePlayerBtn";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { View, SafeAreaView, Text, TextInput, TouchableOpacity, ScrollView, Pressable } from "react-native";
import { useRecoilState } from "recoil";
import styled from "styled-components/native";
import axios from "axios";
import SelectPlayerBox from "@/components/SelectPlayerBox";
import BasicModal from "@/components/BasicModal";
import UpdateModal from "@/components/UpdateModal";
import logItemState from "@/atoms/LogItemState";

export default function HomeScreen() {
  const [players, setPlayers] = useState<Map<number, Player>>(new Map());
  const [selectedPlayers, setSelectedPlayers] = useState<Map<number, Player>>(new Map());
  const [teams, setTeams] = useRecoilState(teamState);
  const [selectedTeamPlayers, setSelectedTeamPlayers] = useState<Array<Map<number, Player>>>([new Map()]);
  const [addPlayerModalVisible, setAddPlayerModalVisible] = useState(false);
  const [updatePlayerModalVisible, setUpdatePlayerModalVisible] = useState(false);
  const [addPlayerName, setAddPlayerName] = useState("");
  const [updatePlayerId, setUpdatePlayerId] = useState<number | null>(null);
  const [groupId, setGroupId] = useState<number | null>(null);

  useEffect(() => {
    const asyncWrap = async () => {
      const players: Map<number, Player> | undefined = await getPlayers();
      if (players) {
        setPlayers(players);
      }
    };
    asyncWrap();
  }, []);

  const getPlayers: () => Promise<Map<number, Player> | undefined> = async () => {
    try {
      const group = await AsyncStorage.getItem("group");
      const { id } = JSON.parse(group || "{}");
      setGroupId(id);
      const getPlayers = await axios
        .get(`${process.env.EXPO_PUBLIC_API_URL}/player?groupId=${id}`, {
          headers: {
            "Content-Type": "application/json",
          },
        })
        .then((res) => res.data);
      if (getPlayers.length > 0) {
        const players: Map<number, Player> = new Map(getPlayers.map((player: Player) => [player.id, new Player(player.id, player.name)]));
        return players;
      }
      return new Map();
    } catch (error) {
      console.error(error);
    }
  };

  const addState = (key: number, setState: any, value?: Player) => {
    if (value) {
      setState((prev: Map<number, Player>) => new Map([...prev, [key, value]]));
    }
  };

  const removeState = (key: number, setState: any) => {
    setState((prev: Map<number, Player>) => {
      const newState = new Map(prev);
      newState.delete(key);
      return newState;
    });
  };

  const onPressPlayer = (id: number, isPressed: boolean) => {
    if (isPressed) {
      addState(id, setSelectedPlayers, players.get(id));
    } else {
      removeState(id, setSelectedPlayers);
    }
  };

  const onPressPlayerInTeam = (id: number, isPressed: boolean, teamIndex: number) => {
    if (isPressed) {
      const team = teams.find((team) => team.getId() === teamIndex);
      if (!team) return;
      const player = team.getPlayers().find((player) => player.getId() === id);
      if (player) {
        setSelectedTeamPlayers((prev) => {
          const newState = [...prev];
          newState[teamIndex].set(id, player);
          return newState;
        });
      }
    } else {
      setSelectedTeamPlayers((prev) => {
        const newState = [...prev];
        newState[teamIndex].delete(id);
        return newState;
      });
    }
  };

  const onPressInBtn = (teamIndex: number) => {
    const team = teams.find((team) => team.getId() === teamIndex);
    if (!team) return;
    const playersInTeam = Array.from(selectedPlayers.values()).map((player) => {
      onPressPlayer(player.getId(), false);
      removeState(player.getId(), setPlayers);
      return player;
    });
    setSelectedPlayers(new Map());
    setTeams((prev) => {
      const newTeams = [...prev];
      const newTeam = new Team(team.getId(), team.getName(), [...team.getPlayers(), ...playersInTeam]);
      teams.map((team, i) => {
        if (team.getId() === teamIndex) {
          newTeams[i] = newTeam;
        }
      });
      return newTeams;
    });
  };

  const onPressOutBtn = (teamIndex: number) => {
    const team = teams.find((team) => team.getId() === teamIndex);
    if (!team) return;
    const selectedTeamPlayersInTeam = selectedTeamPlayers[teamIndex];
    const playersInTeam = Array.from(selectedTeamPlayersInTeam.values()).map((player) => {
      onPressPlayer(player.getId(), false);
      addState(player.getId(), setPlayers, player);
      return player;
    });
    setSelectedTeamPlayers((prev) => {
      const newState = [...prev];
      newState[teamIndex] = new Map();
      return newState;
    });
    setTeams((prev) => {
      const newTeams = [...prev];
      const team = newTeams.find((team) => team.getId() === teamIndex);
      if (!team) return newTeams;
      const restPlayers = team.getPlayers().filter((player) => !playersInTeam.includes(player));
      const newTeam = new Team(team.getId(), team.getName(), restPlayers);
      teams.map((team, i) => {
        if (team.getId() === teamIndex) {
          newTeams[i] = newTeam;
        }
      });
      return newTeams;
    });
  };

  const onPressPlusBtn = () => {
    setAddPlayerName("");
    setAddPlayerModalVisible(true);
  };

  const onPressPlusPlayerConfirmBtn = async () => {
    const result = await createPlayer(addPlayerName);
    setPlayers((prev) => new Map([...prev, [result.data.id, new Player(result.data.id, result.data.name)]]));
    setAddPlayerModalVisible(false);
  };

  const onPressUpdatePlayerDeleteBtn = async () => {
    if (!updatePlayerId) return;
    const result = await deletePlayer(updatePlayerId);
    setPlayers((prev) => {
      const newState = new Map(prev);
      newState.delete(updatePlayerId);
      return newState;
    });
    setUpdatePlayerModalVisible(false);
  };

  const createPlayer = async (name: string) => {
    const group = await AsyncStorage.getItem("group");
    const { id } = JSON.parse(group || "{}");
    const result = await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/player`, {
      groupId: id,
      name,
    });
    return result;
  };

  const deletePlayer = async (id: number) => {
    const result = await axios.delete(`${process.env.EXPO_PUBLIC_API_URL}/player/${id}?groupId=${groupId}`);
    return result;
  };

  // const updatePlayer = async (id: number, name: string) => {
  //   const group = await AsyncStorage.getItem("group");
  //   const { id } = JSON.parse(group || "{}");
  //   return await axios.put(`${process.env.EXPO_PUBLIC_API_URL}/player/${id}`, {
  //     groupId: id,
  //     name,
  //   });
  // };

  const onLongPressPlayer = (id: number) => {
    setAddPlayerName(players.get(id)?.getName() || "");
    setUpdatePlayerId(id);
    setUpdatePlayerModalVisible(true);
  };

  const onPressPlusTeamBtn = async () => {
    setTeams((prev) => [...prev, new Team(teams.length + 1, String.fromCharCode(65 + teams.length))]);
    setSelectedTeamPlayers((prev) => [...prev, new Map()]);
  };

  const clearAsyncStorage = async () => {
    await AsyncStorage.clear();
  };

  return (
    <ScreenStyled>
      <ScrollBoxStyled>
        <PlayerBoxStyled>
          {Array.from(players.values()).map((player, i) => (
            <SelectAblePlayerBtn
              key={player.getId()}
              id={player.getId()}
              teamIndex={-1}
              text={player.getName()}
              onPress={onPressPlayer}
              onLongPress={() => onLongPressPlayer(player.getId())}
            />
          ))}
          <PlusBtn onPress={onPressPlusBtn} />
        </PlayerBoxStyled>
      </ScrollBoxStyled>
      <ScrollTeamBoxStyled>
        {teams.map((team: Team, i: number) => (
          <SelectPlayerBox key={team.getId()} team={team} onPressInBtn={onPressInBtn} onPressOutBtn={onPressOutBtn} onPressPlayerInTeam={onPressPlayerInTeam} />
        ))}
        <PlusTeamBtnStyled onPress={onPressPlusTeamBtn} onLongPress={() => clearAsyncStorage()}>
          <Text style={{ fontSize: 50, fontWeight: "bold" }}>+</Text>
        </PlusTeamBtnStyled>
      </ScrollTeamBoxStyled>

      <BasicModal
        text={addPlayerName}
        isModalVisible={addPlayerModalVisible}
        onPressConfirm={onPressPlusPlayerConfirmBtn}
        onChangeText={setAddPlayerName}
        placeholder="플레이어 이름을 입력하세요"
        isCancelable={true}
        setIsModalVisible={setAddPlayerModalVisible}
      />
      <UpdateModal
        text={addPlayerName}
        isModalVisible={updatePlayerModalVisible}
        onPressSave={onPressPlusPlayerConfirmBtn}
        onPressDelete={onPressUpdatePlayerDeleteBtn}
        onChangeText={setAddPlayerName}
        placeholder="플레이어 이름을 입력하세요"
        isCancelable={true}
        setIsModalVisible={setUpdatePlayerModalVisible}
      />
    </ScreenStyled>
  );
}

const ScreenStyled = styled(SafeAreaView)`
  flex: 5;
  align-items: center;
  flex-direction: row;
`;

const ScrollBoxStyled = styled(ScrollView)`
  flex: 2.3;
  flex-wrap: wrap;
  margin: 1px;
`;

const PlayerBoxStyled = styled(View)`
  flex: 1;
  align-items: center;
  flex-wrap: wrap;
  flex-direction: row;
`;

const ScrollTeamBoxStyled = styled(ScrollView)`
  flex: 2.9;
`;

const PlusTeamBtnStyled = styled(Pressable)`
  align-items: center;
  background-color: #ffffff;
  border-radius: 2%;
`;
