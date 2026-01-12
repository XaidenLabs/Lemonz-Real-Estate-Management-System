import {
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useProperty } from "../../../../contexts/PropertyContext";
import { router } from "expo-router";
import NoProperties from "../../../../components/user/NoProperties";
import { formatPrice } from "../../../../services/formatPrice";

const SavedProperties = () => {
  const { propertyLoading, savedProperties } = useProperty();

  return (
    <SafeAreaView className="h-full p-4 bg-darkUmber-dark">
      <View className="flex-row items-center mb-6">
        <TouchableOpacity
          onPress={() => router.back()}
          className="p-2 rounded-full bg-gray-700"
        >
          <Ionicons name="chevron-back-outline" color="#FFFFFF" size={24} />
        </TouchableOpacity>
        <Text className="font-rbold text-2xl text-white ml-3">
          Saved Properties
        </Text>
      </View>

      <View className="flex-1">
        {propertyLoading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#BBCC13" />
          </View>
        ) : savedProperties.length > 0 ? (
          savedProperties.map((property) => (
            <TouchableOpacity
              key={property._id}
              onPress={() => router.push(`/user/properties/${property._id}`)}
              activeOpacity={0.8}
              className="flex-row items-center bg-gray-800 rounded-lg mb-4 p-3"
            >
              <View className="w-[100px] h-[100px] rounded-lg overflow-hidden bg-gray-600">
                <Image
                  source={
                    property.images?.[0]
                      ? { uri: property.images[0] }
                      : { uri: "https://via.placeholder.com/48x48" }
                  }
                  resizeMode="cover"
                  className="w-full h-full"
                />
              </View>
              <View className="flex-1 ml-4">
                <Text
                  className="text-white font-rbold text-lg"
                  numberOfLines={1}
                >
                  {property.title}
                </Text>
                <View className="flex-row items-center mt-1">
                  <Ionicons name="location-outline" size={16} color="#BBCC13" />
                  <Text
                    className="text-frenchGray-light font-rregular text-sm ml-1"
                    numberOfLines={1}
                  >
                    {property.country}
                  </Text>
                </View>
                <Text className="text-frenchGray-light font-rregular text-sm mt-2">
                  {property.currency.split(" - ")[1]}{" "}
                  {formatPrice(property.price)}{" "}
                  {property?.status === "Sale" ? "" : "/year"}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <NoProperties />
        )}
      </View>

      <StatusBar backgroundColor="#212A2B" />
    </SafeAreaView>
  );
};

export default SavedProperties;
