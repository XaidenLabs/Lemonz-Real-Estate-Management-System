import { useEffect } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useAuth } from "../../../contexts/AuthContext";
import RatingsSummary from "../../common/RatingsSummary";

const Header = () => {
  const { getUser, user } = useAuth();

  useEffect(() => {
    const getUserDetails = async () => {
      await getUser();
    };

    getUserDetails();
  }, []);

  return (
    <View className="flex-row items-center justify-between mb-6 pt-2">
      <View>
        <Text className="text-white font-rbold text-3xl">Dashboard</Text>
        <Text className="text-gray-400 font-rregular text-sm mt-1">
          {user.firstName ? `Hello, ${user.firstName}` : "Welcome back"}
        </Text>
      </View>

      <View className="flex-row items-center gap-3">
        {/* Search Icon (Simulated) */}
        <TouchableOpacity className="bg-[#2B3B3C] p-2 rounded-full">
          <Ionicons name="search-outline" size={20} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Notifications Icon (Simulated) */}
        <TouchableOpacity className="bg-[#2B3B3C] p-2 rounded-full">
          <Ionicons name="notifications-outline" size={20} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Profile Picture */}
        <TouchableOpacity
          className="bg-chartreuse items-center justify-center w-[40px] h-[40px] rounded-full border-2 border-[#2B3B3C]"
          onPress={() => router.push("/agent/profile")}
        >
          {!user.profilePicture ? (
            <Ionicons name="person" size={20} color={"#212A2B"} />
          ) : (
            <Image
              source={{ uri: user.profilePicture }}
              resizeMode="cover"
              className="rounded-full w-full h-full"
            />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Header;
