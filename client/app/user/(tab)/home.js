import { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  TextInput,
  Image,
  RefreshControl,
  ImageBackground,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { useProperty } from "../../../contexts/PropertyContext";
import { useAuth } from "../../../contexts/AuthContext";
import OnboardingTutorial from "../../../components/common/OnboardingTutorial";
import Skeleton from "../../../components/common/Skeleton";
import { formatPrice } from "../../../services/formatPrice";
import FilterBottomSheet from "../../../components/user/FilterBottomSheet";

// --- Components ---

const CategoryPill = ({ label, active, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    className={`flex-row items-center px-4 py-2 mr-3 rounded-full border ${
      active ? "bg-white border-white" : "bg-transparent border-gray-600"
    }`}
  >
    <Text
      className={`font-rbold text-sm ${
        active ? "text-black" : "text-gray-300"
      }`}
    >
      {label}
    </Text>
  </TouchableOpacity>
);

const PropertyCard = ({ property, onPress }) => (
  <TouchableOpacity activeOpacity={0.9} onPress={onPress} className="mb-8">
    <View className="relative w-full h-[280px] rounded-[30px] overflow-hidden bg-gray-800">
      <ImageBackground
        source={{ uri: property.images[0] }}
        className="w-full h-full"
        resizeMode="cover"
      >
        <View className="absolute top-4 right-4 bg-white rounded-full p-2">
          <Ionicons
            name="arrow-forward-outline"
            size={20}
            color="black"
            style={{ transform: [{ rotate: "-45deg" }] }}
          />
        </View>
      </ImageBackground>
    </View>

    <View className="mt-4 px-2">
      <View className="flex-row justify-between items-start">
        <View className="flex-1 mr-4">
          <Text
            className="text-white text-xl font-rbold mb-1"
            numberOfLines={1}
          >
            {property.title}
          </Text>
          <Text
            className="text-gray-400 text-sm font-rregular"
            numberOfLines={1}
          >
            {property.address}
          </Text>
        </View>
        <Text className="text-white text-xl font-rbold">
          {formatPrice(property.price)}
        </Text>
      </View>

      <View className="flex-row mt-4 space-x-4">
        <View className="flex-row items-center bg-[#2B3B3C] px-3 py-1.5 rounded-xl">
          <Ionicons name="bed-outline" size={16} color="#ECA154" />
          <Text className="text-white ml-2 text-xs font-rregular">
            {property.bedrooms || 0} Beds
          </Text>
        </View>
        <View className="flex-row items-center bg-[#2B3B3C] px-3 py-1.5 rounded-xl">
          <Ionicons name="water-outline" size={16} color="#ECA154" />
          <Text className="text-white ml-2 text-xs font-rregular">
            {property.bathrooms || 0} Baths
          </Text>
        </View>
        <View className="flex-row items-center bg-[#2B3B3C] px-3 py-1.5 rounded-xl">
          <Ionicons name="expand-outline" size={16} color="#ECA154" />
          <Text className="text-white ml-2 text-xs font-rregular">
            {property.size || 0} m²
          </Text>
        </View>
      </View>
    </View>
  </TouchableOpacity>
);

const PropertySkeleton = () => (
  <View className="mb-8">
    <Skeleton
      width="100%"
      height={280}
      borderRadius={30}
      style={{ marginBottom: 16 }}
    />
    <View className="px-2">
      <View className="flex-row justify-between mb-2">
        <Skeleton width={180} height={24} />
        <Skeleton width={80} height={24} />
      </View>
      <Skeleton width={150} height={16} style={{ marginBottom: 16 }} />
      <View className="flex-row gap-3">
        <Skeleton width={70} height={30} borderRadius={12} />
        <Skeleton width={70} height={30} borderRadius={12} />
        <Skeleton width={70} height={30} borderRadius={12} />
      </View>
    </View>
  </View>
);

const USER_KEY = "onboarding_seen_v1";

const Home = () => {
  const { getProperties, properties, propertyLoading } = useProperty();
  const { user } = useAuth();

  const [showTutorial, setShowTutorial] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [country, setCountry] = useState("");
  const [category, setCategory] = useState("All"); // Integrated Category
  const [status, setStatus] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const categories = ["All", "House", "Apartment", "Land", "Commercial"];

  useEffect(() => {
    getProperties();
  }, []);

  // Tutorial Logic
  useEffect(() => {
    (async () => {
      try {
        const role = await AsyncStorage.getItem("role");
        const seen = await AsyncStorage.getItem(USER_KEY);
        if (role !== "agent" && seen !== "true") {
          setShowTutorial(true);
        }
      } catch (err) {}
    })();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await getProperties();
    setRefreshing(false);
  };

  // Advanced Filtering Logic
  const filteredProperties = useMemo(() => {
    return properties.filter((p) => {
      const pTitle = p.title || "";
      const pAddress = p.address || "";
      const pType = p.type || "";
      const pAction = p.action || "";

      // 1. Text Search (Token-based)
      const searchTerms = searchQuery
        .toLowerCase()
        .trim()
        .split(/\s+/)
        .filter(Boolean);
      const searchSource =
        `${pTitle} ${pAddress} ${pType} ${pAction}`.toLowerCase();
      const matchesSearch =
        searchTerms.length === 0 ||
        searchTerms.every((term) => searchSource.includes(term));

      // 2. Country/Location Filter
      const matchesCountry =
        !country || pAddress.toLowerCase().includes(country.toLowerCase());

      // 3. Category/Type Filter
      const matchesCategory =
        category === "All" ||
        !category ||
        pType.toLowerCase().includes(category.toLowerCase());

      // 4. Status Filter
      const matchesStatus =
        !status || pAction.toLowerCase() === status.toLowerCase();

      // 5. Price Range
      const price = parseFloat(p.price);
      const min = minPrice ? parseFloat(minPrice) : 0;
      const max = maxPrice ? parseFloat(maxPrice) : Infinity;
      const matchesPrice = price >= min && price <= max;

      return (
        matchesSearch &&
        matchesCountry &&
        matchesCategory &&
        matchesStatus &&
        matchesPrice
      );
    });
  }, [properties, searchQuery, country, category, status, minPrice, maxPrice]);

  const activeFiltersCount = [
    country,
    category !== "All",
    status,
    minPrice,
    maxPrice,
  ].filter(Boolean).length;

  return (
    <View className="flex-1 bg-[#1A1D1E]">
      <StatusBar backgroundColor="#1A1D1E" barStyle="light-content" />

      <OnboardingTutorial
        role="user"
        visible={showTutorial}
        onDone={() => setShowTutorial(false)}
      />

      <SafeAreaView className="flex-1">
        <View className="px-4 py-2 flex-1">
          {/* Header Title */}
          <View className="flex-row justify-between items-center mb-6">
            <View>
              <Text className="text-gray-400 text-sm font-rregular">
                Current Location
              </Text>
              <View className="flex-row items-center">
                <Ionicons name="location" size={16} color="#BBCC13" />
                <Text className="text-white text-base font-rbold ml-1">
                  Lagos, Nigeria
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => router.push("/user/profile")}>
              {user?.profilePicture ? (
                <Image
                  source={{ uri: user.profilePicture }}
                  className="w-10 h-10 rounded-full border border-gray-600"
                />
              ) : (
                <View className="w-10 h-10 rounded-full bg-gray-700 items-center justify-center border border-gray-600">
                  <Ionicons name="person" size={20} color="#BBCC13" />
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View className="flex-row items-center bg-white rounded-full h-14 px-4 mb-6">
            <Ionicons name="search-outline" size={24} color="#000" />
            <TextInput
              placeholder="Search any unit..."
              placeholderTextColor="#666"
              className="flex-1 ml-3 text-black font-rregular text-base"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <TouchableOpacity
              className="ml-2 relative"
              onPress={() => setIsBottomSheetOpen(true)}
            >
              <Ionicons
                name="options-outline"
                size={24}
                color={activeFiltersCount > 0 ? "#BBCC13" : "#000"}
              />
              {activeFiltersCount > 0 && (
                <View className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-white" />
              )}
            </TouchableOpacity>
          </View>

          {/* Categories */}
          <View className="mb-6">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {categories.map((cat) => (
                <CategoryPill
                  key={cat}
                  label={cat}
                  active={category === cat}
                  onPress={() => setCategory(cat)}
                />
              ))}
            </ScrollView>
          </View>

          {/* Results Header (if searching/filtering) */}
          {(searchQuery || activeFiltersCount > 0) && (
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-white font-rbold text-lg">
                Results ({filteredProperties.length})
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setSearchQuery("");
                  setCountry("");
                  setCategory("All");
                  setStatus("");
                  setMinPrice("");
                  setMaxPrice("");
                }}
              >
                <Text className="text-[#BBCC13] font-rregular text-sm">
                  Clear All
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Property List */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#BBCC13"
              />
            }
          >
            {propertyLoading || refreshing ? (
              <>
                <PropertySkeleton />
                <PropertySkeleton />
              </>
            ) : filteredProperties.length === 0 ? (
              <View className="items-center justify-center py-20">
                <Ionicons name="home-outline" size={48} color="#4B5563" />
                <Text className="text-gray-500 mt-4 font-rregular">
                  No properties found.
                </Text>
              </View>
            ) : (
              filteredProperties.map((property) => (
                <PropertyCard
                  key={property._id}
                  property={property}
                  onPress={() =>
                    router.push(`/user/properties/${property._id}`)
                  }
                />
              ))
            )}
          </ScrollView>
        </View>

        {/* Filter Modal */}
        <FilterBottomSheet
          isBottomSheetOpen={isBottomSheetOpen}
          setIsBottomSheetOpen={setIsBottomSheetOpen}
          country={country}
          setCountry={setCountry}
          category={category} // Pass shared state
          setCategory={setCategory}
          status={status}
          setStatus={setStatus}
          minPrice={minPrice}
          setMinPrice={setMinPrice}
          maxPrice={maxPrice}
          setMaxPrice={setMaxPrice}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          fetchSearchedProperties={() => {}} // Not needed as we use client-side filtering via useMemo/useEffect
        />
      </SafeAreaView>
    </View>
  );
};

export default Home;
