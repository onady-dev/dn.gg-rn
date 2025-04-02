import { Text, Pressable } from "react-native";
import styled from "styled-components/native";

export default function TextButton({ text, color, onPress }: { text: string; color?: string; onPress: () => void }) {
  return (
    <Button style={{ backgroundColor: color || "white" }} onPress={onPress}>
      <Name>{text}</Name>
    </Button>
  );
}

const Button = styled(Pressable)`
  margin: 10px;
  font-size: 30px;
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
  font-size: 25px;
  font-weight: bold;
  color: #000;
`;
