import { router } from "expo-router";
import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { formatPrice } from "../../../services/formatPrice";

const Listing = ({ properties }) => {
  return (
    <View>
      {properties.map((property) => (
        <TouchableOpacity
          key={property._id}
          onPress={() => router.push(`/agent/properties/${property._id}`)}
          className="my-4 bg-transparentWhite rounded-lg p-4"
        >
          <Image
            source={{ uri: property.images[0] }}
            className="w-full h-[150px] rounded-lg mb-2"
            resizeMode="cover"
          />
          <Text className="text-chartreuse font-rsemibold text-lg">
            {property.title}
          </Text>
          <Text className="text-white font-rregular mb-2">
            {property.description.substring(0, 100)}...
          </Text>
          <Text className="text-white font-rbold text-xl">
            {property?.currency.split(" - ")[1]} {formatPrice(property.price)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default Listing;
