import { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Modal,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { images } from "../../assets/constants"; // adjust path if different

const { width, height } = Dimensions.get("window");

// storage keys (separate for agents and users)
const USER_KEY = "onboarding_seen_v1";
const AGENT_KEY = "onboarding_agent_seen_v1";

const userSlides = [
  {
    key: "u1",
    title: "Find properties fast",
    description:
      "Browse curated listings near you. Save favorites and get notified when prices change.",
    image: images.buyer || images.logo,
  },
  {
    key: "u2",
    title: "Message owners securely",
    description:
      "Chat with property owners and agents inside the app to ask questions and book viewings.",
    image: images.transaction || images.logo,
  },
  {
    key: "u3",
    title: "Safe payments & receipts",
    description:
      "Pay securely inside the app and get an electronic receipt — we hold funds until both parties confirm.",
    image: images.getStarted || images.logo,
  },
];

const agentSlides = [
  {
    key: "a1",
    title: "Showcase your properties",
    description: "Easily list rentals, leases and sales to reach more clients.",
    image: images.agent || images.logo,
  },
  {
    key: "a2",
    title: "Track performance",
    description: "View analytics on property views, leads and conversions.",
    image: images.transaction || images.logo,
  },
  {
    key: "a3",
    title: "Manage everything in one place",
    description: "Dashboard, metrics, and secure payments built in.",
    image: images.getStarted || images.logo,
  },
];

const Dot = ({ active }) => (
  <View
    style={{
      width: active ? 18 : 8,
      height: 8,
      borderRadius: 8,
      marginHorizontal: 4,
      backgroundColor: active ? "#BBCC13" : "#9CA3AF",
    }}
  />
);

/**
 * OnboardingTutorial
 * Props:
 *  - role: "agent" | "user" (default "user")
 *  - visible: optional boolean controlled by parent; if null, component checks AsyncStorage
 *  - onDone: callback when tutorial finished
 *  - forceShow: ignores seen flag if true
 */
const OnboardingTutorial = ({
  role = "user",
  visible: visibleProp = null,
  onDone = null,
  forceShow = false,
}) => {
  const scrollRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [index, setIndex] = useState(0);
  const slides = role === "agent" ? agentSlides : userSlides;
  const STORAGE_KEY = role === "agent" ? AGENT_KEY : USER_KEY;

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // parent-controlled visibility has highest priority
        if (visibleProp !== null) {
          if (mounted) setVisible(Boolean(visibleProp));
          return;
        }

        if (forceShow) {
          if (mounted) setVisible(true);
          return;
        }

        const seen = await AsyncStorage.getItem(STORAGE_KEY);
        if (!seen && mounted) setVisible(true);
        if (seen && mounted) setVisible(false);
      } catch (err) {
        // on error, show tutorial (safe default)
        if (mounted) setVisible(true);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [visibleProp, forceShow, STORAGE_KEY]);

  const finish = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, "true");
    } catch (e) {
      // ignore storage error
    } finally {
      setVisible(false);
      if (typeof onDone === "function") onDone();
    }
  };

  const onScroll = (ev) => {
    const offsetX = ev.nativeEvent.contentOffset.x || 0;
    const page = Math.round(offsetX / width);
    setIndex(page);
  };

  const goNext = () => {
    const next = Math.min(index + 1, slides.length - 1);
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ x: next * width, animated: true });
    }
    setIndex(next);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <SafeAreaView style={{ flex: 1, backgroundColor: "#0F1720" }}>
        <StatusBar backgroundColor="#0F1720" barStyle="light-content" />
        <View style={{ flex: 1, paddingVertical: 20 }}>
          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={onScroll}
            scrollEventThrottle={16}
            contentContainerStyle={{ alignItems: "center" }}
          >
            {slides.map((s, i) => (
              <View
                key={s.key}
                style={{
                  width,
                  padding: 24,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {s.image ? (
                  <Image
                    source={s.image}
                    style={{
                      width: width * 0.6,
                      height: height * 0.32,
                      marginBottom: 24,
                    }}
                    resizeMode="contain"
                  />
                ) : (
                  <View
                    style={{
                      width: width * 0.6,
                      height: height * 0.32,
                      borderRadius: 12,
                      backgroundColor: "#1E293B",
                      marginBottom: 24,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons name="home-outline" size={64} color="#BBCC13" />
                  </View>
                )}

                <Text
                  style={{
                    color: "#FFFFFF",
                    fontSize: 22,
                    fontWeight: "700",
                    textAlign: "center",
                    marginBottom: 12,
                  }}
                >
                  {s.title}
                </Text>
                <Text
                  style={{
                    color: "#D1D5DB",
                    fontSize: 14,
                    textAlign: "center",
                    lineHeight: 20,
                  }}
                >
                  {s.description}
                </Text>
              </View>
            ))}
          </ScrollView>

          {/* pagination + actions */}
          <View
            style={{
              position: "absolute",
              bottom: 40,
              left: 0,
              right: 0,
              alignItems: "center",
            }}
          >
            <View style={{ flexDirection: "row", marginBottom: 12 }}>
              {slides.map((_, i) => (
                <Dot key={`dot-${i}`} active={i === index} />
              ))}
            </View>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {index < slides.length - 1 ? (
                <>
                  <TouchableOpacity
                    onPress={finish}
                    style={{ marginRight: 16 }}
                  >
                    <Text style={{ color: "#9CA3AF" }}>Skip</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={goNext}
                    style={{
                      backgroundColor: "#BBCC13",
                      paddingVertical: 12,
                      paddingHorizontal: 20,
                      borderRadius: 30,
                      minWidth: 140,
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ color: "#0F1720", fontWeight: "700" }}>
                      Next
                    </Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity
                  onPress={finish}
                  style={{
                    backgroundColor: "#BBCC13",
                    paddingVertical: 12,
                    paddingHorizontal: 20,
                    borderRadius: 30,
                    minWidth: 140,
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: "#0F1720", fontWeight: "700" }}>
                    Get Started
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default OnboardingTutorial;
