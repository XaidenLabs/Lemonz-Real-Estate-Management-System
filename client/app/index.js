import React, { useState, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  Dimensions,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";

const { width, height } = Dimensions.get("window");

const Onboarding = () => {
  const router = useRouter();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const flatListRef = useRef(null);

  const slides = [
    {
      id: "1",
      title: "Welcome to Lemon Zee",
      subtitle:
        "The trusted Real Estate Manager for secure and seamless property deals.",
      description: "Experience premium real estate management with ease.",
    },
    {
      id: "2",
      title: "For Proprietors",
      subtitle: "List, Manage, and Earn.",
      description:
        "Create listings, promote verify your identity, and get paid securely via Escrow.",
    },
    {
      id: "3",
      title: "For Users",
      subtitle: "Find, Verify, and Buy.",
      description:
        "Browse verified listings, detailed descriptions, and pay securely. Your funds are safe until you seal the deal.",
    },
  ];

  const updateCurrentSlideIndex = (e) => {
    const contentOffsetX = e.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(contentOffsetX / width);
    setCurrentSlideIndex(currentIndex);
  };

  const goNextSlide = () => {
    const nextSlideIndex = currentSlideIndex + 1;
    if (nextSlideIndex != slides.length) {
      const offset = nextSlideIndex * width;
      flatListRef?.current?.scrollToOffset({ offset });
      setCurrentSlideIndex(nextSlideIndex);
    }
  };

  const Slide = ({ item }) => {
    return (
      <View style={{ width, alignItems: "center", padding: 20 }}>
        <View className="flex-1 justify-center items-center">
          {/* Placeholder for Illustration/Image if needed later */}
          <View className="w-64 h-64 bg-lemonGreen/20 rounded-full justify-center items-center mb-10 overflow-hidden">
            <Text className="text-6xl text-lemonGreen font-rbold">
              {item.title.charAt(0)}
            </Text>
          </View>
          <Text className="text-lemonGreen text-3xl font-rbold text-center mb-4">
            {item.title}
          </Text>
          <Text className="text-white text-lg font-rsemibold text-center mb-2">
            {item.subtitle}
          </Text>
          <Text className="text-gray-400 text-base font-rregular text-center px-4">
            {item.description}
          </Text>
        </View>
      </View>
    );
  };

  const Footer = () => {
    return (
      <View
        style={{
          height: height * 0.25,
          justifyContent: "space-between",
          paddingHorizontal: 20,
        }}
      >
        {/* Indicators */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            marginTop: 20,
          }}
        >
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                {
                  height: 8,
                  width: 8,
                  backgroundColor: "gray",
                  borderRadius: 4,
                  marginHorizontal: 3,
                },
                currentSlideIndex == index && {
                  backgroundColor: "#BBCC13",
                  width: 20,
                },
              ]}
            />
          ))}
        </View>

        {/* Buttons */}
        <View className="mb-10 w-full gap-y-4">
          {currentSlideIndex === slides.length - 1 ? (
            <Animated.View entering={FadeInDown.springify()}>
              <TouchableOpacity
                className="bg-lemonGreen py-4 rounded-xl items-center mb-3"
                onPress={() => router.push("/signup")}
              >
                <Text className="text-darkGrey text-lg font-rbold">
                  Get Started
                </Text>
              </TouchableOpacity>
              <View className="flex-row justify-center gap-x-2">
                <Text className="text-gray-400 font-rregular">
                  Already have an account?
                </Text>
                <TouchableOpacity onPress={() => router.push("/login")}>
                  <Text className="text-lemonGreen font-rbold">Log In</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          ) : (
            <TouchableOpacity
              className="bg-lemonGreen py-4 rounded-xl items-center"
              onPress={goNextSlide}
            >
              <Text className="text-darkGrey text-lg font-rbold">Next</Text>
            </TouchableOpacity>
          )}

          {currentSlideIndex !== slides.length - 1 && (
            <TouchableOpacity
              onPress={() => flatListRef?.current?.scrollToEnd()}
              className="items-center py-2"
            >
              <Text className="text-gray-400 font-rmedium">Skip</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-darkGrey">
      <StatusBar barStyle="light-content" backgroundColor="#212A2B" />
      <FlatList
        ref={flatListRef}
        onMomentumScrollEnd={updateCurrentSlideIndex}
        contentContainerStyle={{ height: height * 0.75 }}
        showsHorizontalScrollIndicator={false}
        horizontal
        data={slides}
        pagingEnabled
        renderItem={({ item }) => <Slide item={item} />}
      />
      <Footer />
    </SafeAreaView>
  );
};

export default Onboarding;
