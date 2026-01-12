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
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../contexts/AuthContext";
import {
  convertCurrency,
  formatCurrency,
  getCountryCurrencyData,
} from "../../services/currencyConverter";
import Button from "../../components/common/Button";
import { useProperty } from "../../contexts/PropertyContext";

const DURATION_PRICES = {
  "1_MONTH": {
    price: 10000,
    label: "1 Month",
  },
  "2_MONTHS": {
    price: 20000,
    label: "2 Months",
  },
  "3_MONTHS": {
    price: 25000,
    label: "3 Months",
  },
};

const Advertise = () => {
  const { getUser, user } = useAuth();
  const { getProperty, property } = useProperty();
  const [convertedPrice, setConvertedPrice] = useState("");
  const [currencyInfo, setCurrencyInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedDuration, setSelectedDuration] = useState("1_MONTH");
  const [propertyAdvertDuration, setPropertyAdvertDuration] = useState("");
  const [convertedAmount, setConvertedAmount] = useState(null);

  const { propertyId } = useLocalSearchParams();

  useEffect(() => {
    const fetchProperty = async () => {
      await getProperty(propertyId);
    };

    fetchProperty();
  }, []);

  useEffect(() => {
    if (property.isOnAdvertisement) {
      const start = new Date(property.advertisementStartDate);
      const end = new Date(property.advertisementEndDate);

      const duration = end - start;
      setPropertyAdvertDuration(duration);
    }
  }, [property.isOnAdvertisement, property.advertisementEndDate]);

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
          DURATION_PRICES[selectedDuration].price,
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
  }, [user, selectedDuration]);

  const DurationOption = ({ duration, isSelected }) => (
    <TouchableOpacity
      onPress={() => setSelectedDuration(duration)}
      className={`p-4 rounded-lg mb-3 ${
        isSelected ? "bg-[#BBCC13]" : "bg-transparentWhite"
      }`}
    >
      <View className="flex-row justify-between items-center">
        <Text
          className={`font-rbold text-lg ${
            isSelected ? "text-darkUmber-dark" : "text-white"
          }`}
        >
          {DURATION_PRICES[duration].label}
        </Text>
        <Text
          className={`font-rbold ${
            isSelected ? "text-darkUmber-dark" : "text-white"
          }`}
        >
          ₦{DURATION_PRICES[duration].price.toLocaleString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

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
          <Text className="text-white font-rbold text-2xl">Advertise</Text>
        </View>

        <View>
          <Text className="font-rbold text-white my-3 text-xl">
            Select duration and make payment
          </Text>

          <View className="mb-4">
            {Object.keys(DURATION_PRICES).map((duration) => (
              <DurationOption
                key={duration}
                duration={duration}
                isSelected={selectedDuration === duration}
              />
            ))}
          </View>

          <View className="bg-transparentWhite w-full rounded-lg p-4">
            <View className="items-center justify-center">
              <Ionicons name="card-outline" size={40} color={"#BBCC13"} />

              <View className="items-center my-3">
                {isLoading ? (
                  <ActivityIndicator size="small" color="#BBCC13" />
                ) : error ? (
                  <>
                    <Text className="text-red-500 text-sm text-center">
                      {error}
                    </Text>
                    <Text className="text-white font-rbold text-2xl mt-2">
                      ₦
                      {DURATION_PRICES[selectedDuration].price.toLocaleString()}
                    </Text>
                  </>
                ) : (
                  <>
                    <Text className="text-white font-rbold text-2xl">
                      {convertedPrice ||
                        `₦${DURATION_PRICES[selectedDuration].price.toLocaleString()}`}
                    </Text>
                    <Text className="text-white font-rbold text-md">
                      For {DURATION_PRICES[selectedDuration].label}
                    </Text>
                  </>
                )}
              </View>
              <Button
                text="Continue"
                bg={true}
                onPress={() =>
                  router.push(
                    `/agent/advertise-pay?amount=${encodeURIComponent(
                      (convertedAmount ?? basePriceNGN).toString(),
                    )}&currency=${encodeURIComponent(currencyInfo?.code ?? "NGN")}&propertyId=${propertyId}&duration=${selectedDuration}`,
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

export default Advertise;
