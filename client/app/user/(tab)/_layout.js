import { View } from "react-native";
import { Tabs } from "expo-router";
import * as NavigationBar from "expo-navigation-bar";
import CustomTabBar from "../../../components/navigation/CustomTabBar";

const TabLayout = () => {
  NavigationBar.setBackgroundColorAsync("#1A1D1E"); // Match new standard

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen name="home" />

      <Tabs.Screen name="profile" />
    </Tabs>
  );
};

export default TabLayout;
