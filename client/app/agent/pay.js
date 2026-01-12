import { useEffect, useState } from "react";
import {
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../contexts/AuthContext";
import { getCountryCurrencyData } from "../../services/currencyConverter";
import { getToken } from "../../services/getToken";
import { config } from "../../config";
import { PAYSTACK_PUBLIC_KEY } from "@env";
import PaystackWebview from "../../components/agent/payments/PaystackWebview";

const Payment = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [error, setError] = useState("");
  const [isProcessingTrial, setIsProcessingTrial] = useState(false);
  const [remainingTime, setRemainingTime] = useState("");
  const [paymentCountdown, setPaymentCountdown] = useState("");

  // New: payment webview state
  const [showPaymentWebview, setShowPaymentWebview] = useState(false);
  const [paymentData, setPaymentData] = useState(null);

  const params = useLocalSearchParams();
  const PAYMENT_INITIALIZE_ENDPOINT = `${config.API_BASE_URL}/api/payment/initialize`;
  const PAYMENT_VERIFY_ENDPOINT = `${config.API_BASE_URL}/api/payment/verify`;

  const convertPriceToNumber = (formattedPrice) =>
    Number(formattedPrice.replace(/[^0-9.]/g, ""));

  useEffect(() => {
    if (user?.isOnTrial) {
      const interval = setInterval(() => {
        const now = new Date();
        const end = new Date(user.trialEndDate);
        const diff = end - now;
        if (diff <= 0) {
          clearInterval(interval);
          setRemainingTime("Trial ended");
        } else {
          const d = Math.floor(diff / 86400000);
          const h = Math.floor((diff % 86400000) / 3600000);
          const m = Math.floor((diff % 3600000) / 60000);
          setRemainingTime(`${d}d ${h}h ${m}m left`);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [user?.isOnTrial, user?.trialEndDate]);

  useEffect(() => {
    if (user?.hasPaid) {
      const interval = setInterval(() => {
        const now = new Date();
        const end = new Date(user.paymentEndDate);
        const diff = end - now;
        if (diff <= 0) {
          clearInterval(interval);
          setPaymentCountdown("Payment period ended");
        } else {
          const d = Math.floor(diff / 86400000);
          const h = Math.floor((diff % 86400000) / 3600000);
          const m = Math.floor((diff % 3600000) / 60000);
          setPaymentCountdown(`${d}d ${h}h ${m}m left`);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [user?.hasPaid, user?.paymentEndDate]);

  useEffect(() => {
    const setup = async () => {
      if (!user?.country || !user?.email) {
        setError("User details not available");
        return;
      }
      setIsLoading(true);
      setError("");
      try {
        const countryData = await getCountryCurrencyData(user.country);
        if (!countryData) throw new Error("Currency data not found");

        const reference = `PSK_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
        setPaymentDetails({
          reference,
          amount: convertPriceToNumber(params.amount) * 100, // convert to kobo
          email: user.email,
          currency: countryData.code,
        });
      } catch {
        setError("Failed to setup payment. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    setup();
  }, [user, params.amount]);

  // Initialize payment and show webview (same pattern as advertise payment)
  const initiatePayment = async () => {
    if (!paymentDetails) {
      return;
    }

    setIsLoading(true);
    setError("");
    try {
      const token = await getToken();
      const resp = await fetch(PAYMENT_INITIALIZE_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(paymentDetails),
      });

      const json = await resp.json();
      const { status, data } = json;

      if (status === "success" && data) {
        // data should include at least reference and possibly authorization_url
        setPaymentData(data);
        setShowPaymentWebview(true);
      } else {
        throw new Error(json.message || "Initialization failed");
      }
    } catch (err) {
      Alert.alert("Payment Error", err.message || "Unable to start payment.");
    } finally {
      setIsLoading(false);
    }
  };

  // Called by PaystackWebview after successful verification
  const startPayment = async () => {
    try {
      const token = await getToken();

      const response = await fetch(
        `${config.API_BASE_URL}/api/subscription/start-payment`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      const data = await response.json();

      if (data.status === "success") {
        Alert.alert(
          "Subscription Activated",
          "Your 6-month subscription period has started!",
          [
            {
              text: "OK",
              onPress: () => router.push("/agent/dashboard"),
            },
          ],
        );
      } else {
        throw new Error(data.message || "Failed to start subscription");
      }
    } catch (err) {
      Alert.alert(
        "Subscription Activation Error",
        err.message || "Unable to start subscription period. Please try again.",
        [{ text: "OK" }],
      );
    }
  };

  const startTrial = async () => {
    try {
      setIsProcessingTrial(true);
      const token = await getToken();

      const response = await fetch(
        `${config.API_BASE_URL}/api/subscription/start-trial`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      const data = await response.json();

      if (data.status === "success") {
        Alert.alert(
          "Trial Activated",
          "Your 6-month trial period has started!",
          [
            {
              text: "OK",
              onPress: () => router.push("/agent/dashboard"),
            },
          ],
        );
      } else {
        throw new Error(data.message || "Failed to start trial");
      }
    } catch (err) {
      Alert.alert(
        "Trial Activation Error",
        "Unable to start trial period. Please try again.",
        [{ text: "OK" }],
      );
    } finally {
      setIsProcessingTrial(false);
    }
  };

  const handleTrialRequest = async () => {
    try {
      const token = await getToken();
      const response = await fetch(
        `${config.API_BASE_URL}/api/subscription/check-eligibility`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      const data = await response.json();

      if (data.status === "success") {
        if (data.completed) {
          Alert.alert("Trial Completed", "You have completed your trial", [
            { text: "OK" },
          ]);
        } else if (data.ongoing) {
          Alert.alert("Trial is ongoing", "You cannot start a trial", [
            { text: "OK" },
          ]);
        } else {
          Alert.alert(
            "Start Trial",
            "Would you like to start your 6-month trial period?",
            [
              {
                text: "Cancel",
                style: "cancel",
              },
              {
                text: "Start Trial",
                onPress: startTrial,
              },
            ],
          );
        }
      } else {
        Alert.alert(
          "Trial Unavailable",
          "You are not eligible for a trial period. This could be because you've already used a trial or your account type doesn't qualify.",
          [{ text: "OK" }],
        );
      }
    } catch (err) {
      Alert.alert(
        "Error",
        "Unable to verify trial eligibility. Please try again.",
        [{ text: "OK" }],
      );
    }
  };

  if (showPaymentWebview && paymentData && paymentDetails) {
    return (
      <PaystackWebview
        reference={paymentData.reference || paymentDetails.reference}
        amount={paymentDetails.amount}
        email={paymentDetails.email}
        publicKey={PAYSTACK_PUBLIC_KEY}
        onVerified={() => {
          setShowPaymentWebview(false);
          startPayment();
        }}
      />
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-darkUmber-dark p-4">
      <ScrollView>
        <View className="flex-row items-center justify-start gap-3 mb-4">
          <TouchableOpacity
            className="bg-transparentWhite items-center justify-center w-[50px] h-[50px] rounded-full"
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back-outline" size={23} color={"#FFFFFF"} />
          </TouchableOpacity>
          <Text className="text-white font-rbold text-2xl">Payment</Text>
        </View>

        <View className="bg-transparentWhite w-full rounded-lg p-4 mb-4">
          <Text className="text-white font-rbold text-xl text-center mb-4">
            Complete Your Payment
          </Text>

          {error ? (
            <Text className="text-red-500 text-sm text-center mb-4">
              {error}
            </Text>
          ) : null}

          {paymentDetails && (
            <View className="space-y-4">
              <View className="border-b border-gray-600 pb-2">
                <Text className="text-white text-lg">Amount:</Text>
                <Text className="text-white font-rbold text-xl">
                  {paymentDetails.currency} {paymentDetails.amount / 100}
                </Text>
              </View>

              <TouchableOpacity
                className={`bg-[#BBCC13] p-4 rounded-lg items-center ${
                  isLoading || user?.isOnTrial || user?.hasPaid
                    ? "bg-gray-400"
                    : "bg-[#BBCC13]"
                }`}
                onPress={initiatePayment}
                disabled={isLoading || user?.isOnTrial || user?.hasPaid}
              >
                <Text className="text-white font-rbold text-lg">
                  {isLoading
                    ? "Processing..."
                    : user?.hasPaid
                      ? paymentCountdown || "Calculating..."
                      : "Pay Now"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className={`p-4 rounded-lg items-center ${
                  isProcessingTrial || user?.isOnTrial || user?.hasPaid
                    ? "bg-gray-400"
                    : "bg-[#BBCC13]"
                }`}
                onPress={handleTrialRequest}
                disabled={isProcessingTrial || user?.isOnTrial}
              >
                <Text className="text-white font-rbold text-lg">
                  {isProcessingTrial
                    ? "Processing..."
                    : user?.isOnTrial
                      ? remainingTime || "Calculating..."
                      : "Start 6 months trial"}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <StatusBar backgroundColor={"#212A2B"} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default Payment;
