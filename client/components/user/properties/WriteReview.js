import { useState } from "react";
import { View, Text, TouchableOpacity, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import RatingsSummary from "../../common/RatingsSummary";

const WriteReview = ({
  setShowReviewForm,
  createReview,
  propertyId,
  loading,
}) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const handleStarPress = (index) => {
    setRating(index + 1);
  };

  const handleSubmit = () => {
    createReview(comment, rating, propertyId);
    setShowReviewForm(false);
  };

  return (
    <View className="relative">
      <TouchableOpacity
        className="absolute right-2 top-2 z-10"
        onPress={() => setShowReviewForm(false)}
      >
        <Ionicons name="close" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      <View className="mb-6">
        <Text className="font-rbold text-2xl text-chartreuse">
          What do you think?
        </Text>
        <Text className="font-rregular text-md text-white mb-2">
          Give your rating and comment below
        </Text>
        {avgRating > 0 && (
          <View className="flex-row items-center">
            <RatingsSummary avgRating={avgRating} ratingsCount={ratingsCount} />
            <Text className="text-frenchGray-light font-rregular text-sm ml-2">
              Current Rating
            </Text>
          </View>
        )}
      </View>

      <View className="flex-row items-center justify-center mb-4">
        {[...Array(5)].map((_, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => handleStarPress(index)}
            className="mx-1"
          >
            <Ionicons
              name={rating > index ? "star" : "star-outline"}
              size={30}
              color={rating > index ? "#BBCC13" : "#FFFFFF"}
            />
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        className="w-full h-24 bg-darkUmber-light text-white p-4 rounded-lg mb-4"
        placeholder="Write your comment..."
        placeholderTextColor="#57606D"
        multiline
        value={comment}
        onChangeText={(text) => setComment(text)}
        style={{ textAlignVertical: "top" }}
      />

      <TouchableOpacity
        className="bg-chartreuse py-3 rounded-lg items-center"
        onPress={handleSubmit}
      >
        <Text className="font-rbold text-darkUmber-dark">
          {loading ? "Loading..." : "Submit Review"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default WriteReview;
