import { View, Text, SafeAreaView, FlatList } from "react-native";
import styled from "styled-components/native";
import { useRecoilState } from "recoil";
import logItemState from "@/atoms/LogItemState";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function LogBox({ logs }: { logs: any[] }) {
  const [logItems, setLogItems] = useState<Map<number, LogItem>>(new Map());
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
  return (
    <Box>
      <List
        data={logs}
        renderItem={({ item, index }: { item: any; index: number }) => (
          <Log key={index}>{item.teamName + " : " + item.playerName + " : " + logItems.get(item.logitemId)?.name}</Log>
        )}
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
