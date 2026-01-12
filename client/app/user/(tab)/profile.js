import { useEffect } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../../../contexts/AuthContext";

const ProfileOption = ({ icon, label, onPress, isDestructive = false }) => (
  <TouchableOpacity
    onPress={onPress}
    style={{
      backgroundColor: "rgba(255, 255, 255, 0.05)",
      borderColor: "rgba(255, 255, 255, 0.1)",
    }}
    className="flex-row items-center justify-between p-4 mb-3 border rounded-2xl"
  >
    <View className="flex-row items-center">
      <View
        className={`w-10 h-10 rounded-full items-center justify-center ${isDestructive ? "bg-red-500/10" : "bg-[#2B3B3C]"}`}
      >
        <Ionicons
          name={icon}
          size={20}
          color={isDestructive ? "#EF4444" : "#BBCC13"}
        />
      </View>
      <Text
        className={`ml-4 text-base font-rbold ${isDestructive ? "text-red-500" : "text-white"}`}
      >
        {label}
      </Text>
    </View>
    <Ionicons name="chevron-forward" size={20} color="#6B7280" />
  </TouchableOpacity>
);

const Profile = () => {
  const { getUser, user, logout } = useAuth();

  useEffect(() => {
    const getUserDetails = async () => {
      await getUser();
    };

    getUserDetails();
  }, []);

  return (
    <View className="flex-1 bg-darkUmber-dark">
      <StatusBar backgroundColor="#1A1D1E" barStyle="light-content" />

      {/* Background Gradient */}
      <LinearGradient
        colors={["#1A1D1E", "#212A2B"]}
        style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Header Section */}
        <View className="relative h-[250px] mb-4">
          <LinearGradient
            colors={["rgba(187, 204, 19, 0.1)", "transparent"]}
            className="absolute inset-0 h-[250px]"
          />

          <SafeAreaView className="items-center justify-center flex-1 px-4">
            <View className="absolute top-4 right-4">
              <TouchableOpacity
                className="items-center justify-center w-10 h-10 rounded-full bg-white/10"
                onPress={() => router.push("/user/profile/edit")}
              >
                <Ionicons name="settings-outline" size={20} color="#FFF" />
              </TouchableOpacity>
            </View>

            {/* Profile Image with Ring */}
            <View className="p-1 mb-4 border-2 rounded-full border-chartreuse/50">
              {user?.profilePicture ? (
                <Image
                  source={{ uri: user.profilePicture }}
                  className="w-28 h-28 rounded-full"
                  resizeMode="cover"
                />
              ) : (
                <View className="items-center justify-center bg-gray-700 w-28 h-28 rounded-full">
                  <Ionicons name="person" color={"#9CA3AF"} size={50} />
                </View>
              )}
            </View>

            <Text className="text-2xl text-white font-rbold">
              {user.firstName} {user.lastName}
            </Text>
            <Text className="mt-1 text-sm text-chartreuse font-rregular">
              {user.email}
            </Text>
          </SafeAreaView>
        </View>

        {/* content */}
        <View className="px-4">
          <Text className="mb-4 text-sm text-gray-400 font-rbold uppercase">
            Account
          </Text>

          <ProfileOption
            icon="person-outline"
            label="Edit Profile"
            onPress={() => router.push("/user/profile/edit")}
          />

          {/* Can add 'Saved Properties' or 'History' here specifically for User */}

          <Text className="my-4 text-sm text-gray-400 font-rbold uppercase">
            Support & Info
          </Text>

          <ProfileOption
            icon="lock-closed-outline"
            label="Privacy Policy"
            onPress={() =>
              Linking.openURL("https://lemon-theta-seven.vercel.app")
            }
          />
          <ProfileOption
            icon="document-text-outline"
            label="Terms & Conditions"
            onPress={() =>
              Linking.openURL("https://lemon-theta-seven.vercel.app")
            }
          />
          <ProfileOption
            icon="help-circle-outline"
            label="Help & Support"
            onPress={() => Linking.openURL("mailto:support@lemon.com")}
          />

          <Text className="my-4 text-sm text-gray-400 font-rbold uppercase">
            Session
          </Text>

          <ProfileOption
            icon="log-out-outline"
            label="Sign Out"
            isDestructive
            onPress={async () => await logout()}
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default Profile;
