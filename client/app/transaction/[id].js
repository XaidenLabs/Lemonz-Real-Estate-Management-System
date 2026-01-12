import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useAuth } from "../../contexts/AuthContext";

// Mock Data for Development
const MOCK_TRANSACTION = {
  id: "TXN-12345678",
  property: {
    title: "Luxury 3 Bedroom Apartment",
    location: "Victoria Island, Lagos",
    price: "₦2,500,000",
    image:
      "https://images.unsplash.com/photo-1600596542815-e32c02927233?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  },
  status: "processing", // pending, processing (escrow), success (sealed), failed, disputed
  amount: 2500000,
  date: "2024-05-15",
  escrowStatus: "held", // held, released, refunded
  isUserConfirmed: false,
  isProprietorConfirmed: false,
};

const TransactionDetails = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    // Simulate fetching transaction details
    setTimeout(() => {
      setTransaction(MOCK_TRANSACTION);
      setLoading(false);
    }, 1000);
  }, [id]);

  const handleSealDeal = async () => {
    Alert.alert(
      "Confirm Satisfaction",
      "By confirming, you agree that the property meets your expectations and funds can be released.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes, Seal Deal",
          onPress: async () => {
            setActionLoading(true);
            // Simulate API call
            setTimeout(() => {
              setTransaction((prev) => ({
                ...prev,
                isUserConfirmed: true, // If user
                //Logic to check if both confirmed to switch status to 'success'
                status: prev.isProprietorConfirmed ? "success" : "processing",
              }));
              setActionLoading(false);
              Alert.alert("Success", "You have confirmed the deal!");
            }, 1500);
          },
        },
      ]
    );
  };

  const handleRaiseDispute = () => {
    // Integration with Payluk Dispute API or Link
    Alert.alert(
      "Raise Dispute",
      "Redirecting to Payluk Dispute Resolution Center..."
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-darkGrey justify-center items-center">
        <ActivityIndicator size="large" color="#BBCC13" />
      </SafeAreaView>
    );
  }

  const isSealed = transaction.status === "success";
  const isHeld = transaction.status === "processing";

  return (
    <SafeAreaView className="flex-1 bg-darkGrey h-full">
      <ScrollView
        className="px-6"
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Header */}
        <View className="flex-row items-center mt-6 mb-8">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Feather name="arrow-left" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-rbold">
            Transaction Details
          </Text>
        </View>

        {/* Status Card */}
        <View className="bg-darkUmber-light p-6 rounded-2xl mb-6 items-center">
          <View
            className={`w-16 h-16 rounded-full justify-center items-center mb-4 ${isSealed ? "bg-green-500/20" : "bg-yellow-500/20"}`}
          >
            <Feather
              name={isSealed ? "check-circle" : "shield"}
              size={32}
              color={isSealed ? "#22c55e" : "#eab308"}
            />
          </View>
          <Text className="text-white text-2xl font-rbold mb-1">
            {isSealed ? "Deal Sealed" : "Held in Escrow"}
          </Text>
          <Text className="text-gray-400 text-center font-rregular">
            {isSealed
              ? "Funds have been released to the proprietor."
              : "Funds are safely held until both parties confirm satisfaction."}
          </Text>
        </View>

        {/* Property Info */}
        <View className="bg-darkUmber-light rounded-2xl overflow-hidden mb-6">
          <Image
            source={{ uri: transaction.property.image }}
            className="w-full h-40"
            resizeMode="cover"
          />
          <View className="p-4">
            <Text className="text-lemonGreen text-lg font-rbold mb-1">
              {transaction.property.title}
            </Text>
            <View className="flex-row items-center mb-2">
              <Feather name="map-pin" size={14} color="#9ca3af" />
              <Text className="text-gray-400 text-sm ml-1 font-rregular">
                {transaction.property.location}
              </Text>
            </View>
            <Text className="text-white text-xl font-rbold">
              {transaction.property.price}
            </Text>
          </View>
        </View>

        {/* Progress / Confirmation Status */}
        <View className="bg-darkUmber-light p-5 rounded-2xl mb-8">
          <Text className="text-white font-rsemibold mb-4">
            Confirmation Status
          </Text>

          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-gray-400 font-rregular">Buyer (User)</Text>
            <View className="flex-row items-center">
              <Text
                className={`mr-2 font-rmedium ${transaction.isUserConfirmed ? "text-green-500" : "text-yellow-500"}`}
              >
                {transaction.isUserConfirmed ? "Confirmed" : "Pending"}
              </Text>
              <Feather
                name={transaction.isUserConfirmed ? "check-circle" : "clock"}
                size={16}
                color={transaction.isUserConfirmed ? "#22c55e" : "#eab308"}
              />
            </View>
          </View>

          <View className="h-[1px] bg-gray-700 mb-4" />

          <View className="flex-row items-center justify-between">
            <Text className="text-gray-400 font-rregular">
              Seller (Proprietor)
            </Text>
            <View className="flex-row items-center">
              <Text
                className={`mr-2 font-rmedium ${transaction.isProprietorConfirmed ? "text-green-500" : "text-yellow-500"}`}
              >
                {transaction.isProprietorConfirmed ? "Confirmed" : "Pending"}
              </Text>
              <Feather
                name={
                  transaction.isProprietorConfirmed ? "check-circle" : "clock"
                }
                size={16}
                color={
                  transaction.isProprietorConfirmed ? "#22c55e" : "#eab308"
                }
              />
            </View>
          </View>
        </View>

        {/* Actions */}
        {!isSealed && (
          <View className="gap-y-4">
            <TouchableOpacity
              onPress={handleSealDeal}
              disabled={actionLoading || transaction.isUserConfirmed}
              className={`py-4 rounded-xl items-center flex-row justify-center ${transaction.isUserConfirmed ? "bg-gray-600" : "bg-lemonGreen"}`}
            >
              {actionLoading ? (
                <ActivityIndicator color="#212A2B" />
              ) : (
                <>
                  <Feather
                    name="check-square"
                    size={20}
                    color="#212A2B"
                    style={{ marginRight: 8 }}
                  />
                  <Text className="text-darkGrey text-lg font-rbold">
                    {transaction.isUserConfirmed
                      ? "Waiting for Seller"
                      : "Confirm Satisfaction"}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleRaiseDispute}
              className="py-4 rounded-xl items-center border border-red-500/50 flex-row justify-center"
            >
              <Feather
                name="alert-triangle"
                size={20}
                color="#ef4444"
                style={{ marginRight: 8 }}
              />
              <Text className="text-red-500 text-lg font-rbold">
                Raise Dispute
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default TransactionDetails;
