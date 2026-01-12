import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useChat } from "../../../../contexts/ChatContext";
import { useAuth } from "../../../../contexts/AuthContext";
import EmptyChatMessages from "../../../../components/common/EmptyChatMessages";

const ChatScreen = () => {
  const params = useLocalSearchParams();
  const name = params.name;
  const profilePicture = params.profilePicture;

  const { messages, sendMessage, getMessages } = useChat();
  const { getUser, user } = useAuth();

  const [messageText, setMessageText] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      await getUser();
    };

    fetchUser();
  }, []);

  useEffect(() => {
    if (user && params.id) {
      getMessages(user._id, params.id);

      const interval = setInterval(() => {
        getMessages(user._id, params.id);
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [user, params.id]);

  const handleSendMessage = async () => {
    if (messageText.trim() && user) {
      sendMessage({
        senderId: user._id,
        receiverId: params.id,
        message: messageText.trim(),
      });
      setMessageText("");
      await getMessages(user._id, params.id);
    }
  };

  const renderMessageItem = ({ item }) => {
    const isCurrentUser = item.senderId === user._id;

    return (
      <View
        style={{
          padding: 10,
          backgroundColor: isCurrentUser ? "#BBCC13" : "#3D454B",
          alignSelf: isCurrentUser ? "flex-end" : "flex-start",
          borderRadius: 10,
          marginVertical: 5,
          maxWidth: "80%",
        }}
      >
        <Text className="text-white font-rregular">{item.message}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-darkUmber-dark">
      <View className="flex-row items-center bg-frenchGray-dark p-4">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back-outline" size={20} color={"#FFFFFF"} />
        </TouchableOpacity>
        <View className="flex-row items-center ml-2">
          {profilePicture ? (
            <Image
              source={{ uri: profilePicture }}
              className="w-10 h-10 rounded-full"
            />
          ) : (
            <Ionicons name="person-circle-outline" size={40} color="#FFFFFF" />
          )}
          <Text className="text-white font-rbold text-xl ml-3">{name}</Text>
        </View>
      </View>

      {messages.length > 0 ? (
        <FlatList
          data={messages}
          renderItem={renderMessageItem}
          keyExtractor={(item, index) => index}
          contentContainerStyle={{ padding: 10, paddingBottom: 80 }}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <EmptyChatMessages />
      )}

      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          paddingHorizontal: 10,
          paddingVertical: 5,
          backgroundColor: "#2B3B3C",
          borderTopWidth: 1,
          borderTopColor: "#3D454B",
        }}
      >
        <View className="flex-row items-center bg-frenchGray-light rounded-lg">
          <TextInput
            value={messageText}
            onChangeText={setMessageText}
            placeholder="Type a message"
            placeholderTextColor="#9CA3AF"
            className="flex-1 p-3 text-white font-rregular"
            style={{ maxHeight: 100 }}
            multiline
          />
          <TouchableOpacity onPress={handleSendMessage} className="p-3">
            <Ionicons name="send" size={24} color="#BBCC13" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ChatScreen;
