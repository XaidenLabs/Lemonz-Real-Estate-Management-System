import { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import { SafeAreaView } from "react-native-safe-area-context";
import ErrorOrMessageModal from "../../components/common/ErrorOrMessageModal";
import Button from "../../components/common/Button";
import { useRouter } from "expo-router";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");

  const {
    authLoading,
    authError,
    setAuthError,
    authMessage,
    setAuthMessage,
    forgotPassword,
  } = useAuth();

  const router = useRouter();

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
          Forgot Password?
        </Text>
      </View>

      <TextInput
        placeholder="Email"
        className="bg-frenchGray-light text-white p-2 mb-4 rounded-lg w-full font-rregular"
        placeholderTextColor="#AFAFAF"
        value={email}
        onChangeText={(text) => setEmail(text)}
      />

      <View className="flex-row items-center justify-center my-4 w-full">
        <Button
          text={authLoading ? "Loading..." : "Continue"}
          bg={true}
          onPress={async () => {
            if (email === "") {
              return setAuthError("Input fields must not be empty");
            }

            await forgotPassword(email);
          }}
        />
      </View>

      <TouchableOpacity className="mt-3" onPress={() => router.push("/login")}>
        <Text className="text-frenchGray-light text-center font-rregular">
          Back to login
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default ForgotPassword;
