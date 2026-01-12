import { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useProperty } from "../../contexts/PropertyContext";
import NoProperties from "./NoProperties";
import { formatPrice } from "../../services/formatPrice";
import { router } from "expo-router";

const Categories = () => {
  const categories = [
    "Lands",
    "Houses",
    "Shop spaces",
    "Office buildings",
    "Industrial buildings",
  ];

  const [selectedCategory, setSelectedCategory] = useState(categories[0]);
  const [categoryProperties, setCategoryProperties] = useState([]);

  const {
    getProperties,
    lands,
    houses,
    shopSpaces,
    officeBuildings,
    industrialBuildings,
  } = useProperty();

  const toggleCategorySelection = (category) => {
    setSelectedCategory(category);
  };

  useEffect(() => {
    const fetchProperties = async () => {
      await getProperties();
    };

    fetchProperties();
  }, []);

  useEffect(() => {
    const updateCategoryProperties = () => {
      if (selectedCategory === "Lands") {
        setCategoryProperties(lands);
      } else if (selectedCategory === "Houses") {
        setCategoryProperties(houses);
      } else if (selectedCategory === "Shop spaces") {
        setCategoryProperties(shopSpaces);
      } else if (selectedCategory === "Office buildings") {
        setCategoryProperties(officeBuildings);
      } else if (selectedCategory === "Industrial buildings") {
        setCategoryProperties(industrialBuildings);
      }
    };

    updateCategoryProperties();
  }, [
    selectedCategory,
    lands,
    houses,
    shopSpaces,
    officeBuildings,
    industrialBuildings,
  ]);

  return (
    <View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {categories.map((category, index) => (
          <TouchableOpacity
            key={category}
            className={`p-2 px-4 m-1 rounded-full ${index === 0 ? "ml-4" : ""} ${index === categories.length - 1 ? "mr-4" : ""} ${selectedCategory === category ? "bg-chartreuse" : "bg-frenchGray-light"}`}
            onPress={() => toggleCategorySelection(category)}
          >
            <Text
              className={`text-center font-rbold text-lg ${selectedCategory === category ? "text-frenchGray-light" : "text-white"}`}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {categoryProperties.length === 0 ? (
        <NoProperties type="category" />
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: 20 }}
          className="mt-[20px]"
        >
          {categoryProperties.map((property) => (
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
                <View className="absolute bottom-0 left-0 p-2 w-full">
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
      )}
    </View>
  );
};

export default Categories;
