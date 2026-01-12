import { Text, TouchableOpacity, ActivityIndicator } from "react-native";

const Button = ({ type, text, bg, onPress, disabled, isLoading }) => {
  return (
    <TouchableOpacity
      className={`${bg ? "bg-chartreuse" : "bg-frenchGray-dark"} p-4 rounded-lg flex-1 ${type === "user" ? "ml-2" : ""} my-1 justify-center items-center`}
      onPress={onPress}
      disabled={disabled || isLoading}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={bg ? "#212A2B" : "#BBCC13"} />
      ) : (
        <Text
          className={`${bg ? "text-darkUmber-dark" : "text-chartreuse"} text-center font-rsemibold`}
        >
          {text}
        </Text>
      )}
    </TouchableOpacity>
  );
};

export default Button;
