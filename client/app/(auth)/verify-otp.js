import { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import { SafeAreaView } from "react-native-safe-area-context";
import ErrorOrMessageModal from "../../components/common/ErrorOrMessageModal";
import Button from "../../components/common/Button";
import { useLocalSearchParams, useRouter } from "expo-router";

const VerifyOtp = () => {
  const [otpArray, setOtpArray] = useState(["", "", "", "", "", ""]);
  const { email } = useLocalSearchParams();

  const {
    authLoading,
    authError,
    setAuthError,
    authMessage,
    setAuthMessage,
    verifyOtp,
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

  const handleOtpChange = (text, index) => {
    const newOtpArray = [...otpArray];
    newOtpArray[index] = text.slice(-1);
    setOtpArray(newOtpArray);

    if (text && index < otpArray.length - 1) {
      inputs[index + 1].focus();
    }
  };

  const handleOtpSubmit = async () => {
    const otp = otpArray.join("");

    if (!email || !otp) {
      return setAuthError("Input fields must not be empty");
    }

    await verifyOtp(email, Number(otp));
  };

  const inputs = [];

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
          Verify OTP
        </Text>
      </View>

      <View className="flex-row justify-center items-center space-x-2 my-4 w-full">
        {otpArray.map((digit, index) => (
          <TextInput
            key={index}
            style={{
              backgroundColor: "#57606d",
              color: "#fff",
              textAlign: "center",
              borderRadius: 5,
              fontSize: 18,
              width: 45,
              height: 50,
            }}
            keyboardType="numeric"
            maxLength={1}
            value={digit}
            onChangeText={(text) => handleOtpChange(text, index)}
            ref={(input) => (inputs[index] = input)}
            placeholderTextColor="#AFAFAF"
          />
        ))}
      </View>

      <View className="flex-row items-center justify-center my-4 w-full">
        <Button
          text={authLoading ? "Loading..." : "Continue"}
          bg={true}
          onPress={handleOtpSubmit}
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

export default VerifyOtp;
