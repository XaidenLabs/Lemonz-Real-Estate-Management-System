import { View, Text } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

const NoProperties = () => {
  return (
    <View className="flex-col items-center justify-center min-h-screen">
      <Ionicons
        name="alert-circle-outline"
        size={70}
        color="#BBCC13"
        className="mb-4"
      />
      <Text className="text-white font-rbold text-xl mb-2">
        No Properties Available
      </Text>
      <Text className="text-frenchGray-light font-rlight text-center">
        We couldn't find any properties at the moment. Please check back later.
      </Text>
    </View>
  );
};

export default NoProperties;
