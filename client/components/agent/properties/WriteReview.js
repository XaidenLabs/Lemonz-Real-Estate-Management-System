import { useState } from "react";
import { View, Text, TouchableOpacity, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const WriteReview = ({
  setShowReviewForm,
  createReview,
  propertyId,
  loading,
}) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

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
          Send a message to your customers
        </Text>
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
          {loading ? "Loading..." : "Submit Comment"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default WriteReview;
