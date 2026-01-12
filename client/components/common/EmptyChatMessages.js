import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const EmptyChatMessages = () => {
  return (
    <View className="flex-1 justify-center items-center">
      <Ionicons name="chatbox-ellipses-outline" size={64} color="#BBCC13" />
      <Text className="text-white font-rbold text-xl mt-4">
        No Messages Yet
      </Text>
      <Text className="text-frenchGray-light font-rregular text-center mt-2 px-4">
        Send a message to start the conversation!
      </Text>
    </View>
  );
};

export default EmptyChatMessages;
