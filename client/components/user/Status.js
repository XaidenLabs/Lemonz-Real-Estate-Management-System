import { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useProperty } from "../../contexts/PropertyContext";
import NoProperties from "./NoProperties";
import { formatPrice } from "../../services/formatPrice";
import { router } from "expo-router";

const Status = () => {
  const status = ["Rent", "Lease", "Sale"];

  const [selectedStatus, setSelectedStatus] = useState(status[0]);
  const [statusProperties, setStatusProperties] = useState([]);

  const { getProperties, rentProperties, leaseProperties, saleProperties } =
    useProperty();

  const toggleStatusSelection = (property) => {
    setSelectedStatus(property);
  };

  useEffect(() => {
    const fetchProperties = async () => {
      await getProperties();
    };

    fetchProperties();
  }, []);

  useEffect(() => {
    const updateStatusProperties = () => {
      if (selectedStatus === "Rent") {
        setStatusProperties(rentProperties);
      } else if (selectedStatus === "Lease") {
        setStatusProperties(leaseProperties);
      } else if (selectedStatus === "Sale") {
        setStatusProperties(saleProperties);
      }
    };

    updateStatusProperties();
  }, [selectedStatus, rentProperties, leaseProperties, saleProperties]);

  return (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mt-4"
      >
        {status.map((item, index) => (
          <TouchableOpacity
            key={item}
            className={`p-2 px-4 m-1 rounded-full ${index === 0 ? "ml-4" : ""} ${index === status.length - 1 ? "mr-4" : ""} ${selectedStatus === item ? "bg-chartreuse" : "bg-frenchGray-light"}`}
            onPress={() => toggleStatusSelection(item)}
          >
            <Text
              className={`text-center font-rbold text-lg ${selectedStatus === item ? "text-frenchGray-light" : "text-white"}`}
            >
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {statusProperties.length === 0 ? (
        <NoProperties type="status" />
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: 20 }}
          className="mt-[20px]"
        >
          {statusProperties.map((property) => (
            <TouchableOpacity
              className="ml-[20px]"
              key={property._id}
              onPress={() => router.push(`/user/properties/${property._id}`)}
            >
              <ImageBackground
                source={{ uri: property.images[0] }}
                resizeMode="cover"
                style={{
                  width: 200,
                  height: 180,
                  borderRadius: 18,
                  overflow: "hidden",
                }}
              >
                <View className="bg-transparentBlack absolute top-0 left-0 w-full h-full" />
                <View className="absolute bottom-0 left-0 p-2 w-full">
                  <View>
                    <Text className="text-xl font-rbold text-white">
                      {property.title}
                    </Text>
                    <Text className="text-lg font-rbold text-gray-400">
                      {property.currency
                        ? property.currency.split(" - ")[1]
                        : ""}{" "}
                      {formatPrice(property?.price)}
                    </Text>
                  </View>
                </View>
              </ImageBackground>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

export default Status;
