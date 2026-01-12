import { View, Text } from "react-native";

const NotificationBadge = ({ count }) => {
  if (!count) return null;

  return (
    <View className="absolute -top-1 -right-1 bg-chartreuse rounded-full min-w-[18px] h-[18px] items-center justify-center">
      <Text className="text-darkUmber-dark text-xs font-rbold">
        {count > 99 ? "99+" : count}
      </Text>
    </View>
  );
};

export default NotificationBadge;
