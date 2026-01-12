import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Button from "../components/common/Button";
import ErrorOrMessageModal from "../components/common/ErrorOrMessageModal";
import { useAuth } from "../contexts/AuthContext";

const ProfilePictureUpload = () => {
  const [image, setImage] = useState(null);
  const params = useLocalSearchParams();
  const role = params.role;

  const {
    authLoading,
    authError,
    authMessage,
    setAuthError,
    setAuthMessage,
    uploadProfilePicture,
  } = useAuth();

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleUploadProfilePicture = async () => {
    await uploadProfilePicture(role, image);
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      className="h-full bg-darkUmber-light"
    >
      <SafeAreaView className="min-h-screen items-center justify-center p-[20px]">
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
        <Text className="font-rbold text-2xl text-white mb-4">
          Upload Profile Picture
        </Text>
        <TouchableOpacity
          className="w-full h-[250px] bg-frenchGray-dark rounded-lg flex items-center justify-center"
          onPress={pickImage}
        >
          {image === null ? (
            <Ionicons name="cloud-upload-outline" size={30} color={"#CCCCCC"} />
          ) : (
            <Image
              source={{ uri: image }}
              className="w-full h-full"
              resizeMode="contain"
            />
          )}
        </TouchableOpacity>

        <View className="w-full mt-6">
          <Button
            text={!authLoading ? "Upload" : "Loading..."}
            bg={true}
            onPress={handleUploadProfilePicture}
          />
        </View>
      </SafeAreaView>
    </ScrollView>
  );
};

export default ProfilePictureUpload;
