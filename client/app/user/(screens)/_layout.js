import { Stack } from "expo-router";

const ScreenLayout = () => {
  return (
    <Stack>
      <Stack.Screen name="profile/edit" options={{ headerShown: false }} />
      <Stack.Screen name="properties/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="properties/saved" options={{ headerShown: false }} />
      <Stack.Screen name="chat/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="transactions/[id]" options={{ headerShown: false }} />
    </Stack>
  );
};

export default ScreenLayout;
