import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { Video, Audio } from "expo-av";
import axios from "axios";
import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from "@env";
import Button from "../../../../components/common/Button";
import { CustomSelect } from "../../../../components/agent/properties/CustomSelect";
import { fetchCountries } from "../../../../services/countryApi";
import { useProperty } from "../../../../contexts/PropertyContext";
import ErrorOrMessageModal from "../../../../components/common/ErrorOrMessageModal";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import LocationMap from "../../../../components/agent/properties/LocationMap";

// Reusable Input Component for consistency
const LemonInput = ({
  value,
  onChangeText,
  placeholder,
  multiline = false,
  keyboardType = "default",
}) => (
  <View className="mb-5">
    <Text className="text-gray-400 mb-2 font-rmedium ml-1">{placeholder}</Text>
    <TextInput
      placeholder={placeholder}
      placeholderTextColor="#6B7280"
      value={value}
      onChangeText={onChangeText}
      className={`bg-darkUmber-light text-white p-4 rounded-xl border border-gray-700 focus:border-lemonGreen font-rregular ${multiline ? "h-[120px]" : ""}`}
      style={multiline ? { textAlignVertical: "top" } : {}}
      multiline={multiline}
      keyboardType={keyboardType}
    />
  </View>
);

// Reusable Upload Box
const UploadBox = ({ onPress, icon, label, hasFile, loading }) => (
  <TouchableOpacity
    onPress={onPress}
    className={`h-[160px] w-full rounded-2xl items-center justify-center mb-6 border-2 border-dashed ${hasFile ? "border-lemonGreen bg-lemonGreen/10" : "border-gray-600 bg-darkUmber-light"}`}
  >
    {loading ? (
      <ActivityIndicator size="large" color="#BBCC13" />
    ) : hasFile ? (
      <View className="items-center">
        <Ionicons name="checkmark-circle" size={40} color="#BBCC13" />
        <Text className="text-lemonGreen font-rbold mt-2">File Uploaded</Text>
      </View>
    ) : (
      <View className="items-center">
        <View className="w-12 h-12 rounded-full bg-darkGrey items-center justify-center mb-2">
          <Ionicons name={icon} size={24} color="#BBCC13" />
        </View>
        <Text className="text-gray-400 font-rmedium">{label}</Text>
      </View>
    )}
  </TouchableOpacity>
);

const AddProperty = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("");
  const [country, setCountry] = useState("");
  const [propertyImages, setPropertyImages] = useState(Array(4).fill(null));
  const [propertyImagesUri, setPropertyImagesUri] = useState([]);
  const [video, setVideo] = useState("");
  const [document, setDocument] = useState("");
  const [uploading, setUploading] = useState(false);
  const [currencies, setCurrencies] = useState([]);
  const [coordinates, setCoordinates] = useState({});

  const router = useRouter();

  const categories = [
    { name: "Lands" },
    { name: "Houses" },
    { name: "Shop Spaces" },
    { name: "Office Buildings" },
    { name: "Industrial Buildings" },
    { name: "Hotels" },
  ];
  const statusItems = [{ name: "Rent" }, { name: "Lease" }, { name: "Sale" }];

  const {
    uploadProperty,
    propertyError,
    propertyMessage,
    setPropertyError,
    setPropertyMessage,
    propertyLoading,
  } = useProperty();

  useEffect(() => {
    const getCurrency = async () => {
      try {
        const countries = await fetchCountries();
        const currencyMap = new Map();

        countries.forEach((c) => {
          if (c.currencies) {
            // iterate entries so we keep the currency code (key)
            Object.entries(c.currencies).forEach(([code, cur]) => {
              // avoid duplicates: key by code
              if (!currencyMap.has(code)) {
                currencyMap.set(code, {
                  code,
                  name: cur.name,
                  symbol: cur.symbol || "",
                });
              }
            });
          }
        });

        // convert to array and sort by currency name (optional)
        const currencyArray = Array.from(currencyMap.values()).sort((a, b) =>
          a.name.localeCompare(b.name)
        );

        setCurrencies(currencyArray);
      } catch (error) {
        // handle error more gracefully in production
        console.error("Failed to load currencies", error);
        throw error;
      }
    };

    getCurrency();
  }, []);

  const handleNextStep = () => {
    if (currentStep === 1) {
      // For Hotels the status field is not shown/required, so only
      // validate status when category is not Hotels.
      if (
        !title ||
        !description ||
        !category ||
        (category !== "Hotels" && !status)
      ) {
        return setPropertyError("Input fields must not be empty");
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!price || !currency || !country) {
        return setPropertyError("Input fields must not be empty");
      }
      setCurrentStep(3);
    }
  };

  const handlePreviousStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleAddProperty = async () => {
    if (propertyImages.filter(Boolean).length === 0 || !video || !document) {
      return setPropertyError("Select the necessary files");
    }
    const documentType =
      category === "Hotels"
        ? "CAC/Tax"
        : status === "Rent"
          ? "Proof of Ownership"
          : "Property Document";

    await uploadProperty(
      title,
      description,
      category,
      status,
      price,
      currency,
      country,
      propertyImages,
      video,
      document,
      coordinates,
      documentType
    );
  };

  const uploadFileToCloudinary = async (file) => {
    const data = new FormData();
    data.append("file", {
      uri: file.assets[0].uri,
      type: file.assets[0].mimeType,
      name: file.assets[0].name,
    });
    data.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    setUploading(true);
    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`,
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setDocument(response.data.secure_url);
    } catch (error) {
      Alert.alert("Upload Error", "Failed to upload document to cloud");
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const uploadMediaToCloudinary = async (file, type, slot) => {
    const data = new FormData();
    data.append("file", {
      uri: file.uri,
      type: file.mimeType,
      name: file.fileName,
    });
    data.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    setUploading(true);
    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`,
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (type === "image") {
        setPropertyImages((prevImages) => {
          const updatedImages = [...prevImages];
          updatedImages[slot] = response.data.secure_url;
          return updatedImages;
        });
      } else if (type === "video") {
        setVideo(response.data.secure_url);
      }
    } catch (error) {
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const handleImageUpload = async (slot) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      base64: true,
    });

    if (!result.canceled) {
      const { uri, base64, fileSize, width, height } = result.assets[0];

      const getImageHash = (base64Data) => {
        if (!base64Data) return "";
        const sampleSize = 1000;
        const sample = base64Data.slice(0, sampleSize);
        let hash = 0;
        for (let i = 0; i < sample.length; i++) {
          hash = (hash << 5) - hash + sample.charCodeAt(i);
          hash = hash & hash;
        }
        return hash.toString();
      };

      const newImageHash = getImageHash(base64);

      const isDuplicate = propertyImagesUri.some((img) => {
        if (img.hash && img.hash === newImageHash) {
          return true;
        }

        const sizeDiff = Math.abs(img.fileSize - fileSize) / fileSize;
        return (
          img &&
          sizeDiff < 0.01 &&
          img.width === width &&
          img.height === height &&
          img.uri === uri
        );
      });

      if (isDuplicate) {
        setPropertyError("This image has already been selected.");
        return;
      }

      setPropertyImagesUri([
        ...propertyImagesUri,
        {
          uri,
          fileSize,
          width,
          height,
          hash: newImageHash,
        },
      ]);

      uploadMediaToCloudinary(result.assets[0], "image", slot);
    }
  };

  const handleVideoUpload = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      quality: 1,
    });

    if (!result.canceled) {
      const { uri } = result.assets[0];

      const sound = new Audio.Sound();

      try {
        await sound.loadAsync({ uri });
        const status = await sound.getStatusAsync();
        const durationInSeconds = (status.durationMillis || 0) / 1000;

        if (durationInSeconds < 10 || durationInSeconds > 30) {
          setPropertyError("The video must be between 10 and 30 seconds.");
          return;
        }

        uploadMediaToCloudinary(result.assets[0], "video");
      } catch (error) {
        throw error;
        setPropertyError("Unable to process the video. Please try again.");
      } finally {
        sound.unloadAsync();
      }
    }
  };

  const handleDocumentUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf"],
        copyToCacheDirectory: true,
      });

      if (result.type !== "cancel") {
        uploadFileToCloudinary(result);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick document");
    }
  };

  const handleLocationSelect = (coordinates) => {
    setCoordinates(coordinates);
  };

  const docLabel =
    category === "Hotels"
      ? "Upload CAC/Tax Document"
      : status === "Rent"
        ? "Upload Proof of Ownership"
        : "Upload Property Document";

  return (
    <SafeAreaView className="bg-darkGrey h-full">
      <ScrollView showsVerticalScrollIndicator={false} className="px-6 py-4">
        {propertyError && (
          <ErrorOrMessageModal
            visible={propertyError !== ""}
            modalType="error"
            onClose={() => setPropertyError("")}
            text={propertyError}
          />
        )}

        {propertyMessage && (
          <ErrorOrMessageModal
            visible={propertyMessage !== ""}
            modalType="success"
            onClose={() => setPropertyMessage("")}
            text={propertyMessage}
          />
        )}

        {/* Header */}
        <View className="flex-row items-center justify-between mb-8 mt-2">
          <View className="flex-row items-center gap-3">
            <TouchableOpacity
              onPress={() => router.back()}
              className="h-10 w-10 items-center justify-center rounded-full bg-darkUmber-light"
            >
              <Ionicons name="arrow-back" size={20} color="#BBCC13" />
            </TouchableOpacity>
            <Text className="text-white font-rbold text-2xl">Add Property</Text>
          </View>
          {/* Step Indicator */}
          <View className="bg-darkUmber-light px-3 py-1 rounded-full border border-gray-700">
            <Text className="text-lemonGreen font-rbold">
              Step {currentStep}/3
            </Text>
          </View>
        </View>

        {currentStep === 1 && (
          <View>
            <LemonInput
              placeholder="Property Title"
              value={title}
              onChangeText={setTitle}
            />

            <LemonInput
              placeholder="Description"
              value={description}
              onChangeText={setDescription}
              multiline={true}
            />

            <View className="mb-5">
              <Text className="text-gray-400 mb-2 font-rmedium ml-1">
                Category
              </Text>
              <CustomSelect
                placeholder="Choose category"
                selectedValue={category}
                options={categories}
                onSelect={(value) => setCategory(value.name)}
              />
            </View>

            {category !== "Hotels" && (
              <View className="mb-5">
                <Text className="text-gray-400 mb-2 font-rmedium ml-1">
                  Status
                </Text>
                <CustomSelect
                  placeholder="Choose status"
                  selectedValue={status}
                  options={statusItems}
                  onSelect={(value) => setStatus(value.name)}
                />
              </View>
            )}

            <View className="mt-4">
              <Button text="Continue" bg={true} onPress={handleNextStep} />
            </View>
          </View>
        )}

        {currentStep === 2 && (
          <View>
            <LemonInput
              placeholder="Price"
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
            />

            <View className="flex-row items-start gap-3 mb-6 bg-lemonGreen/10 p-4 rounded-xl">
              <Ionicons name="information-circle" size={20} color={"#BBCC13"} />
              <Text className="font-rregular text-gray-300 text-[13px] leading-5 flex-shrink">
                Note: Rental and lease prices should be quoted per annum
                (yearly).
              </Text>
            </View>

            <View className="mb-5">
              <Text className="text-gray-400 mb-2 font-rmedium ml-1">
                Currency
              </Text>
              <CustomSelect
                placeholder="Select Currency"
                selectedValue={currency}
                options={currencies}
                onSelect={(value) => setCurrency(value.code)}
              />
            </View>

            <LemonInput
              placeholder="Country"
              value={country}
              onChangeText={setCountry}
            />

            <Text className="font-rbold mb-4 text-xl text-white mt-2">
              Pin Location 📍
            </Text>
            <View className="h-[350px] w-full mb-6 rounded-2xl overflow-hidden border border-gray-700">
              <LocationMap onLocationSelect={handleLocationSelect} />
            </View>

            <View className="flex flex-row justify-between mt-4 gap-4">
              <View className="flex-1">
                <Button text="Back" bg={false} onPress={handlePreviousStep} />
              </View>
              <View className="flex-1">
                <Button
                  type="user"
                  text="Next"
                  bg={true}
                  onPress={handleNextStep}
                />
              </View>
            </View>
          </View>
        )}

        {currentStep === 3 && (
          <View>
            <Text className="font-rbold mb-4 text-xl text-white">
              Property Gallery 📸
            </Text>

            <ScrollView
              className="mb-8"
              showsHorizontalScrollIndicator={false}
              horizontal
            >
              {propertyImages.map((img, index) => (
                <TouchableOpacity
                  key={index}
                  className={`h-[160px] w-[160px] rounded-2xl mr-4 items-center justify-center border-2 border-dashed ${img ? "border-lemonGreen" : "border-gray-600 bg-darkUmber-light"}`}
                  onPress={() => handleImageUpload(index)}
                >
                  {img ? (
                    <Image
                      source={{ uri: img }}
                      className="h-full w-full rounded-2xl"
                      resizeMode="cover"
                    />
                  ) : (
                    <View className="items-center">
                      {uploading ? (
                        <ActivityIndicator size={"small"} color={"#BBCC13"} />
                      ) : (
                        <>
                          <Ionicons name="add" size={32} color="#BBCC13" />
                          <Text className="text-gray-500 text-xs mt-1">
                            Photo {index + 1}
                          </Text>
                        </>
                      )}
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text className="font-rbold mb-4 text-xl text-white">
              Property Video 🎥
            </Text>
            {video ? (
              <View className="rounded-2xl overflow-hidden mb-6 border border-lemonGreen">
                <Video
                  source={{ uri: video }}
                  className="w-full h-[220px]"
                  useNativeControls
                  resizeMode="cover"
                />
                <TouchableOpacity
                  onPress={() => setVideo("")}
                  className="absolute top-2 right-2 bg-red-500/80 p-2 rounded-full"
                >
                  <Ionicons name="trash" size={16} color="white" />
                </TouchableOpacity>
              </View>
            ) : (
              <UploadBox
                onPress={handleVideoUpload}
                icon="videocam"
                label="Upload Property Video (10-30s)"
                loading={uploading}
                hasFile={false}
              />
            )}

            <Text className="font-rbold mb-4 text-xl text-white mt-4">
              Verification Document 📄
            </Text>
            <Text className="text-gray-400 mb-4 text-sm -mt-2">{docLabel}</Text>

            {document ? (
              <TouchableOpacity
                onPress={async () => {
                  try {
                    await Linking.openURL(document);
                  } catch {
                    Alert.alert("Error", "Cannot open document externally");
                  }
                }}
                className="h-[60px] w-full rounded-xl bg-lemonGreen/20 border border-lemonGreen items-center flex-row justify-center mb-6 gap-2"
              >
                <Ionicons name="document-text" size={24} color="#BBCC13" />
                <Text className="text-lemonGreen font-rbold">
                  Preview Attached Document
                </Text>
              </TouchableOpacity>
            ) : (
              <UploadBox
                onPress={handleDocumentUpload}
                icon="cloud-upload"
                label="Tap to upload PDF"
                loading={uploading}
                hasFile={false}
              />
            )}

            <View className="flex flex-row justify-between mt-8 gap-4 mb-20">
              <View className="flex-1">
                <Button text="Back" bg={false} onPress={handlePreviousStep} />
              </View>
              <View className="flex-1">
                <Button
                  type="user"
                  text={propertyLoading ? "Publishing..." : "Submit Property"}
                  bg={true}
                  onPress={handleAddProperty}
                  loading={uploading || propertyLoading}
                />
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default AddProperty;
