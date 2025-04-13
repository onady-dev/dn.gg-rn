import gameState from "@/atoms/GameState";
import logItemState from "@/atoms/LogItemState";
import teamState from "@/atoms/TeamState";
import Game from "@/class/Game";
import LogStack from "@/class/LogStack";
import Team from "@/class/Team";
import BasicModal from "@/components/BasicModal";
import GameAddModal from "@/components/gameAddModal";
import LogBox from "@/components/LogBox";
import TeamBox from "@/components/TeamBox";
import Player from "@/components/TextButton";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useEffect, useState } from "react";
import { View, Text, SafeAreaView, TouchableOpacity } from "react-native";
import { useRecoilState } from "recoil";
import styled from "styled-components/native";

type Log = {
  team: string;
  teamName: string;
  playerName: string;
  logitemId: number;
  playerId: number;
};

interface IsaveGame {
  id: number;
  groupId: number;
  name: string;
  homePlayers: { id: number }[];
  awayPlayers: { id: number }[];
  logs: { playerId: number; logitemId: number }[];
}

export default function BoardScreen() {
  const [logItems, setLogItems] = useState<Map<number, LogItem>>(new Map());
  const [games, setGames] = useRecoilState(gameState);
  const [gameLogs, setGameLogs] = useState<Array<Log[]>>([]);
  const [gameLogs2, setGameLogs2] = useState<Array<Log[]>>([]);
  const [currentGameId, setCurrentGameId] = useState<number>(0);
  const [teams] = useRecoilState(teamState);
  const [homeScore, setHomeScore] = useState<number>(0);
  const [awayScore, setAwayScore] = useState<number>(0);
  const [log, setLog] = useState<string>("");
  const [gameAddModalVisible, setGameAddModalVisible] = useState<boolean>(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState<boolean>(false);
  const [isSwap, setIsSwap] = useState<boolean>(false);

  useEffect(() => {
    const asyncWrap = async () => {
      const logItems = await AsyncStorage.getItem("logItems");
      if (logItems) {
        const map = new Map();
        JSON.parse(logItems).map((logItem: LogItem, i: number) => {
          map.set(logItem.id, { id: logItem.id, name: logItem.name, value: logItem.value });
        });
        setLogItems(map);
      }
    };
    asyncWrap();
  }, []);

  useEffect(() => {
    setGames((prev) => {
      return prev.map((game) => {
        const homeTeam = teams.find((team) => team.getId() === game.getHomeTeam().getId());
        const awayTeam = teams.find((team) => team.getId() === game.getAwayTeam().getId());
        if (homeTeam && awayTeam) {
          return new Game(game.getId(), homeTeam, awayTeam);
        }
        return game;
      });
    });
  }, [teams]);

  useEffect(() => {
    if (log) {
      const [team, teamName, playerName, logitemId, playerId] = log.split("/");
      if (Number(logitemId) !== 11) {
        setGameLogs((prev: any[]) => {
          const newGameLogs = [...prev];
          newGameLogs[currentGameId] = [{ team, teamName, playerName, logitemId: Number(logitemId), playerId: Number(playerId) }, ...(newGameLogs[currentGameId] || [])];
          return newGameLogs;
        });
      }
      setLog("");
    }
  }, [log]);

  useEffect(() => {
    if (gameLogs.length > 0) {
      const homeScore = gameLogs[currentGameId]?.reduce((acc, log: Log) => {
        if (log.team === "home") {
          return acc + (logItems.get(log.logitemId)?.value || 0);
        }
        return acc;
      }, 0);
      const awayScore = gameLogs[currentGameId]?.reduce((acc, log: Log) => {
        if (log.team === "away") {
          return acc + (logItems.get(log.logitemId)?.value || 0);
        }
        return acc;
      }, 0);
      setHomeScore(homeScore || 0);
      setAwayScore(awayScore || 0);
    }
  }, [gameLogs, currentGameId]);

  useEffect(() => {
    saveGame();
  }, [gameLogs]);

  const saveGame = async () => {
    const group = await AsyncStorage.getItem("group");
    const { id } = JSON.parse(group || "{}");
    const data: IsaveGame = {
      id: games[currentGameId].getId(),
      groupId: id,
      name: games[currentGameId].getHomeTeam().getName() + " vs " + games[currentGameId].getAwayTeam().getName(),
      homePlayers: games[currentGameId]
        .getHomeTeam()
        .getPlayers()
        .map((player) => ({ id: player.getId() })),
      awayPlayers: games[currentGameId]
        .getAwayTeam()
        .getPlayers()
        .map((player) => ({ id: player.getId() })),
      logs: gameLogs[currentGameId].map((log) => ({ playerId: log.playerId, logitemId: log.logitemId })),
    };
    const res = await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/game`, data);

    // 새로운 Game 인스턴스 생성
    const updatedGame = new Game(res.data.gameId, games[currentGameId].getHomeTeam(), games[currentGameId].getAwayTeam());

    // games 배열 업데이트
    const updatedGames = [...games];
    updatedGames[currentGameId] = updatedGame;
    setGames(updatedGames);
  };

  const onPressConfirm = (selectedTeams: Team[]) => {
    if (selectedTeams.length < 2) return;
    selectedTeams[0].setPlayers(teams.find((team) => team.getId() === selectedTeams[0].getId())?.getPlayers() || []);
    selectedTeams[1].setPlayers(teams.find((team) => team.getId() === selectedTeams[1].getId())?.getPlayers() || []);
    const newGame = new Game(0, selectedTeams[0], selectedTeams[1]);
    setGames((prev) => [...prev, newGame]);
    setGameAddModalVisible(false);
  };

  const onPressDelete = () => {
    setDeleteModalVisible(false);
  };

  return (
    <ScreenStyled>
      <GamesStyled>
        {games.map((game, index) => (
          <GameBoxStyled
            key={index}
            onPress={() => {
              setCurrentGameId(index);
            }}
            // onLongPress={() => {
            //   setDeleteGame(game.getId());
            //   setDeleteModalVisible(true);
            // }}
          >
            <GameNameStyled style={{ backgroundColor: currentGameId === index ? "#b1b0b0" : "white" }}>
              {game.getHomeTeam().getName()} vs {game.getAwayTeam().getName()}
            </GameNameStyled>
            <GameDateStyled>
              {game.getCreatedAt().toLocaleDateString()} {game.getCreatedAt().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </GameDateStyled>
          </GameBoxStyled>
        ))}
        <GameAddBtnStyled
          onPress={() => {
            setGameAddModalVisible(true);
          }}
        >
          <GameAddBtnTextStyled>+</GameAddBtnTextStyled>
        </GameAddBtnStyled>
      </GamesStyled>
      <BoardStyled>
        {games[currentGameId] && !isSwap ? (
          <TeamBox
            gameId={currentGameId}
            team={"home"}
            teamName={games[currentGameId]?.getHomeTeam()?.getName()}
            players={games[currentGameId]?.getHomeTeam()?.getPlayers()}
            setLogs={setLog}
            score={homeScore}
            isSwap={isSwap}
            // addScore={addHomeScore}
          />
        ) : (
          <TeamBox
            gameId={currentGameId}
            team={"away"}
            teamName={games[currentGameId]?.getAwayTeam()?.getName()}
            players={games[currentGameId]?.getAwayTeam()?.getPlayers()}
            setLogs={setLog}
            score={awayScore}
            isSwap={isSwap}
            // addScore={addAwayScore}
          />
        )}

        <BoxStyled>
          <SwapButtonStyled
            onPress={() => {
              setIsSwap(!isSwap);
            }}
          >
            <SwapButtonTextStyled>⇄</SwapButtonTextStyled>
          </SwapButtonStyled>
          <VsStyled>VS</VsStyled>
          <ButtonBoxStyled>
            <ButtonStyled
              onPress={() => {
                const shiftLog = gameLogs[currentGameId]?.shift();
                setGameLogs((prev) => {
                  const newGameLogs = [...prev];
                  newGameLogs[currentGameId] = gameLogs[currentGameId];
                  return newGameLogs;
                });
                if (shiftLog) {
                  setGameLogs2((prev) => {
                    const newGameLogs = [...prev];
                    newGameLogs[currentGameId] = [shiftLog, ...newGameLogs[currentGameId]];
                    return newGameLogs;
                  });
                }
              }}
            >
              <ButtonTextStyled>↶</ButtonTextStyled>
            </ButtonStyled>
            <ButtonStyled
              onPress={() => {
                const shiftLog = gameLogs2[currentGameId]?.shift();
                setGameLogs2((prev) => {
                  const newGameLogs = [...prev];
                  newGameLogs[currentGameId] = gameLogs2[currentGameId];
                  return newGameLogs;
                });
                if (shiftLog) {
                  setGameLogs((prev) => {
                    const newGameLogs = [...prev];
                    newGameLogs[currentGameId] = [shiftLog, ...newGameLogs[currentGameId]];
                    return newGameLogs;
                  });
                }
              }}
            >
              <ButtonTextStyled>↷</ButtonTextStyled>
            </ButtonStyled>
          </ButtonBoxStyled>

          <LogBox logs={gameLogs[currentGameId]} />
        </BoxStyled>
        {games[currentGameId] && !isSwap ? (
          <TeamBox
            gameId={currentGameId}
            team={"away"}
            teamName={games[currentGameId]?.getAwayTeam()?.getName()}
            players={games[currentGameId]?.getAwayTeam()?.getPlayers()}
            setLogs={setLog}
            score={awayScore}
            isSwap={isSwap}
            // addScore={addHomeScore}
          />
        ) : (
          <TeamBox
            gameId={currentGameId}
            team={"home"}
            teamName={games[currentGameId]?.getHomeTeam()?.getName()}
            players={games[currentGameId]?.getHomeTeam()?.getPlayers()}
            setLogs={setLog}
            score={homeScore}
            isSwap={isSwap}
            // addScore={addAwayScore}
          />
        )}
      </BoardStyled>

      <BasicModal
        text={"삭제 하시겠습니까?"}
        isModalVisible={deleteModalVisible}
        onPressConfirm={onPressDelete}
        onChangeText={() => {}}
        isCancelable={true}
        setIsModalVisible={setDeleteModalVisible}
      />
      <GameAddModal isModalVisible={gameAddModalVisible} setIsModalVisible={setGameAddModalVisible} onPressConfirm={onPressConfirm} teams={teams} />
    </ScreenStyled>
  );
}

const ScreenStyled = styled(SafeAreaView)`
  flex: 1;
  align-items: center;
  margin-top: 30px;
`;

const BoardStyled = styled(View)`
  flex: 3;
  align-items: center;
  flex-direction: row;
`;

const BoxStyled = styled(View)`
  flex: 0.7;
  align-items: center;
  margin: 200px 0 0 0;
`;

const VsStyled = styled(Text)`
  font-size: 70px;
  font-weight: bold;
  color: black;
`;

const ButtonStyled = styled(TouchableOpacity)`
  margin: 10px;
  font-size: 50px;
  font-weight: bold;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: #b1b0b0;
  justify-content: center;
  align-items: center;
`;

const ButtonBoxStyled = styled(View)`
  flex-direction: row;
  align-items: center;
  justify-content: center;
`;

const ButtonTextStyled = styled(Text)`
  font-size: 30px;
  font-weight: bold;
`;

const SaveBtnStyled = styled(TouchableOpacity)`
  margin: 10px;
  justify-content: center;
  align-items: center;
`;

const SaveBtnTextStyled = styled(Text)`
  font-size: 100px;
  font-weight: bold;
`;

const GamesStyled = styled(View)`
  flex: 0.3;
  align-items: center;
  flex-direction: row;
`;

const GameBoxStyled = styled(TouchableOpacity)`
  align-items: center;
  justify-content: center;
`;

const GameNameStyled = styled(Text)`
  font-size: 40px;
  font-weight: bold;
  color: black;
  border-radius: 10px;
`;

const GameDateStyled = styled(Text)`
  font-size: 15px;
  font-weight: bold;
  color: gray;
  margin: 0 10px 10px 10px;
`;

const GameAddBtnStyled = styled(TouchableOpacity)`
  justify-content: center;
  align-items: center;
`;

const GameAddBtnTextStyled = styled(Text)`
  font-size: 50px;
  font-weight: bold;
`;

const SwapButtonStyled = styled(TouchableOpacity)`
  margin: 10px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: #b1b0b0;
  justify-content: center;
  align-items: center;
`;

const SwapButtonTextStyled = styled(Text)`
  font-size: 30px;
  font-weight: bold;
`;
