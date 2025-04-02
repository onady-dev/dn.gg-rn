import Player from "@/class/Player";
import Team from "@/class/Team";
import { Text, Pressable, View, TouchableOpacity, ScrollView } from "react-native";
import styled from "styled-components/native";
import SelectAblePlayerBtn from "./SelectAblePlayerBtn";

export default function SelectPlayerBox({
  team,
  onPressInBtn,
  onPressOutBtn,
  onPressPlayerInTeam,
}: {
  team: Team;
  onPressInBtn: (i: number) => void;
  onPressOutBtn: (i: number) => void;
  onPressPlayerInTeam: (i: number, isPressed: boolean, teamIndex: number) => void;
}) {
  return (
    <TeamBoxStyled key={team.getId()}>
      <TeamBoxInnerStyled>
        <TeamNameBoxStyled>
          <InBtnStyled onPress={() => onPressInBtn(team.getId())}>
            <Text style={{ fontSize: 50, fontWeight: "bold" }}>→</Text>
          </InBtnStyled>
          <TeamNameStyled>{team.getName()}</TeamNameStyled>
          <OutBtnStyled onPress={() => onPressOutBtn(team.getId())}>
            <Text style={{ fontSize: 50, fontWeight: "bold" }}>←</Text>
          </OutBtnStyled>
        </TeamNameBoxStyled>
        <ScrollBoxStyled horizontal={true}>
          <PlayersStyled>
            {team.getPlayers().map((player: Player) => (
              <SelectAblePlayerBtn key={player.getId()} id={player.getId()} teamIndex={team.getId()} text={player.getName()} onPress={onPressPlayerInTeam} />
            ))}
          </PlayersStyled>
        </ScrollBoxStyled>
      </TeamBoxInnerStyled>
    </TeamBoxStyled>
  );
}

const TeamBoxStyled = styled(View)`
  align-items: center;
  flex-wrap: wrap;
`;

const TeamBoxInnerStyled = styled(View)`
  height: 202px;
  flex-direction: row;
`;

const TeamNameBoxStyled = styled(View)`
  flex: 0.5;
  margin: 0.5%;
  border-radius: 10px;
  background-color: #ffffff;
`;

const TeamNameStyled = styled(Text)`
  font-weight: bold;
  font-size: 25px;
  text-align: center;
  color: #000000;
  width: 100px;
  padding: 10px;
  margin: 5px;
  background-color: #f0f0f0;
  border-width: 1px;
  border-radius: 10px;
`;

const InBtnStyled = styled(TouchableOpacity)`
  flex: 0.8;
  align-items: center;
  justify-content: center;
  border-radius: 100px;
`;

const OutBtnStyled = styled(TouchableOpacity)`
  flex: 0.8;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
`;

const PlayersStyled = styled(View)`
  align-items: center;
  flex-wrap: wrap;
  margin: 1px;
`;

const ScrollBoxStyled = styled(ScrollView)`
  flex: 2.3;
  flex-wrap: wrap;
`;
