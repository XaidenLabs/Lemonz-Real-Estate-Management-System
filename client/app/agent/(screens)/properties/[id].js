import { useEffect, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useProperty } from "../../../../contexts/PropertyContext";
import About from "../../../../components/agent/properties/tabs/About";
import Gallery from "../../../../components/agent/properties/tabs/Gallery";
import Review from "../../../../components/agent/properties/tabs/Review";
import { formatPrice } from "../../../../services/formatPrice";
import { SharedElement } from "react-navigation-shared-element";

const PropertyDetails = () => {
  const params = useLocalSearchParams();
  const { getProperty, property, propertyLoading, updateProperty } =
    useProperty();
  const [activeTab, setActiveTab] = useState("about");
  const [userId, setUserId] = useState("");
  const [scrollY] = useState(new Animated.Value(0));

  const headerHeight = scrollY.interpolate({
    inputRange: [0, 350],
    outputRange: [350, 250],
    extrapolate: "clamp",
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 350],
    outputRange: [1, 0.8],
    extrapolate: "clamp",
  });

  const getUserId = async () => {
    try {
      return (await AsyncStorage.getItem("userId")) || "";
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    const fetchUserId = async () => {
      const id = await getUserId();
      setUserId(id);
    };
    fetchUserId();
  }, []);

  useEffect(() => {
    const getPropertyDetails = async () => {
      if (params?.id) {
        try {
          await getProperty(params.id);
        } catch (error) {}
      }
    };
    getPropertyDetails();
  }, [params?.id]);

  if (propertyLoading || !property) {
    return (
      <SafeAreaView className="flex-1 bg-darkUmber-dark justify-center items-center">
        <ActivityIndicator size="large" color="#BBCC13" />
      </SafeAreaView>
    );
  }

  const handleAdvertise = () => {
    router.push(`/agent/advertise?propertyId=${property._id}`);
  };

  const renderTabButton = (tabName, icon) => (
    <TouchableOpacity
      className={`px-6 py-3 rounded-full flex-row items-center space-x-2
                ${activeTab === tabName ? "bg-chartreuse" : "bg-darkUmber-light"}`}
      onPress={() => setActiveTab(tabName)}
    >
      <MaterialCommunityIcons
        name={icon}
        size={20}
        color={activeTab === tabName ? "#1A1A1A" : "#BBCC13"}
      />
      <Text
        className={`text-base ${activeTab === tabName ? "text-darkUmber-dark font-rbold" : "text-white font-rregular"}`}
      >
        {tabName.charAt(0).toUpperCase() + tabName.slice(1)}
      </Text>
    </TouchableOpacity>
  );

  const handleUpdateProperty = async () => {
    if (property?._id) {
      try {
        await updateProperty(property._id);
      } catch (error) {}
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-darkUmber-dark">
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1"
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false },
        )}
        scrollEventThrottle={16}
      >
        <Animated.View className="relative" style={{ height: headerHeight }}>
          <Animated.Image
            source={{ uri: property?.images?.[0] || null }}
            className="w-full h-full"
            resizeMode="cover"
            style={{ opacity: headerOpacity }}
          />
          <View className="absolute top-4 w-full flex-row justify-between px-4">
            <TouchableOpacity
              className="bg-transparentBlack rounded-full p-3"
              onPress={() => router.back()}
            >
              <Ionicons name="chevron-back-outline" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View className="absolute bottom-0 left-0 right-0 bg-darkUmber-light px-4 py-6 rounded-t-3xl">
            <View className="flex-row justify-between items-start mb-4">
              <View className="flex-1">
                <Text className="text-white text-2xl font-rbold mb-2">
                  {property?.title || "Property Title"}
                </Text>
                <View className="flex-row items-center">
                  <Ionicons name="location-outline" size={20} color="#BBCC13" />
                  <Text className="text-white text-base ml-2 font-rregular">
                    {property?.country || "Location"}
                  </Text>
                </View>
              </View>

              <View className="items-end">
                <View className="bg-chartreuse px-4 py-2 rounded-full mb-2">
                  <Text className="text-darkUmber-dark font-rbold">
                    For {property?.status || "Sale"}
                  </Text>
                </View>
                <Text className="text-chartreuse text-xl font-rmedium">
                  {property?.currency ? property.currency.split(" - ")[1] : ""}{" "}
                  {formatPrice(property?.price || 0)}
                  {property?.status === "Sale" ? "" : "/year"}
                </Text>
              </View>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="flex-row space-x-4"
            >
              {renderTabButton("about", "information-outline")}
              {renderTabButton("gallery", "image-multiple-outline")}
              {renderTabButton("review", "star-outline")}
            </ScrollView>
          </View>
        </Animated.View>

        <View className="px-3 py-6">
          {activeTab === "about" && property && (
            <SharedElement id={`property.${property._id}.about`}>
              <About
                description={property?.description}
                document={property?.document}
                coordinates={property?.coordinates}
              />
            </SharedElement>
          )}

          {activeTab === "gallery" && property && (
            <SharedElement id={`property.${property._id}.gallery`}>
              <Gallery photos={property.images} video={property.video} />
            </SharedElement>
          )}

          {activeTab === "review" && property && (
            <SharedElement id={`property.${property._id}.review`}>
              <Review propertyId={property._id} />
            </SharedElement>
          )}

          <TouchableOpacity
            className="mt-6 bg-chartreuse p-4 rounded-lg items-center"
            onPress={handleAdvertise}
          >
            <Text className="text-darkUmber-dark font-rbold text-lg">
              Advertise
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
};

export default PropertyDetails;
