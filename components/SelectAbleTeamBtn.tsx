import Team from "@/class/Team";
import { useEffect, useState } from "react";
import { Text, Pressable, View } from "react-native";
import styled from "styled-components/native";

export default function SelectAbleTeamBtn({
  id,
  text,
  onPress,
  onLongPress,
  selectedTeams,
}: {
  id: number;
  text: string;
  onPress: (id: number, isPressed: boolean) => void;
  onLongPress?: (id: number) => void;
  selectedTeams: Team[];
}) {
  const [isPressed, setIsPressed] = useState(false);
  const [tag, setTag] = useState("");

  useEffect(() => {
    selectedTeams.forEach((team, i) => {
      if (team.getId() === id) {
        if (i === 0) {
          setTag("home");
        } else {
          setTag("away");
        }
      }
    });
  }, [id, selectedTeams]);

  const press = () => {
    if (selectedTeams.length === 2 && !isPressed) return;
    onPress(id, !isPressed);
    setIsPressed(!isPressed);
  };
  const longPress = () => {
    if (onLongPress) {
      onLongPress(id);
    }
  };
  return (
    <View>
      {isPressed && <Tag>{tag}</Tag>}
      <Button style={{ backgroundColor: isPressed ? "#c9c9c9" : "#ffffff" }} onPress={press} onLongPress={longPress}>
        <Name>{text}</Name>
      </Button>
    </View>
  );
}

const Button = styled(Pressable)`
  margin: 10px;
  font-weight: bold;
  width: 60px;
  height: 60px;
  border-radius: 10%;
  justify-content: center;
  align-items: center;
  border-color: #000000;
  border-width: 1px;
`;

const Name = styled(Text)`
  font-size: 30px;
  font-weight: bold;
  color: #000;
`;
const Tag = styled(Text)`
  font-size: 20px;
  color: #000;
  position: absolute;
  top: -20%;
  left: 20%;
`;
