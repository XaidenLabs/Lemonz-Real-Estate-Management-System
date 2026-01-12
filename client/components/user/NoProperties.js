import React from "react";
import { View, Text } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

const NoProperties = ({ type }) => {
  return (
    <View className="flex-1 items-center justify-center py-8">
      <Ionicons name="alert-circle-outline" size={80} color="#BBCC13" />
      <Text className="text-lg font-rbold text-darkBrown mt-4">
        No properties available
      </Text>
      <Text className="text-md font-rlight text-darkBrown text-center mt-2 px-4">
        {type === "category"
          ? "There are currently no properties available for this category. Please check back later or explore other categories"
          : type === "status"
            ? "There are currently no properties available for this status. Please check back later or explore other statuses"
            : "There are no properties"}
        .
      </Text>
    </View>
  );
};

export default NoProperties;
