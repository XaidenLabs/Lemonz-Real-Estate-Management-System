import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";

import { useAuth } from "../../contexts/AuthContext";
import ErrorOrMessageModal from "../../components/common/ErrorOrMessageModal";

const Login = () => {
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const { login, authLoading, authError, setAuthError } = useAuth();

  const handleLogin = async () => {
    if (!credentials.email || !credentials.password) {
      setAuthError("Please fill in all fields");
      return;
    }
    await login(credentials);
  };

  return (
    <View className="flex-1">
      <LinearGradient
        colors={["#212A2B", "#1A1F20", "#0F1720"]}
        locations={[0, 0.4, 1]}
        style={{ flex: 1 }}
      >
        <SafeAreaView className="flex-1">
          {authError ? (
            <ErrorOrMessageModal
              visible={authError !== ""}
              modalType="error"
              onClose={() => setAuthError("")}
              text={authError}
            />
          ) : null}

          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
          >
            <ScrollView
              contentContainerStyle={{
                flexGrow: 1,
                justifyContent: "center",
                padding: 20,
              }}
              showsVerticalScrollIndicator={false}
            >
              <Animated.View
                entering={FadeInDown.delay(200).duration(1000).springify()}
                className="w-full"
              >
                {/* Header */}
                <View className="mb-10">
                  <Text className="text-4xl text-chartreuse font-rbold mb-2">
                    Welcome Back
                  </Text>
                  <Text className="text-gray-400 text-lg font-rregular">
                    Sign in to continue
                  </Text>
                </View>

                {/* Glass Card */}
                <View
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                    borderRadius: 24,
                    padding: 24,
                    borderWidth: 1,
                    borderColor: "rgba(255, 255, 255, 0.1)",
                  }}
                >
                  {/* Email Input */}
                  <View className="mb-6">
                    <Text className="text-gray-300 mb-2 font-rmedium ml-1">
                      Email Address
                    </Text>
                    <View
                      className={`flex-row items-center bg-[#2B3B3C] rounded-xl border h-14 px-4 ${
                        isEmailFocused
                          ? "border-chartreuse"
                          : "border-transparent"
                      }`}
                    >
                      <Ionicons
                        name="mail-outline"
                        size={20}
                        color={isEmailFocused ? "#BBCC13" : "#9CA3AF"}
                      />
                      <TextInput
                        className="flex-1 ml-3 text-white font-rregular text-base"
                        placeholder="Enter your email"
                        placeholderTextColor="#6B7280"
                        value={credentials.email}
                        onChangeText={(text) =>
                          setCredentials({ ...credentials, email: text })
                        }
                        onFocus={() => setIsEmailFocused(true)}
                        onBlur={() => setIsEmailFocused(false)}
                        keyboardType="email-address"
                        autoCapitalize="none"
                      />
                    </View>
                  </View>

                  {/* Password Input */}
                  <View className="mb-2">
                    <Text className="text-gray-300 mb-2 font-rmedium ml-1">
                      Password
                    </Text>
                    <View
                      className={`flex-row items-center bg-[#2B3B3C] rounded-xl border h-14 px-4 ${
                        isPasswordFocused
                          ? "border-chartreuse"
                          : "border-transparent"
                      }`}
                    >
                      <Ionicons
                        name="lock-closed-outline"
                        size={20}
                        color={isPasswordFocused ? "#BBCC13" : "#9CA3AF"}
                      />
                      <TextInput
                        className="flex-1 ml-3 text-white font-rregular text-base"
                        placeholder="Enter your password"
                        placeholderTextColor="#6B7280"
                        value={credentials.password}
                        onChangeText={(text) =>
                          setCredentials({ ...credentials, password: text })
                        }
                        onFocus={() => setIsPasswordFocused(true)}
                        onBlur={() => setIsPasswordFocused(false)}
                        secureTextEntry={!showPassword}
                      />
                      <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                      >
                        <Ionicons
                          name={
                            showPassword ? "eye-outline" : "eye-off-outline"
                          }
                          size={20}
                          color="#9CA3AF"
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Forgot Password */}
                  <TouchableOpacity
                    onPress={() => router.push("/forgot-password")}
                    className="align-self-end mb-8 mt-2"
                  >
                    <Text className="text-gray-400 text-right font-rregular">
                      Forgot Password?
                    </Text>
                  </TouchableOpacity>

                  {/* Login Button */}
                  <TouchableOpacity
                    onPress={handleLogin}
                    disabled={authLoading}
                    className="bg-chartreuse rounded-xl h-14 justify-center items-center"
                  >
                    {authLoading ? (
                      <ActivityIndicator color="#212A2B" />
                    ) : (
                      <Text className="text-[#212A2B] font-rbold text-lg">
                        Sign In
                      </Text>
                    )}
                  </TouchableOpacity>

                  {/* Signup Link */}
                  <View className="flex-row justify-center mt-6">
                    <Text className="text-gray-400 font-rregular">
                      Don't have an account?{" "}
                    </Text>
                    <TouchableOpacity onPress={() => router.push("/signup")}>
                      <Text className="text-chartreuse font-rsemibold">
                        Sign Up
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Animated.View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
};

export default Login;
