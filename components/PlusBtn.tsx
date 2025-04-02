import { useState } from "react";
import { Text, Pressable } from "react-native";
import styled from "styled-components/native";

export default function SelectAbleBtn({ onPress }: { onPress: () => void }) {
  return (
    <Button onPress={onPress}>
      <Name>+</Name>
    </Button>
  );
}

const Button = styled(Pressable)`
  margin: 10px;
  font-weight: bold;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  align-items: center;
  justify-content: center;
  border-color: #000000;
  border-width: 1px;
`;

const Name = styled(Text)`
  font-size: 50px;
  font-weight: bold;
  color: #000;
`;
