import { useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Image,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from "@env";
import { useAuth } from "../../../../contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import Button from "../../../../components/common/Button";
import ErrorOrMessageModal from "../../../../components/common/ErrorOrMessageModal";
import { config } from "../../../../config";

const EditProfile = () => {
  const {
    authLoading,
    authMessage,
    setAuthMessage,
    authError,
    setAuthError,
    getUser,
    user,
    setUser,
    updateProfile,
  } = useAuth();

  useEffect(() => {
    const getUserDetails = async () => {
      await getUser();
    };

    getUserDetails();
    // fetch banks for agent bank selector
    (async () => {
      try {
        const res = await fetch(`${config.API_BASE_URL}/api/user/banks`);
        const json = await res.json();
        if (json.success && json.banks) {
          setUser((u) => ({ ...u, __banks: json.banks }));
        }
      } catch (err) {
        console.warn("Failed to fetch banks for agent profile edit", err);
      }
    })();
  }, []);

  const handleUploadProfileImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      try {
        const data = new FormData();
        data.append("file", {
          uri: result.assets[0].uri,
          type: "image/jpeg",
          name: "upload.jpg",
        });
        data.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`,
          {
            method: "POST",
            body: data,
            headers: {
              Accept: "application/json",
              "Content-Type": "multipart/form-data",
            },
          },
        );

        const jsonResponse = await response.json();

        if (jsonResponse.secure_url) {
          setUser({ ...user, profilePicture: jsonResponse.secure_url });
        }
      } catch (error) {
        throw error;
      }
    }
  };

  const handleEditProfile = async () => {
    await updateProfile(user);
  };

  const renderInputField = (
    placeholder,
    value,
    onChangeText,
    iconName,
    keyboardType = "default",
  ) => (
    <View className="relative w-full mb-4">
      <TextInput
        placeholder={placeholder}
        className="bg-frenchGray-light text-white p-4 rounded-xl w-full font-rregular pl-[50px] text-[16px]"
        placeholderTextColor="#9CA3AF"
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
      />
      <View className="absolute top-[16px] left-[16px]">
        <Ionicons name={iconName} size={22} color={"#9CA3AF"} />
      </View>
    </View>
  );

  const renderSectionHeader = (title, icon) => (
    <View className="flex-row items-center mb-6 mt-2">
      <View className="bg-frenchGray-dark p-3 rounded-full mr-3">
        <Ionicons name={icon} size={20} color={"#BBCC13"} />
      </View>
      <Text className="text-white font-rbold text-lg">{title}</Text>
      <View className="flex-1 h-[1px] bg-frenchGray-light ml-4" />
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-darkUmber-dark">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
        className="px-6"
      >
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

        {/* Header */}
        <View className="flex-row items-center justify-start gap-4 mt-4 mb-8">
          <TouchableOpacity
            className="bg-frenchGray-dark items-center justify-center w-[52px] h-[52px] rounded-full shadow-lg"
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back-outline" size={24} color={"#FFFFFF"} />
          </TouchableOpacity>
          <Text className="text-white font-rbold text-2xl">My Account</Text>
        </View>

        {/* Profile Picture Section */}
        <View className="items-center justify-center mb-8 bg-frenchGray-light/10 rounded-2xl py-8">
          {user?.profilePicture && user?.profilePicture !== "" ? (
            <TouchableOpacity
              className="relative"
              onPress={handleUploadProfileImage}
            >
              <View className="w-32 h-32 rounded-full overflow-hidden border-4 border-frenchGray-light/20">
                <Image
                  source={{ uri: user.profilePicture }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              </View>
              <View className="absolute -bottom-2 -right-2 bg-frenchGray-dark p-3 rounded-full border-2 border-darkUmber-dark">
                <Ionicons name="camera" size={20} color={"#BBCC13"} />
              </View>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              className="relative"
              onPress={handleUploadProfileImage}
            >
              <View className="bg-frenchGray-light w-32 h-32 rounded-full items-center justify-center border-4 border-frenchGray-light/20">
                <Ionicons name="person-outline" color={"#2B3B3C"} size={60} />
              </View>
              <View className="absolute -bottom-2 -right-2 bg-frenchGray-dark p-3 rounded-full border-2 border-darkUmber-dark">
                <Ionicons name="camera" size={20} color={"#BBCC13"} />
              </View>
            </TouchableOpacity>
          )}
          <Text className="text-white/70 font-rregular text-sm mt-3">
            Tap to update profile picture
          </Text>
        </View>

        {/* Personal Information */}
        {renderSectionHeader("Personal Information", "person-outline")}

        {user?.firstName &&
          renderInputField(
            "First Name",
            user?.firstName,
            (text) => setUser({ ...user, firstName: text }),
            "person-outline",
          )}

        {user?.lastName &&
          renderInputField(
            "Last Name",
            user?.lastName,
            (text) => setUser({ ...user, lastName: text }),
            "person-outline",
          )}

        {renderInputField(
          user?.firstName && user?.lastName ? "Brand Name" : "Company Name",
          user?.companyName,
          (text) => setUser({ ...user, companyName: text }),
          "business-outline",
        )}

        {renderInputField(
          "Email Address",
          user?.email,
          (text) => setUser({ ...user, email: text }),
          "mail-outline",
          "email-address",
        )}

        {renderInputField(
          "Mobile Number",
          user?.mobileNumber,
          (text) => setUser({ ...user, mobileNumber: text }),
          "call-outline",
          "phone-pad",
        )}

        {/* Address Information */}
        {renderSectionHeader("Address Information", "location-outline")}

        {renderInputField(
          "Current Address",
          user?.currentAddress,
          (text) => setUser({ ...user, currentAddress: text }),
          "home-outline",
        )}

        {renderInputField(
          "Country",
          user?.country,
          (text) => setUser({ ...user, country: text }),
          "globe-outline",
        )}

        {/* Emergency Contact */}
        {renderSectionHeader("Emergency Contact", "medical-outline")}

        {renderInputField(
          "Emergency Contact Name",
          user?.emergencyContact?.name,
          (text) =>
            setUser({
              ...user,
              emergencyContact: {
                ...user?.emergencyContact,
                name: text,
              },
            }),
          "person-add-outline",
        )}

        {renderInputField(
          "Relationship",
          user?.emergencyContact?.relationship,
          (text) =>
            setUser({
              ...user,
              emergencyContact: {
                ...user?.emergencyContact,
                relationship: text,
              },
            }),
          "people-outline",
        )}

        {renderInputField(
          "Emergency Contact Phone",
          user?.emergencyContact?.phone,
          (text) =>
            setUser({
              ...user,
              emergencyContact: {
                ...user?.emergencyContact,
                phone: text,
              },
            }),
          "call-outline",
          "phone-pad",
        )}

        {renderInputField(
          "Emergency Contact Email",
          user?.emergencyContact?.email,
          (text) =>
            setUser({
              ...user,
              emergencyContact: {
                ...user?.emergencyContact,
                email: text,
              },
            }),
          "mail-outline",
          "email-address",
        )}

        {/* Bank details for agents */}
        {renderSectionHeader("Bank details", "card-outline")}

        <View className="bg-frenchGray-light mb-4 rounded-lg w-full font-regular">
          <Picker
            selectedValue={user?.bankCode || ""}
            onValueChange={(val) =>
              setUser({
                ...user,
                bankCode: val,
                bankName: (user.__banks || []).find((b) => b.code === val)?.name || "",
              })
            }
            style={{ color: "#FFFFFF" }}
            dropdownIconColor={"#9CA3AF"}
            selectionColor={"#FFFFFF"}
          >
            <Picker.Item key="select" label="Select bank" value="" />
            {(user.__banks || []).map((bank) => (
              <Picker.Item key={bank.code} label={bank.name} value={bank.code} />
            ))}
          </Picker>
        </View>

        {renderInputField(
          "Account name",
          user?.bankAccountName || "",
          (text) => setUser({ ...user, bankAccountName: text }),
          "person-outline",
        )}

        {renderInputField(
          "Account number",
          user?.bankAccountNumber || "",
          (text) => setUser({ ...user, bankAccountNumber: text }),
          "card-outline",
          "numeric",
        )}

        {/* Save Button */}
        <View className="mt-6">
          <Button
            text={authLoading ? "Saving Changes..." : "Save Changes"}
            bg={true}
            onPress={handleEditProfile}
            disabled={authLoading}
          />
        </View>

        <StatusBar backgroundColor={"#212A2B"} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default EditProfile;
