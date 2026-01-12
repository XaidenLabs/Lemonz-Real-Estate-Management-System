import { createContext, useContext, useState } from "react";
import axios from "axios";
import { config } from "../config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getToken } from "../services/getToken";

const ReviewContext = createContext();

export const ReviewProvider = ({ children }) => {
  const [reviews, setReviews] = useState([]);
  const [reviewError, setReviewError] = useState("");
  const [reviewMessage, setReviewMessage] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);

  const createReview = async (text, rating, propertyId) => {
    const token = await getToken();
    setReviewLoading(true);

    try {
      const response = await axios.post(
        `${config.API_BASE_URL}/api/reviews`,
        { text, rating, propertyId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setReviewMessage(response.data.message);

      setTimeout(() => {
        setReviewMessage("");
      }, 3000);
    } catch (error) {
      if (error.response.data.message === "Please, authenticate") {
        await AsyncStorage.removeItem("token");
        router.replace("/login");
      }

      setReviewError(error.response.data.message);
      setTimeout(() => {
        setReviewError("");
      }, 3000);
    } finally {
      setReviewLoading(true);
    }
  };

  const getReviews = async (propertyId) => {
    const token = await getToken();
    setReviewLoading(true);

    try {
      const response = await axios.get(
        `${config.API_BASE_URL}/api/reviews/${propertyId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setReviews(response.data.reviews);
    } catch (error) {
      if (error.response.data.message === "Please, authenticate") {
        await AsyncStorage.removeItem("token");
        router.replace("/login");
      }
    } finally {
      setReviewLoading(false);
    }
  };

  return (
    <ReviewContext.Provider
      value={{
        reviews,
        createReview,
        getReviews,
        reviewError,
        setReviewError,
        reviewMessage,
        setReviewMessage,
        reviewLoading,
      }}
    >
      {children}
    </ReviewContext.Provider>
  );
};

export const useReview = () => useContext(ReviewContext);
