import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SharedElement } from "react-navigation-shared-element";
import { useProperty } from "../../../../contexts/PropertyContext";
import About from "../../../../components/user/properties/tabs/About";
import Gallery from "../../../../components/user/properties/tabs/Gallery";
import Review from "../../../../components/user/properties/tabs/Review";
import { formatPrice } from "../../../../services/formatPrice";
import { apiFetch } from "../../../../services/api";
import { getToken } from "../../../../services/getToken";

const PropertyDetails = () => {
  const params = useLocalSearchParams();
  const { getProperty, property, propertyLoading, updateProperty } =
    useProperty();
  const [activeTab, setActiveTab] = useState("about");
  const [userId, setUserId] = useState("");
  const [scrollY] = useState(new Animated.Value(0));
  const [saving, setSaving] = useState(false);

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

  useEffect(() => {
    (async () => {
      try {
        const id = (await AsyncStorage.getItem("userId")) || "";
        setUserId(id);
      } catch (err) {}
    })();
  }, []);

  useEffect(() => {
    if (params?.id) getProperty(params.id);
  }, [params?.id]);

  if (propertyLoading || !property) {
    return (
      <SafeAreaView className="flex-1 bg-darkUmber-dark justify-center items-center">
        <ActivityIndicator size="large" color="#BBCC13" />
      </SafeAreaView>
    );
  }

  const renderTabButton = (tabName, icon) => (
    <TouchableOpacity
      key={tabName}
      className={`px-6 py-3 rounded-full flex-row items-center space-x-2 ${activeTab === tabName ? "bg-chartreuse" : "bg-darkUmber-light"}`}
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

  // NEW: toggle save/unsave via API (optimistic update)
  const handleToggleSave = async () => {
    if (!property || !property._id) return;
    if (!userId)
      return Alert.alert("Not signed in", "Please sign in to save properties.");

    // optimistic local update
    const alreadySaved =
      Array.isArray(property.savedBy) &&
      property.savedBy.some((id) => id.toString() === userId.toString());
    const optimisticProperty = { ...property };

    if (!alreadySaved) {
      optimisticProperty.savedBy = [
        ...(optimisticProperty.savedBy || []),
        userId,
      ];
      optimisticProperty.savedCount = (optimisticProperty.savedCount || 0) + 1;
    } else {
      optimisticProperty.savedBy = (optimisticProperty.savedBy || []).filter(
        (id) => id.toString() !== userId.toString(),
      );
      optimisticProperty.savedCount = Math.max(
        (optimisticProperty.savedCount || 1) - 1,
        0,
      );
    }

    // update UI via context if you have setProperty/update function
    try {
      setSaving(true);
      // attempt API toggle
      const token = await getToken();
      const resp = await apiFetch(`/api/property/${property._id}/save`, {
        method: "POST",
        token,
      });

      // If API returns updated property, let the context/updateProperty handle it
      if (resp && resp.property) {
        // if you have updateProperty in context expecting full body, call it
        try {
          await updateProperty(resp.property._id); // keep compatibility with your context function if it refetches
        } catch (e) {
          // fallback: nothing
        }
      } else {
        // if response shape is different, update the property optimistically in the context
        try {
          await updateProperty(property._id);
        } catch (e) {}
      }
    } catch (err) {
      // revert optimistic UI & warn
      Alert.alert(
        "Save failed",
        err.message || "Could not save property. Please try again.",
      );
      try {
        await updateProperty(property._id); // refetch to correct UI
      } catch (e) {}
    } finally {
      setSaving(false);
    }
  };

  // Safer openChat with logging, guard & two navigation fallbacks
  const openChat = () => {
    try {
      console.warn("openChat called", {
        paramsId: params?.id,
        propertyId: property?._id,
        agentId: property?.agentId,
      });

      if (!property || !property.agentId) {
        Alert.alert(
          "Can't open chat",
          "Property has no agent set. Please try again later.",
        );
        return;
      }

      const pathname = `/user/(screens)/chat/${property.agentId}`;
      const navParams = {
        id: property.agentId,
        name: property.agentName,
        profilePicture: property.agentProfilePicture,
        propertyId: property._id,
        propertyTitle: property.title,
        ownerContact: property.agentContact,
      };

      try {
        router.push({ pathname, params: navParams });
        return;
      } catch (e) {
        console.warn(
          "Object router.push failed, trying string route fallback:",
          e?.message || e,
        );
      }

      const qp = [
        `name=${encodeURIComponent(property.agentName || "")}`,
        `profilePicture=${encodeURIComponent(property.agentProfilePicture || "")}`,
        `propertyId=${encodeURIComponent(property._id)}`,
        `propertyTitle=${encodeURIComponent(property.title || "")}`,
        `ownerContact=${encodeURIComponent(property.agentContact || "")}`,
      ].join("&");

      router.push(`/user/(screens)/chat/${property.agentId}?${qp}`);
    } catch (err) {
      console.error("openChat error:", err);
      Alert.alert("Navigation error", err.message || String(err));
    }
  };

  const alreadySaved =
    Array.isArray(property.savedBy) &&
    property.savedBy.some((id) => id.toString() === userId.toString());

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

            <View className="flex-row space-x-3">
              <TouchableOpacity
                className="bg-transparentBlack rounded-full p-3"
                onPress={handleToggleSave}
                disabled={saving}
                accessibilityLabel={
                  alreadySaved ? "Unsave property" : "Save property"
                }
              >
                <Ionicons
                  name={alreadySaved ? "heart" : "heart-outline"}
                  color={alreadySaved ? "#BBCC13" : "#FFFFFF"}
                  size={24}
                />
              </TouchableOpacity>

              <TouchableOpacity
                className="bg-transparentBlack rounded-full p-3"
                onPress={openChat}
                accessible
                accessibilityLabel="Open chat with owner"
                accessibilityRole="button"
              >
                <Ionicons
                  name="chatbubble-ellipses-outline"
                  size={24}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
            </View>
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
                description={property.description}
                proprietorName={property.agentName}
                proprietorContact={property.agentContact}
                companyName={property.companyName}
                proprietorProfilePic={property.agentProfilePicture}
                proprietorIsVerified={property.agentIsVerified}
                proprietorCompletedCount={property.agentCompletedSalesCount}
                document={property.document}
                isDocumentPublic={property.isDocumentPublic}
                proprietorId={property.agentId}
                coordinates={property.coordinates}
                propertyId={property._id}
                propertyTitle={property.title}
                ownerContact={property.agentContact}
              />
            </SharedElement>
          )}

          {activeTab === "gallery" && property && (
            <SharedElement id={`property.${property._id}.gallery`}>
              <Gallery
                photos={property.images}
                video={property.video}
                propertyId={property._id}
              />
            </SharedElement>
          )}

          {activeTab === "review" && property && (
            <SharedElement id={`property.${property._id}.review`}>
              <Review propertyId={property._id} />
            </SharedElement>
          )}
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
};

export default PropertyDetails;
