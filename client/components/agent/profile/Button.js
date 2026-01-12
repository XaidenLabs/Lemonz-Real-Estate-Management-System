import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const Button = ({ icon, text, onClick }) => {
  return (
    <TouchableOpacity
      className="w-full bg-frenchGray-dark p-4 rounded-lg flex-row items-center justify-between my-2"
      onPress={onClick}
    >
      <View className="flex-row items-center justify-start gap-3">
        <Ionicons name={icon} size={18} color={"#BBCC13"} />
        <Text className="text-white font-rbold">{text}</Text>
      </View>
      <Ionicons name="chevron-forward-outline" size={18} color={"#FFFFFF"} />
    </TouchableOpacity>
  );
};

export default Button;
