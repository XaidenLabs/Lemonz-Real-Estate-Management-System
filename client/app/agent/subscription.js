import { useEffect, useState } from "react";
import {
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../contexts/AuthContext";
import {
  convertCurrency,
  formatCurrency,
  getCountryCurrencyData,
} from "../../services/currencyConverter";
import Button from "../../components/common/Button";

const Subscription = () => {
  const { getUser, user } = useAuth();
  const [convertedPrice, setConvertedPrice] = useState("");
  const [convertedAmount, setConvertedAmount] = useState(null);
  const [currencyInfo, setCurrencyInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const basePriceNGN = 2000;

  useEffect(() => {
    const getUserDetails = async () => {
      try {
        await getUser();
      } catch (err) {
        setError("Failed to fetch user details");
      }
    };

    getUserDetails();
  }, []);

  useEffect(() => {
    const updatePrice = async () => {
      if (!user?.country) {
        return;
      }

      setIsLoading(true);
      setError("");

      try {
        const countryData = await getCountryCurrencyData(user.country);

        if (!countryData) {
          throw new Error("Unable to get currency data for your country");
        }

        setCurrencyInfo(countryData);

        const converted = await convertCurrency(
          basePriceNGN,
          "NGN",
          countryData.code,
        );

        if (converted === null) {
          throw new Error("Currency conversion failed");
        }

        setCurrencyInfo(countryData);
        setConvertedAmount(converted);
        const formatted = formatCurrency(
          converted,
          countryData.symbol,
          countryData.code,
        );
        setConvertedPrice(formatted);
      } catch (err) {
        setError(
          `Failed to process currency: ${err.message}. Please try again later.`,
        );
      } finally {
        setIsLoading(false);
      }
    };

    updatePrice();
  }, [user]);

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
          <Text className="text-white font-rbold text-2xl">Subscription</Text>
        </View>

        <View>
          <Text className="font-rbold text-white my-3 text-xl">
            Go Premium to get full access and be able to upload properties
          </Text>

          <View className="bg-transparentWhite w-full rounded-lg p-4">
            <View className="items-center justify-center">
              <Ionicons name="card-outline" size={40} color={"#BBCC13"} />
              <Text className="text-white font-rbold text-xl">
                Premium Plan
              </Text>

              <View className="items-center my-3">
                {isLoading ? (
                  <ActivityIndicator size="small" color="#BBCC13" />
                ) : error ? (
                  <>
                    <Text className="text-red-500 text-sm text-center">
                      {error}
                    </Text>
                    <Text className="text-white font-rbold text-2xl mt-2">
                      ₦{basePriceNGN.toLocaleString()}
                    </Text>
                  </>
                ) : (
                  <>
                    <Text className="text-white font-rbold text-2xl">
                      {convertedPrice || `₦${basePriceNGN.toLocaleString()}`}
                    </Text>
                    <Text className="text-white font-rbold text-md">
                      For 6 months
                    </Text>
                  </>
                )}
              </View>
              <Button
                text="Get Started"
                bg={true}
                onPress={() =>
                  router.push(
                    `/agent/pay?amount=${encodeURIComponent(
                      (convertedAmount ?? basePriceNGN).toString(),
                    )}&currency=${encodeURIComponent(currencyInfo?.code ?? "NGN")}`,
                  )
                }
              />
            </View>
          </View>
        </View>

        <StatusBar backgroundColor={"#212A2B"} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default Subscription;
