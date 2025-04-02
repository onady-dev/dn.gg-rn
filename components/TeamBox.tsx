import { View, Text } from "react-native";
import styled from "styled-components/native";
import TextButton from "./TextButton";
import { useEffect, useState } from "react";
import LogStack from "@/class/LogStack";
import { RECORDS } from "@/Records";

export default function TeamBox({
  team,
  teamName,
  players,
  setLogs,
  score,
}: // addScore,
{
  team: string;
  teamName: string;
  players: string[];
  setLogs: (logs: string) => void;
  score: number;
  // addScore: (score: number) => void;
}) {
  const [isPicked, setIsPicked] = useState<boolean>(false);
  const [playerName, setPlayerName] = useState<string>("");

  return (
    <Box>
      <TeamName>{teamName}</TeamName>
      <Score>{score}</Score>
      <ButtonBox>
        {isPicked
          ? Object.values(RECORDS).map((record, index) => (
              <TextButton
                key={index}
                text={record.name}
                onPress={() => {
                  if (index !== 9) {
                    // addScore(record.value);
                    setLogs(`${team + "/" + teamName + "/" + playerName + "/" + index}`);
                  }
                  setIsPicked(false);
                }}
              />
            ))
          : players.map((player) => (
              <TextButton
                key={player}
                text={player}
                onPress={() => {
                  setIsPicked(true);
                  setPlayerName(player);
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
