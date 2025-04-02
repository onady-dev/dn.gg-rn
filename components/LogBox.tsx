import { RECORDS } from "@/Records";
import { View, Text, SafeAreaView, FlatList } from "react-native";
import styled from "styled-components/native";

export default function LogBox({ logs }: { logs: any[] }) {
  return (
    <Box>
      <List
        data={logs}
        renderItem={({ item, index }: { item: any; index: number }) => <Log key={index}>{item.teamName + " : " + item.playerName + " : " + RECORDS[item.logId]?.name}</Log>}
      />
    </Box>
  );
}

const Box = styled(SafeAreaView)`
  background-color: #ffffff;
  align-items: center;
  height: 300px;
  width: 250px;
`;

const List = styled(FlatList)`
  flex: 1;
`;

const Log = styled(Text)`
  font-size: 20px;
  font-weight: bold;
  margin: 5px;
`;
