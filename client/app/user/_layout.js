import { Stack } from "expo-router";

const UserLayout = () => {
  return (
    <Stack>
      <Stack.Screen name="(tab)" options={{ headerShown: false }} />
      <Stack.Screen name="(screens)" options={{ headerShown: false }} />
      <Stack.Screen name="wallet" options={{ headerShown: false }} />
    </Stack>
  );
};

export default UserLayout;
