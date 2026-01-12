// components/common/GetStartedCTA.js
import React, { useEffect, useCallback, useState } from "react";
import { Text, Pressable, View, AccessibilityInfo } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../../contexts/AuthContext";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
  // interpolate, // usage replaced due to ReferenceError
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const ONBOARDING_KEY = "onboarding_seen_v1";

/**
 * GetStartedCTA
 *
 * Props:
 *  - toAgent: route for agents (default "/agent/dashboard")
 *  - toUser: route for users (default "/user/home")
 *  - forceShow: ignore seen flag and show anyway
 *  - style: extra container style
 */
const GetStartedCTA = ({
  toAgent = "/agent/dashboard",
  toUser = "/user/home",
  forceShow = false,
  style,
}) => {
  const scale = useSharedValue(1);
  const glow = useSharedValue(0);
  const buttonScale = useSharedValue(1);
  const fadeIn = useSharedValue(0);

  const [reduceMotion, setReduceMotion] = useState(false);
  const [role, setRole] = useState(null);
  const [visible, setVisible] = useState(true);
  const [loading, setLoading] = useState(true);
  const { user, getUser } = useAuth();

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((res) =>
      setReduceMotion(!!res)
    );
  }, []);

  useEffect(() => {
    // Fade in animation
    fadeIn.value = withTiming(1, {
      duration: 800,
      easing: Easing.bezier(0.25, 0.46, 0.45, 0.94), // quad-out
    });

    if (reduceMotion) {
      scale.value = withTiming(1, { duration: 0 });
      glow.value = withTiming(0, { duration: 0 });
      return;
    }

    // gentle pulse + glow loop
    scale.value = withRepeat(
      withSequence(
        withTiming(1.04, {
          duration: 1200,
          easing: Easing.bezier(0.19, 1, 0.22, 1), // exp-out
        }),
        withTiming(1.0, {
          duration: 1200,
          easing: Easing.bezier(0.95, 0.05, 0.795, 0.035), // exp-in
        })
      ),
      -1,
      false
    );

    glow.value = withRepeat(
      withSequence(
        withTiming(1, {
          duration: 1500,
          easing: Easing.bezier(0.45, 0, 0.55, 1), // quad-in-out
        }),
        withTiming(0.3, {
          duration: 1500,
          easing: Easing.bezier(0.45, 0, 0.55, 1), // quad-in-out
        })
      ),
      -1,
      false
    );
  }, [reduceMotion, scale, glow, fadeIn]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const storedRole = await AsyncStorage.getItem("role");
        const seen = await AsyncStorage.getItem(ONBOARDING_KEY);

        if (!mounted) return;

        // prefer user.role if available, otherwise stored role
        setRole((user && user.role) || storedRole || null);

        // If forceShow is true, ignore seen flag
        if (!forceShow && seen === "true") {
          setVisible(false);
        } else {
          setVisible(true);
        }
      } catch (err) {
        // fallback: show CTA
        setVisible(true);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [forceShow, user]);

  // Animated styles
  const containerStyle = useAnimatedStyle(() => ({
    opacity: fadeIn.value,
    transform: [
      { scale: scale.value },
      // translateY: interpolate(fadeIn.value, [0, 1], [20, 0])
      // Linear: 0 -> 20, 1 -> 0 => 20 * (1 - fadeIn.value)
      { translateY: 20 * (1 - fadeIn.value) },
    ],
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
    // shadowOpacity: interpolate(glow.value, [0, 1], [0.15, 0.4])
    // 0.15 + (0.4 - 0.15) * glow = 0.15 + 0.25 * glow
    shadowOpacity: 0.15 + 0.25 * glow.value,
    // elevation: interpolate(glow.value, [0, 1], [3, 8])
    // 3 + 5 * glow
    elevation: 3 + 5 * glow.value,
  }));

  const gradientStyle = useAnimatedStyle(() => ({
    // opacity: interpolate(glow.value, [0, 1], [0.2, 0.8])
    // 0.2 + 0.6 * glow
    opacity: 0.2 + 0.6 * glow.value,
    // scale: interpolate(glow.value, [0, 1], [0.98, 1.08])
    // 0.98 + 0.10 * glow
    transform: [{ scale: 0.98 + 0.1 * glow.value }],
  }));

  const glowRingStyle = useAnimatedStyle(() => ({
    // opacity: interpolate(glow.value, [0, 1], [0, 0.6])
    // 0.6 * glow
    opacity: 0.6 * glow.value,
    // scale: interpolate(glow.value, [0, 1], [1, 1.2])
    // 1 + 0.2 * glow
    transform: [{ scale: 1 + 0.2 * glow.value }],
  }));

  // Role-aware copy & icon
  const destination = role === "agent" ? toAgent : toUser;
  const label = "Get Started";
  const subtext =
    role === "agent"
      ? "List properties, manage leads and grow your business"
      : "Discover properties, save favorites and contact owners securely";
  const smallTag = role === "agent" ? "List Property" : "Browse Homes";
  const iconName = role === "agent" ? "briefcase-outline" : "home-outline";
  const trustedText =
    role === "agent" ? "agents & property managers" : "buyers & renters";

  const onPressIn = useCallback(() => {
    buttonScale.value = withTiming(0.96, {
      duration: 150,
      easing: Easing.out(Easing.quad),
    });
  }, [buttonScale]);

  const onPressOut = useCallback(() => {
    buttonScale.value = withTiming(1, {
      duration: 150,
      easing: Easing.out(Easing.quad),
    });
  }, [buttonScale]);

  const onPress = useCallback(async () => {
    try {
      // persist that user tapped onboarding CTA
      await AsyncStorage.setItem(ONBOARDING_KEY, "true");
    } catch (e) {
      // ignore write errors
    }

    // If we already have a loaded user with a role, use it
    try {
      if (user && user.role) {
        const r = user.role;
        if (r === "individual-agent" || r === "company-agent") {
          return router.replace("/agent/dashboard");
        }

        return router.replace("/user/home");
      }

      // No user in context — check for a token (logged in) and stored role as fallback
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        return router.replace("/login");
      }

      // If we have a token but no user loaded, try to refresh user
      try {
        await getUser();
      } catch (err) {
        // getUser may redirect to login if token invalid
      }

      // re-check user and stored role
      const refreshedUser = user && user.role ? user : null;
      if (refreshedUser && refreshedUser.role) {
        const r2 = refreshedUser.role;
        if (r2 === "individual-agent" || r2 === "company-agent") {
          return router.replace("/agent/dashboard");
        }
        return router.replace("/user/home");
      }

      // fallback to stored role
      const storedRole = await AsyncStorage.getItem("role");
      if (storedRole === "individual-agent" || storedRole === "company-agent") {
        return router.replace("/agent/dashboard");
      }

      // default to user home if token exists
      return router.replace("/user/home");
    } catch (err) {
      // On any unexpected failure, send to login as safest fallback
      return router.replace("/login");
    }
  }, [user, getUser]);

  if (loading || !visible) return null;

  return (
    <Animated.View
      style={[
        {
          alignItems: "center",
          justifyContent: "center",
          marginVertical: 24,
          paddingHorizontal: 20,
        },
        style,
        containerStyle,
      ]}
    >
      {/* Outer glow ring */}
      <Animated.View
        style={[
          {
            position: "absolute",
            width: 280,
            height: 80,
            borderRadius: 45,
            backgroundColor: "rgba(187,204,19,0.08)",
            borderWidth: 1,
            borderColor: "rgba(187,204,19,0.16)",
          },
          glowRingStyle,
        ]}
      />

      {/* Gradient background */}
      <Animated.View
        style={[
          { position: "absolute", width: 260, height: 74, borderRadius: 42 },
          gradientStyle,
        ]}
      >
        <LinearGradient
          colors={[
            "rgba(187,204,19,0.25)",
            "rgba(34,197,94,0.06)",
            "rgba(187,204,19,0.12)",
          ]}
          start={[0, 0]}
          end={[1, 1]}
          style={{
            flex: 1,
            borderRadius: 42,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.06)",
          }}
        />
      </Animated.View>

      {/* Main button */}
      <AnimatedPressable
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        accessibilityRole="button"
        accessibilityLabel={label}
        style={[
          {
            width: 260,
            height: 74,
            borderRadius: 42,
            backgroundColor: "#BBCC13",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "row",
            paddingHorizontal: 24,
            shadowColor: "#BBCC13",
            shadowOffset: { width: 0, height: 8 },
            shadowRadius: 20,
            borderWidth: 2,
            borderColor: "rgba(255,255,255,0.12)",
          },
          buttonStyle,
        ]}
      >
        {/* Icon container */}
        <View
          style={{
            backgroundColor: "rgba(15,23,32,0.12)",
            borderRadius: 20,
            padding: 8,
            marginRight: 14,
          }}
        >
          <Ionicons name={iconName} size={22} color="#0F1720" />
        </View>

        {/* Text content */}
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: "#0F1720",
              fontWeight: "800",
              fontSize: 18,
              letterSpacing: 0.4,
            }}
          >
            {label}
          </Text>
          <Text
            style={{
              color: "rgba(15,23,32,0.72)",
              fontWeight: "600",
              fontSize: 12,
              marginTop: 2,
            }}
          >
            {smallTag}
          </Text>
        </View>

        {/* Arrow icon */}
        <Ionicons
          name="arrow-forward"
          size={20}
          color="rgba(15,23,32,0.85)"
          style={{ marginLeft: 8 }}
        />
      </AnimatedPressable>

      {/* Subtext + trusted line */}
      <View
        style={{ marginTop: 14, paddingHorizontal: 20, alignItems: "center" }}
      >
        <Text
          style={{
            color: "#D1D5DB",
            fontSize: 14,
            textAlign: "center",
            lineHeight: 20,
            fontWeight: "500",
          }}
        >
          {subtext}
        </Text>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginTop: 8,
            opacity: 0.7,
          }}
        >
          <View
            style={{
              width: 4,
              height: 4,
              borderRadius: 2,
              backgroundColor: "#BBCC13",
              marginHorizontal: 6,
            }}
          />
          <Text style={{ color: "#9CA3AF", fontSize: 12, fontWeight: "400" }}>
            Trusted by thousands of {trustedText}
          </Text>
          <View
            style={{
              width: 4,
              height: 4,
              borderRadius: 2,
              backgroundColor: "#BBCC13",
              marginHorizontal: 6,
            }}
          />
        </View>
      </View>
    </Animated.View>
  );
};

export default GetStartedCTA;
