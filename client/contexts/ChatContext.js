import React, { createContext, useState, useContext, useEffect } from "react";
import { config } from "../config";
import axios from "axios";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [chatList, setChatList] = useState([]);
  const [chatError, setChatError] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [showMessageNotification, setShowMessageNotification] = useState(false);

  const showError = (errorMessage) => {
    setChatError(errorMessage);
    setTimeout(() => {
      setChatError("");
    }, 3000);
  };

  const sendMessage = async (data) => {
    try {
      if (!data || typeof data !== "object") {
        throw new Error("Invalid message data");
      }

      const response = await axios.post(
        `${config.API_BASE_URL}/api/chat/send`,
        data,
      );

      setMessages((prevMessages) => {
        const currentMessages = Array.isArray(prevMessages) ? prevMessages : [];
        return [...currentMessages, response.data.data];
      });

      return response.data.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      showError(errorMessage);
      throw error;
    }
  };

  const getMessages = async (senderId, receiverId) => {
    try {
      if (!senderId || !receiverId) {
        throw new Error("SenderId and ReceiverId are required");
      }

      const response = await axios.get(
        `${config.API_BASE_URL}/api/chat/${senderId}/${receiverId}`,
      );

      const messageArray = Array.isArray(response.data) ? response.data : [];
      setMessages(messageArray);
      return messageArray;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      showError(errorMessage);
      throw error;
    }
  };

  const fetchChats = async (userId) => {
    try {
      if (!userId) {
        throw new Error("UserId is required");
      }

      const response = await axios.get(
        `${config.API_BASE_URL}/api/chat/list/${userId}`,
      );

      const chatArray = Array.isArray(response.data) ? response.data : [];
      setChatList(chatArray);
      return chatArray;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      showError(errorMessage);
      throw error;
    }
  };

  // Count unread messages when chat list updates
  useEffect(() => {
    if (Array.isArray(chatList)) {
      const count = chatList.filter((chat) => !chat.isRead).length;
      setUnreadCount(count);
    }
  }, [chatList]);

  const value = {
    messages: Array.isArray(messages) ? messages : [],
    sendMessage,
    getMessages,
    fetchChats,
    chatList: Array.isArray(chatList) ? chatList : [],
    chatError,
    unreadCount,
    showMessageNotification,
    setShowMessageNotification,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => useContext(ChatContext);
