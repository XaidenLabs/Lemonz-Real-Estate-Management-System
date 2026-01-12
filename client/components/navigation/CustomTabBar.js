import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const CustomTabBar = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();

  const isAgent = state.routes.length > 3;
  const navbarWidth = isAgent ? "90%" : "70%";

  return (
    <View style={[styles.container, { bottom: insets.bottom + 20 }]}>
      <View style={[styles.tabBar, { width: navbarWidth }]}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          let iconName = "";
          let label = "";

          if (route.name === "dashboard" || route.name === "home") {
            // "home" is for User, "dashboard" is for Agent (both use same icon notion)
            iconName = route.name === "home" ? "home-outline" : "grid-outline";
            label = "Home";
          } else if (route.name === "properties") {
            iconName = "key-outline";
            label = "Properties";
          } else if (route.name === "chats") {
            iconName = "chatbubbles-outline";
            label = "Chats";
          } else if (route.name === "profile") {
            iconName = "person-outline";
            label = "Profile";
          }

          const activeColor = "#BBCC13"; // Chartreuse
          const inactiveColor = "#9CA3AF"; // French Gray / Muted

          return (
            <TouchableOpacity
              key={index}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              style={styles.tabButton}
            >
              <Ionicons
                name={iconName}
                size={22}
                color={isFocused ? activeColor : inactiveColor}
              />
              <Text
                style={[
                  styles.label,
                  {
                    color: isFocused ? activeColor : inactiveColor,
                    fontWeight: isFocused ? "600" : "400",
                  },
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#1A1D1E", // Dark pill background
    borderRadius: 35, // High radius for pill shape
    paddingVertical: 12,
    paddingHorizontal: 20,
    width: "auto", // Handled dynamically in component, but default here
    minWidth: "60%",
    maxWidth: "95%",
    justifyContent: "space-between",
    alignItems: "center",
    // Shadows for floating effect
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  tabButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  label: {
    fontSize: 10,
    marginTop: 4,
  },
});

export default CustomTabBar;
