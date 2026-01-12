import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const EmptyChatList = () => {
  return (
    <View className="flex-1 justify-center items-center">
      <Ionicons name="chatbubbles-outline" size={64} color="#BBCC13" />
      <Text className="text-white font-rbold text-xl mt-4">No Chats Yet</Text>
      <Text className="text-frenchGray-light font-rregular text-center mt-2 px-4">
        Start a conversation with someone to see your chats here.
      </Text>
    </View>
  );
};

export default EmptyChatList;
