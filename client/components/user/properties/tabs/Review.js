import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useReview } from "../../../../contexts/ReviewContext";
import WriteReview from "../WriteReview";
import ErrorOrMessageModal from "../../../common/ErrorOrMessageModal";
import UserReview from "../UserReview";
import { useAuth } from "../../../../contexts/AuthContext";

const Review = ({ propertyId }) => {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const {
    createReview,
    getReviews,
    reviews,
    reviewLoading,
    reviewMessage,
    reviewError,
    setReviewError,
    setReviewMessage,
  } = useReview();

  const { getUser, user } = useAuth();

  useEffect(() => {
    const fetchUser = async () => {
      await getUser();
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const fetchReviews = async () => {
      await getReviews(propertyId);
    };

    fetchReviews();
  }, []);

  return (
    <ScrollView className="p-6">
      {!showReviewForm ? (
        <View>
          <Text className="font-rbold text-2xl text-chartreuse mb-6">
            Reviews
          </Text>

          <TouchableOpacity
            className="bg-frenchGray-dark rounded-md p-4 mt-4 flex-row items-center justify-start"
            onPress={() => setShowReviewForm(true)}
          >
            <Ionicons name="pencil-outline" color={"#BBCC13"} size={18} />
            <Text className="font-rregular text-white ml-2">
              Write a Review
            </Text>
          </TouchableOpacity>

          {reviews.length === 0 ? (
            <View className="mt-4 flex-row items-center justify-center">
              <Text className="text-white font-rregular">No reviews yet.</Text>
            </View>
          ) : (
            reviews.map((review) => (
              <UserReview key={review?._id} review={review} user={user} />
            ))
          )}
        </View>
      ) : (
        <WriteReview
          setShowReviewForm={setShowReviewForm}
          createReview={createReview}
          propertyId={propertyId}
          loading={reviewLoading}
        />
      )}

      {reviewMessage && (
        <ErrorOrMessageModal
          visible={reviewMessage !== ""}
          modalType="success"
          onClose={() => setReviewMessage("")}
          text={reviewMessage}
        />
      )}

      {reviewError && (
        <ErrorOrMessageModal
          visible={reviewError !== ""}
          modalType="error"
          onClose={() => setReviewError("")}
          text={reviewMessage}
        />
      )}
    </ScrollView>
  );
};

export default Review;
