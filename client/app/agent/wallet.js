import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";

const Wallet = () => {
  return (
    <SafeAreaView className="bg-darkUmber-dark h-full p-4">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-white text-2xl font-bold">Wallet</Text>
      </View>
      <View className="flex-col items-center justify-center min-h-screen mt-[-60px]">
        <Ionicons name="lock-closed-outline" size={70} color="#BBCC13" />
        <Text className="text-white font-rbold text-[30px] text-center">
          This feature is
        </Text>
        <Text className="text-white font-rbold text-[30px] text-center">
          closed for now
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default Wallet;
