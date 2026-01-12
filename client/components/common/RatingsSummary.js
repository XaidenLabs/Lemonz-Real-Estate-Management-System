import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const RatingsSummary = ({ avgRating, ratingsCount, size = "md" }) => {
  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(avgRating);
    const hasHalfStar = avgRating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Ionicons
            key={i}
            name="star"
            size={size === "sm" ? 16 : 20}
            color="#BBCC13"
          />,
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <Ionicons
            key={i}
            name="star-half"
            size={size === "sm" ? 16 : 20}
            color="#BBCC13"
          />,
        );
      } else {
        stars.push(
          <Ionicons
            key={i}
            name="star-outline"
            size={size === "sm" ? 16 : 20}
            color="#BBCC13"
          />,
        );
      }
    }
    return stars;
  };

  return (
    <View className="flex-row items-center">
      <View className="flex-row items-center mr-2">{renderStars()}</View>
      <Text
        className={`text-white font-rregular ${
          size === "sm" ? "text-xs" : "text-sm"
        }`}
      >
        ({ratingsCount})
      </Text>
    </View>
  );
};

export default RatingsSummary;
