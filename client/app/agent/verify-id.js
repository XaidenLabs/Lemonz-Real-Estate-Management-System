import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Alert,
  TouchableOpacity,
  StatusBar,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import { config, DOCUMENT_TYPE_DESCRIPTIONS } from "../../config";
import { fetchCountries } from "../../services/countryApi";
import { getToken } from "../../services/getToken";
import { useAuth } from "../../contexts/AuthContext";

const CustomButton = ({
  onPress,
  text,
  variant = "primary",
  disabled = false,
}) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled}
    className={`
      w-full py-4 px-6 rounded-xl my-2
      ${variant === "primary" ? "bg-chartreuse" : "bg-darkUmber"}
      ${disabled ? "opacity-50" : "active:opacity-80"}
    `}
  >
    <Text
      className={`
        text-center font-rsemibold text-lg
        ${variant === "primary" ? "text-darkUmber" : "text-chartreuse"}
      `}
    >
      {text}
    </Text>
  </TouchableOpacity>
);

const VerifyId = () => {
  // const [hasPermission, setHasPermission] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState({});
  const [countryCode, setCountryCode] = useState("");
  const [documentTypes, setDocumentTypes] = useState([]);
  const [idDocument, setIdDocument] = useState("");
  const [loading, setLoading] = useState(false);

  const { user, getUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // (async () => {
    //   try {
    //     const { status } =
    //       await ImagePicker.requestMediaLibraryPermissionsAsync();
    //     setHasPermission(status === "granted");
    //     if (status !== "granted") {
    //       Alert.alert(
    //         "Gallery Permission",
    //         "Gallery permission is required to upload your ID document.",
    //         [
    //           {
    //             text: "OK",
    //             onPress: () => handleBackPress(),
    //           },
    //         ],
    //       );
    //     }
    //   } catch (error) {
    //     Alert.alert("Error", "Failed to access gallery. Please try again.");
    //   }
    // })();

    const getCountries = async () => {
      try {
        const countriesData = await fetchCountries();
        setCountries(countriesData);
      } catch (error) {
        Alert.alert("Error", "Failed to fetch countries. Please try again.");
      }
    };

    getCountries();
  }, []);

  const getAllDocumentTypes = (descriptions) => {
    const documentTypes = [];
    Object.entries(descriptions).forEach(([key, value]) => {
      if (typeof value === "string") {
        documentTypes.push({ code: key, label: value });
      } else if (typeof value === "object") {
        Object.entries(value).forEach(([subKey, subValue]) => {
          documentTypes.push({ code: subKey, label: subValue });
        });
      }
    });
    return documentTypes;
  };

  useEffect(() => {
    const getDocumentTypes = () => {
      const allDocuments = getAllDocumentTypes(DOCUMENT_TYPE_DESCRIPTIONS);
      setDocumentTypes(allDocuments);
    };

    getDocumentTypes();
  }, []);

  const handleBackPress = () => {
    try {
      router.back();
    } catch (error) {
      Alert.alert("Navigation Error", "Unable to go back. Please try again.");
    }
  };

  const handleCountryChange = (country) => {
    setSelectedCountry(country);
    const countryDetails = countries.find((c) => c.name.common === country);
    setCountryCode(countryDetails?.cca2);
  };

  const handleIdDocumentChange = (type) => {
    setIdDocument(type);
  };

  const pickImage = async () => {
    // if (hasPermission === false) {
    //   Alert.alert("Error", "Gallery permission is required to upload images.");
    //   return;
    // }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image. Please try again.");
    }
  };

  const handleSubmit = async () => {
    if (!selectedImage) {
      Alert.alert("Error", "Please upload an ID document image.");
      return;
    }

    if (!selectedCountry || !countryCode) {
      Alert.alert("Error", "Please select a country.");
      return;
    }

    if (!idDocument) {
      Alert.alert("Error", "Please select an ID document type.");
      return;
    }

    setLoading(true);

    try {
      const token = await getToken();

      const formData = new FormData();

      formData.append("file", {
        uri: selectedImage,
        name: "id.jpg",
        type: "image/jpeg",
      });
      formData.append("countryCode", countryCode);
      formData.append("documentType", idDocument);

      const response = await axios.post(
        `${config.API_BASE_URL}/api/user/verify-identity`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data) {
        Alert.alert(
          "ID Verification",
          "Your ID has been verified successfully"
        );
        await getUser();
      } else {
        Alert.alert("Verification Failed", "Unable to process ID.");
      }
    } catch (error) {
      Alert.alert(
        "Error",
        error.response?.data?.message ||
          "An error occurred while verifying the ID."
      );
    } finally {
      setLoading(false);
    }
  };

  // if (hasPermission === null) {
  //   return <View />;
  // }

  // if (hasPermission === false) {
  //   return (
  //     <SafeAreaView className="flex-1 bg-darkUmber-dark p-6">
  //       <Text className="text-white text-center">No access to gallery</Text>
  //     </SafeAreaView>
  //   );
  // }

  return (
    <SafeAreaView className="flex-1 bg-darkUmber-dark p-6">
      <View className="flex-row items-center justify-start gap-3 mb-4">
        <TouchableOpacity
          className="bg-transparentWhite items-center justify-center w-[50px] h-[50px] rounded-full"
          onPress={handleBackPress}
        >
          <Ionicons name="chevron-back-outline" size={23} color={"#FFFFFF"} />
        </TouchableOpacity>
        <Text className="text-white font-rbold text-2xl">ID Verification</Text>
      </View>

      {user.isIdVerified ? (
        <View className="flex-1 flex-col items-center justify-center">
          <Ionicons
            name="checkmark-circle-outline"
            color={"#BBCC13"}
            size={70}
          />
          <Text className="text-white font-rregular text-xl">
            Your ID has been verified successfully
          </Text>
        </View>
      ) : (
        <View className="flex-1">
          <View className="mb-8 rounded-xl overflow-hidden bg-darkUmber h-64">
            {selectedImage ? (
              <Image
                source={{ uri: selectedImage }}
                className="w-full h-full"
                resizeMode="cover"
              />
            ) : (
              <View className="flex-1 items-center justify-center p-6">
                <Ionicons
                  name="image-outline"
                  size={50}
                  color="#9CA3AF"
                  style={{ marginBottom: 12 }}
                />
                <Text className="text-frenchGray-light text-lg mb-2 text-center">
                  No image selected
                </Text>
                <Text className="text-frenchGray-light text-sm opacity-70 text-center">
                  Tap the button below to upload your ID document from gallery
                </Text>
              </View>
            )}
          </View>

          <CustomButton
            text="Upload ID Document"
            onPress={pickImage}
            variant="primary"
          />

          <View className="bg-frenchGray-light mb-4 rounded-lg w-full font-regular">
            <Picker
              selectedValue={selectedCountry}
              onValueChange={handleCountryChange}
              style={{ color: "#FFFFFF" }}
              dropdownIconColor={"#9CA3AF"}
              selectionColor={"#FFFFFF"}
            >
              <Picker.Item key="select" label="Select country" value="" />
              {countries.map((country) => (
                <Picker.Item
                  key={country?.name.common}
                  label={country?.name.common}
                  value={country?.name.common}
                />
              ))}
            </Picker>
          </View>

          <View className="bg-frenchGray-light mb-4 rounded-lg w-full font-regular">
            <Picker
              selectedValue={idDocument}
              onValueChange={handleIdDocumentChange}
              style={{ color: "#FFFFFF" }}
              dropdownIconColor={"#9CA3AF"}
              selectionColor={"#FFFFFF"}
            >
              <Picker.Item key="select" label="Select ID Type" value="" />
              {documentTypes.map((doc) => (
                <Picker.Item
                  key={doc.code}
                  label={doc.label}
                  value={doc.code}
                />
              ))}
            </Picker>
          </View>

          <CustomButton
            text={loading ? "Loading..." : "Submit for Verification"}
            onPress={handleSubmit}
            variant="primary"
            disabled={!selectedImage || loading}
          />
        </View>
      )}

      <StatusBar backgroundColor={"#212A2B"} />
    </SafeAreaView>
  );
};

export default VerifyId;
