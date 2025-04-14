import { View, Text } from "react-native";
import styled from "styled-components/native";
import TextButton from "./TextButton";
import { useEffect, useState } from "react";
import LogStack from "@/class/LogStack";
import { useRecoilState } from "recoil";
import logItemState from "@/atoms/LogItemState";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Player = {
  id: number;
  name: string;
};

export default function TeamBox({
  gameId,
  team,
  teamName,
  players,
  setLogs,
  score,
  isSwap,
}: // addScore,
{
  gameId: number;
  team: string;
  teamName: string;
  players: Player[];
  setLogs: (logs: string) => void;
  score: number;
  isSwap: boolean;
  // addScore: (score: number) => void;
}) {
  const [isPicked, setIsPicked] = useState<boolean>(false);
  const [player, setPlayer] = useState<Player | null>(null);
  const [logItems, setLogItems] = useState<Map<number, LogItem>>(new Map());
  useEffect(() => {
    const asyncWrap = async () => {
      const logItems = await AsyncStorage.getItem("logItems");
      if (logItems) {
        const map = new Map();
        JSON.parse(logItems).map((logItem: LogItem, i: number) => {
          map.set(logItem.id, { id: logItem.id, name: logItem.name, value: logItem.value });
        });
        map.set(0, { name: "취소", value: 0 });
        setLogItems(map);
      }
    };
    asyncWrap();
  }, []);

  useEffect(() => {
    setIsPicked(false);
  }, [gameId, isSwap]);

  const onPressLogItem = (logItem: LogItem) => {
    if (logItem.name !== "취소") {
      setLogs(`${team + "/" + teamName + "/" + player?.name + "/" + logItem.id + "/" + player?.id}`);
    }
    setIsPicked(false);
  };

  return (
    <Box>
      <TeamName>{teamName}</TeamName>
      <Score>{score}</Score>
      <ButtonBox>
        {isPicked
          ? Array.from(logItems.values()).map((logItem, index) => <TextButton key={index} text={logItem.name} onPress={() => onPressLogItem(logItem)} />)
          : players?.map((player, index) => (
              <TextButton
                key={index}
                text={player.name}
                onPress={() => {
                  setIsPicked(true);
                  setPlayer({ id: player.id, name: player.name });
                }}
              />
            ))}
      </ButtonBox>
    </Box>
  );
}

const Box = styled(View)`
  flex: 1;
  align-items: center;
  justify-content: center;
`;

const TeamName = styled(Text)`
  font-size: 50px;
  font-weight: bold;
  color: black;
`;

const Score = styled(Text)`
  font-size: 100px;
  font-weight: bold;
  color: black;
`;

const ButtonBox = styled(View)`
  flex: 1;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
`;
