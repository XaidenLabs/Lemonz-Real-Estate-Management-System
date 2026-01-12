import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const VerifiedBadge = ({ badge = "✔️", size = 16 }) => {
  return (
    <View className="flex-row items-center ml-1">
      <Text className="text-chartreuse font-rbold" style={{ fontSize: size }}>
        {badge}
      </Text>
      <Ionicons name="checkmark-circle" size={size} color="#BBCC13" />
    </View>
  );
};

export default VerifiedBadge;
