import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, FlatList, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useChat } from "../../contexts/ChatContext";
import { useAuth } from "../../contexts/AuthContext";
import EmptyChatList from "../../components/common/EmptyChatList";

const Chats = () => {
  const { chatList, fetchChats } = useChat();
  const { getUser, user } = useAuth();

  useEffect(() => {
    const fetchUser = async () => {
      await getUser();
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const getChats = async () => {
      if (user?._id) {
        try {
          await fetchChats(user._id);
        } catch (error) {
          throw error;
        }
      }
    };

    getChats();

    const interval = setInterval(getChats, 3000);

    return () => clearInterval(interval);
  }, [user, fetchChats]);

  const renderChatItem = ({ item }) => {
    return (
      <TouchableOpacity
        onPress={() => {
          router.push(
            `/user/chat/${user._id === item.receiverId ? item.senderId : item.receiverId}?name=${item.name}&profilePicture=${item.profilePicture}`,
          );
        }}
        className="flex-row items-center justify-between bg-darkUmber-light p-4 mb-2 rounded-lg"
      >
        <View className="flex-row items-center justify-start">
          {item.profilePicture ? (
            <Image
              source={{ uri: item.profilePicture }}
              className="w-10 h-10 rounded-full"
            />
          ) : (
            <Ionicons name="person-circle-outline" size={40} color="#FFFFFF" />
          )}
          <View className="flex-1 ml-4">
            <Text className="text-white font-medium text-lg">{item.name}</Text>
            <Text className="text-frenchGray-light">{item.lastMessage}</Text>
          </View>
        </View>
        {!item.isRead && item.receiverId === user._id && (
          <View className="bg-chartreuse p-1 rounded-full"></View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-darkUmber-dark p-4">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-white text-2xl font-bold">Chats</Text>
      </View>
      {chatList.length > 0 ? (
        <FlatList
          data={chatList}
          renderItem={renderChatItem}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <EmptyChatList />
      )}
    </SafeAreaView>
  );
};

export default Chats;
