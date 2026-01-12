import { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import Button from "../../components/common/Button";
import { useAuth } from "../../contexts/AuthContext";
import ErrorOrMessageModal from "../../components/common/ErrorOrMessageModal";
import { Ionicons } from "@expo/vector-icons";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    authLoading,
    authError,
    setAuthError,
    authMessage,
    setAuthMessage,
    resetPassword,
  } = useAuth();

  const { email } = useLocalSearchParams();

  useEffect(() => {
    const timeout = setTimeout(() => {
      setAuthError("");
    }, 3000);

    return () => clearTimeout(timeout);
  }, [authError]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setAuthMessage("");
    }, 3000);

    return () => clearTimeout(timeout);
  }, [authMessage]);

  return (
    <SafeAreaView className="h-full flex-1 items-center justify-center bg-darkUmber-dark p-[20px]">
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

      <View className="mx-auto w-full">
        <Text className="text-chartreuse text-2xl font-rbold mb-2 text-center">
          Reset password
        </Text>
      </View>

      <View className="relative w-full">
        <TextInput
          placeholder="Password"
          secureTextEntry={!showPassword}
          className="bg-frenchGray-light text-white p-2 mb-4 rounded-lg w-full font-rregular"
          placeholderTextColor="#AFAFAF"
          value={password}
          onChangeText={(text) => setPassword(text)}
        />
        <TouchableOpacity
          className="absolute top-[10px] right-[8px]"
          onPress={() => setShowPassword((prev) => !prev)}
        >
          <Ionicons
            name={showPassword ? "eye-outline" : "eye-off-outline"}
            size={20}
            color={"#AFAFAF"}
          />
        </TouchableOpacity>
      </View>

      <View className="relative w-full">
        <TextInput
          placeholder="Confirm password"
          secureTextEntry={!showConfirmPassword}
          className="bg-frenchGray-light text-white p-2 mb-4 rounded-lg w-full font-rregular"
          placeholderTextColor="#AFAFAF"
          value={confirmPassword}
          onChangeText={(text) => setConfirmPassword(text)}
        />
        <TouchableOpacity
          className="absolute top-[10px] right-[8px]"
          onPress={() => setShowConfirmPassword((prev) => !prev)}
        >
          <Ionicons
            name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
            size={20}
            color={"#AFAFAF"}
          />
        </TouchableOpacity>
      </View>

      <View className="flex-row items-center justify-center my-4 w-full">
        <Button
          text={authLoading ? "Loading..." : "Reset password"}
          bg={true}
          onPress={async () => {
            if (password === "" || confirmPassword === "") {
              return setAuthError("Input fields must not be empty");
            }

            if (password !== confirmPassword) {
              return setAuthError("Passwords must be equal");
            }

            await resetPassword(email, password);
          }}
        />
      </View>

      <TouchableOpacity className="mt-3" onPress={() => router.push("/login")}>
        <Text className="text-frenchGray-light text-center font-rregular">
          Back to Login
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default ResetPassword;
