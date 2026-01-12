import { useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import { useProperty } from "../../contexts/PropertyContext";
import { formatPrice } from "../../services/formatPrice";
import { router } from "expo-router";

const NewListings = () => {
  const { getProperties, newListings } = useProperty();

  useEffect(() => {
    const fetchProperties = async () => {
      await getProperties();
    };

    fetchProperties();
  }, []);

  return (
    <>
      {newListings.length > 0 && (
        <View className="mt-[20px]">
          <Text className="text-xl font-rbold text-white ml-[20px]">
            New Listings
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 20 }}
            className="mt-[20px]"
          >
            {newListings.map((property) => (
              <TouchableOpacity
                className="ml-[20px]"
                key={property._id}
                onPress={() => router.push(`/user/properties/${property._id}`)}
              >
                <ImageBackground
                  source={{ uri: property.images[0] }}
                  resizeMode="cover"
                  style={{
                    width: 200,
                    height: 180,
                    borderRadius: 18,
                    overflow: "hidden",
                  }}
                >
                  <View className="bg-transparentBlack absolute top-0 left-0 w-full h-full" />
                  <View className="absolute bottom-0 left-0 p-2 flex-row items-center justify-between w-full">
                    <View>
                      <Text className="text-xl font-rbold text-white">
                        {property.title}
                      </Text>
                      <Text className="text-lg font-rbold text-gray-400">
                        {property.currency
                          ? property.currency.split(" - ")[1]
                          : ""}{" "}
                        {formatPrice(property?.price)}
                      </Text>
                    </View>
                  </View>
                </ImageBackground>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </>
  );
};

export default NewListings;
