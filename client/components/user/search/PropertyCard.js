import { View, Text, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { formatPrice } from "../../../services/formatPrice";
import { router } from "expo-router";
import VerifiedBadge from "../../common/VerifiedBadge";
import RatingsSummary from "../../common/RatingsSummary";
import { useAuth } from "../../../contexts/AuthContext";

const PropertyCard = ({ property, onLikePress, showLikeButton = true }) => {
  const { user } = useAuth();
  const isBuyer = user?.role === "buyer";

  return (
    <View className="relative w-[48%] bg-frenchGray-light rounded-lg overflow-hidden mb-4">
      <Image
        source={{ uri: property.images[0] }}
        resizeMode="cover"
        className="h-[150px] w-full rounded-s-md"
      />

      {showLikeButton && (
        <TouchableOpacity
          className="absolute top-2 right-2 p-2 rounded-full bg-transparentBlack items-center justify-center"
          onPress={() => onLikePress(property._id)}
        >
          <Ionicons
            name={
              property.savedBy?.includes(user?._id) ? "heart" : "heart-outline"
            }
            color="#BBCC13"
            size={19}
          />
        </TouchableOpacity>
      )}

      <TouchableOpacity
        className="p-2"
        onPress={() => router.push(`/user/properties/${property._id}`)}
      >
        <View className="flex-row items-center">
          <Text className="text-white font-rbold text-lg flex-1">
            {property.title}
          </Text>
          {property.isVerified && <VerifiedBadge />}
        </View>

        {property.avgRating > 0 && (
          <View className="mt-1">
            <RatingsSummary
              avgRating={property.avgRating}
              ratingsCount={property.ratingsCount}
              size="sm"
            />
          </View>
        )}

        <View className="flex-row items-center justify-start flex-1 mt-1">
          <Ionicons name="location-outline" color="#BBCC13" size={18} />
          <Text className="font-rregular text-[14px] text-white ml-1">
            {property.country}
          </Text>
        </View>

        <View className="flex-row items-center justify-start flex-1 mt-1">
          <Ionicons name="pricetag-outline" color="#BBCC13" size={18} />
          <Text className="text-sm font-rbold text-white ml-1">
            {property.currency ? property.currency.split(" - ")[1] : ""}{" "}
            {formatPrice(property?.price)}{" "}
            {property.status === "Sale" ? "" : "/year"}
          </Text>
        </View>

        {!isBuyer && (
          <View className="flex-row items-center justify-start flex-1 mt-2">
            <View className="flex-row items-center mr-3">
              <Ionicons name="heart" color="#BBCC13" size={16} />
              <Text className="text-xs font-rregular text-white ml-1">
                {property.likes || 0}
              </Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="eye" color="#BBCC13" size={16} />
              <Text className="text-xs font-rregular text-white ml-1">
                {property.videoViews || 0}
              </Text>
            </View>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default PropertyCard;
