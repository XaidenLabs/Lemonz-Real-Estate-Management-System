import React from "react";
import { View, Text, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const UserReview = ({ review }) => {
  const { userName, userProfilePicture, createdAt, rating, text } = review;

  return (
    <View className="bg-darkUmber-light p-4 my-4 rounded-lg">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Image
            source={{ uri: userProfilePicture }}
            className="w-10 h-10 rounded-full mr-3"
          />
          <View>
            <Text className="font-rbold text-chartreuse text-lg">
              {userName}
            </Text>
            <Text className="font-rregular text-white text-xs">
              {new Date(createdAt).toLocaleString()}
            </Text>
          </View>
        </View>
        {rating !== null && rating > 0 && (
          <View className="flex-row items-center">
            <Ionicons name="star" size={16} color="#BBCC13" />
            <Text className="ml-1 font-rregular text-chartreuse">
              {rating.toFixed(1)}
            </Text>
          </View>
        )}
      </View>

      <Text className="font-rregular text-white mt-3">{text}</Text>
    </View>
  );
};

export default UserReview;
