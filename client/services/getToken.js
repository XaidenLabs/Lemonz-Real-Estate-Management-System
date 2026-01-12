import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

export const getToken = async () => {
  const token = await AsyncStorage.getItem("token");

  if (!token) {
    router.replace("/login");
  }

  return token;
};
