import React, { useEffect } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Animated,
  Dimensions,
  Modal,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { height } = Dimensions.get("window");

const FilterBottomSheet = ({
  isBottomSheetOpen,
  setIsBottomSheetOpen,
  country,
  setCountry,
  category,
  setCategory,
  status,
  setStatus,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  searchQuery,
  setSearchQuery,
  fetchSearchedProperties,
}) => {
  const slideAnim = new Animated.Value(isBottomSheetOpen ? 0 : height);

  const toggleBottomSheet = (open) => {
    Animated.timing(slideAnim, {
      toValue: open ? 0 : height,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    toggleBottomSheet(isBottomSheetOpen);
  }, [isBottomSheetOpen]);

  const handleApplyFilters = () => {
    fetchSearchedProperties(
      searchQuery,
      country,
      category,
      status,
      minPrice,
      maxPrice
    );
    setIsBottomSheetOpen(false);
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isBottomSheetOpen}
      onRequestClose={() => setIsBottomSheetOpen(false)}
    >
      <View className="flex-1 justify-end bg-transparentBlack">
        <TouchableOpacity
          className="absolute top-0 left-0 right-0 bottom-0"
          onPress={() => setIsBottomSheetOpen(false)}
        />

        <View className="bg-[#1A1D1E] rounded-t-3xl h-[85%] mt-auto w-full overflow-hidden">
          {/* Header */}
          <View className="flex-row justify-between items-center p-4 border-b border-gray-800 bg-[#1A1D1E]">
            <Text className="text-white text-xl font-rbold">
              Filter Options
            </Text>
            <TouchableOpacity
              onPress={() => setIsBottomSheetOpen(false)}
              className="bg-gray-800 p-1 rounded-full"
            >
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <ScrollView
            className="flex-1 p-4"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
          >
            <View className="mb-6">
              <Text className="text-gray-300 mb-2 font-rsemibold text-base">
                Location
              </Text>
              <TextInput
                placeholder="Enter country or city"
                value={country}
                onChangeText={setCountry}
                className="bg-[#2B3B3C] text-white p-4 rounded-xl font-rregular border border-gray-700 text-base"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View className="mb-6">
              <Text className="text-gray-300 mb-2 font-rsemibold text-base">
                Keywords
              </Text>
              <TextInput
                placeholder="e.g., pool, gym, duplex..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                className="bg-[#2B3B3C] text-white p-4 rounded-xl font-rregular border border-gray-700 text-base"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View className="mb-6">
              <Text className="text-gray-300 mb-2 font-rsemibold text-base">
                Category
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {[
                  "Lands",
                  "Houses",
                  "Shop Spaces",
                  "Office Buildings",
                  "Industrial Buildings",
                  "Apartment",
                  "Villas",
                ].map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setCategory(category === cat ? "" : cat)}
                    className={`px-4 py-2 rounded-full border ${
                      category === cat
                        ? "bg-[#BBCC13] border-[#BBCC13]"
                        : "bg-[#2B3B3C] border-gray-700"
                    }`}
                  >
                    <Text
                      className={`font-rmedium ${
                        category === cat ? "text-[#1A1D1E]" : "text-gray-300"
                      }`}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View className="mb-6">
              <Text className="text-gray-300 mb-2 font-rsemibold text-base">
                Status
              </Text>
              <View className="flex-row gap-2">
                {["Rent", "Sale", "Lease"].map((s) => (
                  <TouchableOpacity
                    key={s}
                    onPress={() => setStatus(status === s ? "" : s)}
                    className={`flex-1 py-3 rounded-xl border items-center ${
                      status === s
                        ? "bg-[#BBCC13] border-[#BBCC13]"
                        : "bg-[#2B3B3C] border-gray-700"
                    }`}
                  >
                    <Text
                      className={`font-rmedium ${status === s ? "text-[#1A1D1E]" : "text-gray-300"}`}
                    >
                      {s}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View className="flex-row justify-between mb-8">
              <View className="flex-1 mr-3">
                <Text className="text-gray-300 mb-2 font-rsemibold text-base">
                  Min Price
                </Text>
                <TextInput
                  placeholder="$0"
                  value={minPrice}
                  onChangeText={setMinPrice}
                  keyboardType="numeric"
                  className="bg-[#2B3B3C] text-white p-4 rounded-xl font-rregular border border-gray-700 text-base"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
              <View className="flex-1 ml-3">
                <Text className="text-gray-300 mb-2 font-rsemibold text-base">
                  Max Price
                </Text>
                <TextInput
                  placeholder="Any"
                  value={maxPrice}
                  onChangeText={setMaxPrice}
                  keyboardType="numeric"
                  className="bg-[#2B3B3C] text-white p-4 rounded-xl font-rregular border border-gray-700 text-base"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            <TouchableOpacity
              onPress={handleApplyFilters}
              className="bg-[#BBCC13] p-4 rounded-2xl items-center shadow-lg shadow-black/30 mb-8"
            >
              <Text className="text-[#1A1D1E] text-lg font-rbold">
                Show Results
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default FilterBottomSheet;
