import { useEffect } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useAuth } from "../../../contexts/AuthContext";
import { router } from "expo-router";

const Header = () => {
  const { getUser, user } = useAuth();

  useEffect(() => {
    const getUserDetails = async () => {
      await getUser();
    };

    getUserDetails();
  }, []);

  return (
    <View className="flex-row items-center justify-between w-full">
      <Text className="font-bold text-white text-2xl">All Properties</Text>

      <View className="flex-row items-center justify-end gap-3">
        <TouchableOpacity
          onPress={() => router.push("/agent/(screens)/properties/add")}
        >
          <Ionicons name="add-outline" size={30} color={"#FFFFFF"} />
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-frenchGray-dark items-center justify-center w-[35px] h-[35px] rounded-full mr-3"
          onPress={() => router.push("/agent/profile")}
        >
          {!user.profilePicture ? (
            <Ionicons name="person-outline" size={23} color={"#FFFFFF"} />
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
