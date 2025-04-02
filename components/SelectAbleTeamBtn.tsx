import { useState } from "react";
import { Text, Pressable } from "react-native";
import styled from "styled-components/native";

export default function SelectAbleTeamBtn({
  id,
  text,
  onPress,
  onLongPress,
}: {
  id: number;
  text: string;
  onPress: (id: number, isPressed: boolean) => void;
  onLongPress?: (id: number) => void;
}) {
  const [isPressed, setIsPressed] = useState(false);
  const press = () => {
    onPress(id, !isPressed);
    setIsPressed(!isPressed);
  };
  const longPress = () => {
    if (onLongPress) {
      onLongPress(id);
    }
  };
  return (
    <Button style={{ backgroundColor: isPressed ? "#c9c9c9" : "#ffffff" }} onPress={press} onLongPress={longPress}>
      <Name>{text}</Name>
    </Button>
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
