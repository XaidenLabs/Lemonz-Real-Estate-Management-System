import { Tabs } from "expo-router";
import * as NavigationBar from "expo-navigation-bar";
import CustomTabBar from "../../../components/navigation/CustomTabBar"; // Adjust path if needed

const TabLayout = () => {
  NavigationBar.setBackgroundColorAsync("#2B3B3C");

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen name="dashboard" />
      <Tabs.Screen name="properties" />
      <Tabs.Screen name="chats" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
};

export default TabLayout;
