import { useEffect } from "react";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import {
  useFonts,
  Inter_100Thin,
  Inter_200ExtraLight,
  Inter_300Light,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
  Inter_900Black,
} from "@expo-google-fonts/inter";
import { AuthProvider } from "../contexts/AuthContext";
import { PropertyProvider } from "../contexts/PropertyContext";
import { ReviewProvider } from "../contexts/ReviewContext";
import { ChatProvider } from "../contexts/ChatContext";
import { PreferencesProvider } from "../contexts/PreferencesContext";

const RootLayout = () => {
  const [loaded] = useFonts({
    Inter_100Thin,
    Inter_200ExtraLight,
    Inter_300Light,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
    Inter_900Black,
  });

  useEffect(() => {
    // Ensure we prevent auto hide only once and handle errors gracefully.
    let mounted = true;

    (async () => {
      try {
        await SplashScreen.preventAutoHideAsync();
      } catch (err) {
        // ignore: may already be prevented or not supported in this environment
      }

      if (mounted && loaded) {
        try {
          await SplashScreen.hideAsync();
        } catch (err) {
          // ignore hide errors
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <PropertyProvider>
        <ReviewProvider>
          <ChatProvider>
            <PreferencesProvider>
              <Stack>
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                <Stack.Screen name="user" options={{ headerShown: false }} />
                <Stack.Screen name="agent" options={{ headerShown: false }} />
                <Stack.Screen
                  name="profile-picture-upload"
                  options={{ headerShown: false }}
                />
              </Stack>
            </PreferencesProvider>
          </ChatProvider>
        </ReviewProvider>
      </PropertyProvider>
    </AuthProvider>
  );
};

export default RootLayout;
