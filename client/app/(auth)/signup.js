import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";

import Button from "../../components/common/Button";
import UserSignupForm from "../../components/user/UserSignupForm";
import ChooseAgentType from "../../components/agent/ChooseAgentType";
import { useAuth } from "../../contexts/AuthContext";
import ErrorOrMessageModal from "../../components/common/ErrorOrMessageModal";

const Signup = () => {
  const [selected, setSelected] = useState({
    agent: false,
    user: true,
  });

  const [userDetails, setUserDetails] = useState({
    propertiesOfInterest: [],
    lastName: "",
    firstName: "",
    middleName: "",
    currentAddress: "",
    country: "",
    countryCode: "",
    mobileNumber: "",
    email: "",
    password: "",
    role: "buyer",
  });

  const { setAuthError, authError, authMessage, setAuthMessage } = useAuth();

  const toggleSelection = (type) => {
    setSelected({
      agent: type === "agent",
      user: type === "user",
    });
  };

  return (
    <View className="flex-1">
      <LinearGradient
        colors={["#212A2B", "#1A1F20", "#0F1720"]}
        locations={[0, 0.4, 1]}
        style={{ flex: 1 }}
      >
        <SafeAreaView className="flex-1">
          {authError && (
            <ErrorOrMessageModal
              visible={authError !== ""}
              modalType="error"
              onClose={() => setAuthError("")}
              text={authError}
            />
          )}

          {authMessage && (
            <ErrorOrMessageModal
              visible={authMessage !== ""}
              modalType="success"
              onClose={() => setAuthMessage("")}
              text={authMessage}
            />
          )}

          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
          >
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                flexGrow: 1,
                padding: 20,
                paddingBottom: 40,
              }}
            >
              <Animated.View
                entering={FadeInDown.delay(200).duration(1000).springify()}
                className="w-full"
              >
                {/* Glass Container */}
                <View
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                    borderRadius: 24,
                    padding: 24,
                    marginTop: 10,
                    borderWidth: 1,
                    borderColor: "rgba(255, 255, 255, 0.1)",
                  }}
                >
                  <View className="mx-auto w-full mb-6">
                    <Text className="text-chartreuse text-3xl font-rbold mb-2 text-center">
                      Create Account
                    </Text>
                    <Text className="text-gray-400 text-center font-rregular">
                      Choose your signup method
                    </Text>
                  </View>

                  {/* Toggle Buttons */}
                  <View className="flex-row items-center justify-center mb-8 bg-[#2B3B3C] p-1 rounded-xl">
                    <TouchableOpacity
                      className={`flex-1 py-3 rounded-lg ${selected.user ? "bg-chartreuse" : "bg-transparent"}`}
                      onPress={() => toggleSelection("user")}
                    >
                      <Text
                        className={`text-center font-rsemibold ${selected.user ? "text-[#212A2B]" : "text-gray-400"}`}
                      >
                        User (Buyer)
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className={`flex-1 py-3 rounded-lg ${selected.agent ? "bg-chartreuse" : "bg-transparent"}`}
                      onPress={() => toggleSelection("agent")}
                    >
                      <Text
                        className={`text-center font-rsemibold ${selected.agent ? "text-[#212A2B]" : "text-gray-400"}`}
                      >
                        Proprietor
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {selected.agent && <ChooseAgentType />}

                  {selected.user && (
                    <UserSignupForm
                      userDetails={userDetails}
                      setUserDetails={setUserDetails}
                    />
                  )}

                  <View className="flex-row justify-center mt-6">
                    <Text className="text-gray-400 font-rregular">
                      Already have an account?{" "}
                    </Text>
                    <TouchableOpacity onPress={() => router.push("/login")}>
                      <Text className="text-chartreuse font-rsemibold">
                        Log In
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

export default Signup;
