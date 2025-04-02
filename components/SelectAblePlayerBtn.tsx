import { useState } from "react";
import { Text, Pressable } from "react-native";
import styled from "styled-components/native";

export default function SelectAblePlayerBtn({
  id,
  text,
  onPress,
  teamIndex,
  onLongPress,
}: {
  id: number;
  text: string;
  onPress: (id: number, isPressed: boolean, teamIndex: number) => void;
  teamIndex: number;
  onLongPress?: (id: number) => void;
}) {
  const [isPressed, setIsPressed] = useState(false);
  const press = () => {
    onPress(id, !isPressed, teamIndex);
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
  width: 80px;
  height: 80px;
  border-radius: 50%;
  justify-content: center;
  align-items: center;
  border-color: #000000;
  border-width: 1px;
`;

const Name = styled(Text)`
  font-size: 20px;
  font-weight: bold;
  color: #000;
`;
