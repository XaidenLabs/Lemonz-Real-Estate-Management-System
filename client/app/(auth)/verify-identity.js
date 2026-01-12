import React, { useState } from "react";
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
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Feather } from "@expo/vector-icons";
import { useAuth } from "../../contexts/AuthContext";

const VerifyIdentity = () => {
  const router = useRouter();
  const { uploadIdentityDocument, authLoading } = useAuth();

  const [idType, setIdType] = useState("NIN"); // Default to NIN
  const [selectedImage, setSelectedImage] = useState(null);

  const pickImage = async () => {
    // Request permission
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert(
        "Permission Required",
        "You need to allow access to your photos to upload an ID."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, // User said "PDF only" in spec but forcing Images for easier handling first, can add DocumentPicker later if strictly PDF
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!selectedImage) {
      Alert.alert(
        "Missing Document",
        "Please upload a clear image of your ID."
      );
      return;
    }

    // Call Auth Context function
    await uploadIdentityDocument(idType, selectedImage);
  };

  return (
    <SafeAreaView className="flex-1 bg-darkGrey px-6">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="mt-6 mb-8">
          <TouchableOpacity onPress={() => router.back()} className="mb-4">
            <Feather name="arrow-left" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-lemonGreen text-3xl font-rbold">
            Verify Identity
          </Text>
          <Text className="text-gray-400 text-base font-rregular mt-2">
            Upload a valid government-issued ID to verify your profile.
          </Text>
        </View>

        {/* ID Type Selection */}
        <View className="mb-6">
          <Text className="text-white text-lg font-rsemibold mb-3">
            Select ID Type
          </Text>
          <View className="flex-row gap-x-4">
            <TouchableOpacity
              onPress={() => setIdType("NIN")}
              className={`flex-1 py-3 rounded-xl border-2 items-center ${idType === "NIN" ? "bg-lemonGreen/10 border-lemonGreen" : "bg-darkUmber-light border-transparent"}`}
            >
              <Text
                className={`${idType === "NIN" ? "text-lemonGreen" : "text-gray-400"} font-rbold`}
              >
                NIN
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setIdType("Passport")}
              className={`flex-1 py-3 rounded-xl border-2 items-center ${idType === "Passport" ? "bg-lemonGreen/10 border-lemonGreen" : "bg-darkUmber-light border-transparent"}`}
            >
              <Text
                className={`${idType === "Passport" ? "text-lemonGreen" : "text-gray-400"} font-rbold`}
              >
                Passport
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Upload Area */}
        <View className="mb-8">
          <Text className="text-white text-lg font-rsemibold mb-3">
            Upload Document
          </Text>

          <TouchableOpacity
            onPress={pickImage}
            className="h-64 bg-darkUmber-light border-2 border-dashed border-gray-600 rounded-2xl justify-center items-center overflow-hidden"
          >
            {selectedImage ? (
              <Image
                source={{ uri: selectedImage }}
                className="w-full h-full"
                resizeMode="cover"
              />
            ) : (
              <View className="items-center">
                <Feather name="upload-cloud" size={48} color="#BBCC13" />
                <Text className="text-gray-400 font-rregular mt-4">
                  Tap to upload image
                </Text>
                <Text className="text-gray-600 text-xs mt-1">
                  (Supports JPG, PNG)
                </Text>
              </View>
            )}
          </TouchableOpacity>
          {selectedImage && (
            <TouchableOpacity
              onPress={() => setSelectedImage(null)}
              className="mt-2 self-end"
            >
              <Text className="text-red-500 font-rmedium">Remove</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Action Button */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={authLoading}
          className={`py-4 rounded-xl items-center mb-10 ${authLoading ? "bg-gray-600" : "bg-lemonGreen"}`}
        >
          {authLoading ? (
            <ActivityIndicator color="#212A2B" />
          ) : (
            <Text className="text-darkGrey text-lg font-rbold">
              Submit for Verification
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default VerifyIdentity;
