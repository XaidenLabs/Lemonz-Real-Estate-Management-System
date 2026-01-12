import { useEffect, useState, useCallback } from "react";
import { View, Text, TouchableOpacity, FlatList, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useChat } from "../../contexts/ChatContext";
import EmptyChatList from "../../components/common/EmptyChatList";
import { useAuth } from "../../contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";

const Chats = () => {
  const { chatList, fetchChats } = useChat();
  const { getUser, user } = useAuth();
  const [lastUpdate, setLastUpdate] = useState(null);
  const [localChatList, setLocalChatList] = useState([]);

  useEffect(() => {
    getUser();
  }, []);

  useEffect(() => {
    if (chatList.length > 0) {
      const sortedChats = [...chatList].sort((a, b) => {
        if (a.receiverId === user?._id && !a.isRead && b.isRead) return -1;
        if (b.receiverId === user?._id && !b.isRead && a.isRead) return 1;

        const timeA = new Date(a.updatedAt || 0).getTime();
        const timeB = new Date(b.updatedAt || 0).getTime();

        if (timeA !== timeB) {
          return timeB - timeA;
        }

        return a._id.localeCompare(b._id);
      });

      const shouldUpdate =
        JSON.stringify(sortedChats) !== JSON.stringify(localChatList);
      if (shouldUpdate) {
        setLocalChatList(sortedChats);
      }
    } else {
      setLocalChatList([]);
    }
  }, [chatList, user?._id]);

  useEffect(() => {
    let isSubscribed = true;
    const FETCH_INTERVAL = 3000;
    const UPDATE_THRESHOLD = 2000;

    const getChats = async () => {
      if (!user?._id || !isSubscribed) return;

      try {
        const currentTime = Date.now();
        if (!lastUpdate || currentTime - lastUpdate >= UPDATE_THRESHOLD) {
          await fetchChats(user._id);
          setLastUpdate(currentTime);
        }
      } catch (error) {
        throw error;
      }
    };

    getChats();
    const interval = setInterval(getChats, FETCH_INTERVAL);

    return () => {
      isSubscribed = false;
      clearInterval(interval);
    };
  }, [user, fetchChats, lastUpdate]);

  const renderChatItem = useCallback(
    ({ item }) => {
      const navigateToChat = () => {
        const chatPartnerId =
          user._id === item.receiverId ? item.senderId : item.receiverId;
        router.push(
          `/user/chat/${chatPartnerId}?name=${encodeURIComponent(item.name)}&profilePicture=${encodeURIComponent(item.profilePicture || "")}`,
        );
      };

      return (
        <TouchableOpacity
          onPress={navigateToChat}
          className="flex-row items-center justify-between bg-darkUmber-light p-4 mb-2 rounded-lg"
        >
          <View className="flex-row items-center justify-start">
            {item.profilePicture ? (
              <Image
                source={{ uri: item.profilePicture }}
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <Ionicons
                name="person-circle-outline"
                size={40}
                color="#FFFFFF"
              />
            )}
            <View className="flex-1 ml-4">
              <Text className="text-white font-medium text-lg">
                {item.name}
              </Text>
              <Text
                className="text-frenchGray-light"
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {item.lastMessage}
              </Text>
            </View>
          </View>
          {!item.isRead && item.receiverId === user._id && (
            <View className="bg-chartreuse w-3 h-3 rounded-full" />
          )}
        </TouchableOpacity>
      );
    },
    [user?._id],
  );

  const keyExtractor = useCallback((item) => item._id, []);

  return (
    <SafeAreaView className="flex-1 bg-darkUmber-dark p-4">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-white text-2xl font-bold">Chats</Text>
      </View>
      {localChatList.length > 0 ? (
        <FlatList
          data={localChatList}
          renderItem={renderChatItem}
          keyExtractor={keyExtractor}
          showsVerticalScrollIndicator={false}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
          removeClippedSubviews={true}
        />
      ) : (
        <EmptyChatList />
      )}
    </SafeAreaView>
  );
};

export default Chats;
