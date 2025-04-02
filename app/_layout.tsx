import BasicModal from "@/components/BasicModal";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { Modal, Text, TextInput, View } from "react-native";
import "react-native-reanimated";
import { RecoilRoot } from "recoil";
import styled from "styled-components";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });
  const [isModalVisible, setIsModalVisible] = useState<boolean>(true);
  const [groupName, setGroupName] = useState<string>("");

  useEffect(() => {
    const asyncWrap = async () => {
      const group = await AsyncStorage.getItem("group");
      if (group) {
        setIsModalVisible(false);
      }
    };
    asyncWrap();
  }, []);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  const onPressConfirm = async () => {
    const { data } = await getGroupByName(groupName);
    if (data) {
      await AsyncStorage.setItem("group", JSON.stringify({ id: data.id, name: data.name }));
      setIsModalVisible(false);
    } else {
      const { data } = await createGroup(groupName);
      await AsyncStorage.setItem("group", JSON.stringify({ id: data.id, name: data.name }));
      setIsModalVisible(false);
    }
  };

  const getGroupByName = async (name: string) => {
    return await axios.get(`${process.env.EXPO_PUBLIC_API_URL}/group?name=${name}`);
  };

  const createGroup = async (name: string) => {
    return await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/group`, { name });
  };

  if (!loaded) {
    return null;
  }

  return (
    <RecoilRoot>
      {isModalVisible ? (
        <BasicModal
          text=""
          isModalVisible={isModalVisible}
          onPressConfirm={onPressConfirm}
          onChangeText={setGroupName}
          placeholder="그룹명을 입력하세요"
          setIsModalVisible={setIsModalVisible}
        />
      ) : (
        <>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="auto" />
        </>
      )}
    </RecoilRoot>
  );
}
