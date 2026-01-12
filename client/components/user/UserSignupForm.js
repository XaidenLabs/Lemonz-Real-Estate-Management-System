import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";
import { fetchCountries } from "../../services/countryApi";
import { useAuth } from "../../contexts/AuthContext";

const InputField = ({
  icon,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View className="mb-4">
      <View
        className={`flex-row items-center bg-[#2B3B3C] rounded-xl border ${
          isFocused ? "border-chartreuse" : "border-transparent"
        } h-14 px-4`}
      >
        <Ionicons
          name={icon}
          size={20}
          color={isFocused ? "#BBCC13" : "#9CA3AF"}
        />
        <TextInput
          placeholder={placeholder}
          className="flex-1 text-white ml-3 font-rregular text-base"
          placeholderTextColor="#6B7280"
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
        />
      </View>
    </View>
  );
};

const UserSignupForm = ({ userDetails, setUserDetails }) => {
  const { register, setAuthError, authLoading } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedProperties, setSelectedProperties] = useState([]);

  const propertyOptions = [
    "Lands",
    "Houses",
    "Shop Spaces",
    "Office Buildings",
    "Industrial Buildings",
    "Apartment",
    "Villas",
  ];

  useEffect(() => {
    const getCountries = async () => {
      const data = await fetchCountries();
      setCountries(data);
    };
    getCountries();
  }, []);

  const togglePropertySelection = (property) => {
    if (selectedProperties.includes(property)) {
      setSelectedProperties(selectedProperties.filter((p) => p !== property));
      setUserDetails({
        ...userDetails,
        propertiesOfInterest: selectedProperties.filter((p) => p !== property),
      });
    } else {
      setSelectedProperties([...selectedProperties, property]);
      setUserDetails({
        ...userDetails,
        propertiesOfInterest: [...selectedProperties, property],
      });
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;
    return !!email.match(emailRegex);
  };

  const nextStep = () => {
    if (currentStep === 1) {
      if (selectedProperties.length < 1) {
        return setAuthError("Choose at least one property category");
      }

      if (userDetails.lastName === "" || userDetails.firstName === "") {
        return setAuthError("Input fields must not be empty");
      }

      setCurrentStep((prevStep) => Math.min(prevStep + 1, 3));
    } else if (currentStep === 2) {
      if (
        userDetails.currentAddress === "" ||
        !userDetails.country ||
        userDetails.mobileNumber === ""
      ) {
        return setAuthError("Input fields must not be empty");
      }

      setCurrentStep((prevStep) => Math.min(prevStep + 1, 3));
    }
  };

  const prevStep = () => {
    setCurrentStep((prevStep) => Math.max(prevStep - 1, 1));
  };

  const handleCountryChange = (countryName) => {
    setSelectedCountry(countryName);
    const countryDetails = countries.find((c) => c.name.common === countryName);
    const countryCode = countryDetails?.idd?.root
      ? countryDetails.idd.root +
        (countryDetails.idd.suffixes ? countryDetails.idd.suffixes[0] : "")
      : "";

    setUserDetails({
      ...userDetails,
      country: countryDetails?.name.common,
      countryCode: countryCode || "",
    });
  };

  const handleSignup = async () => {
    if (userDetails.email === "" || userDetails.password === "") {
      return setAuthError("Input fields must not be empty");
    }

    if (!validateEmail(userDetails.email)) {
      return setAuthError("Enter a valid email");
    }

    if (userDetails.password.length < 8) {
      return setAuthError(
        "Password length must be equal to or greater than 8 characters"
      );
    }

    const fullMobileNumber = `${userDetails.countryCode}${userDetails.mobileNumber}`;

    const updatedUserDetails = {
      ...userDetails,
      mobileNumber: fullMobileNumber,
    };

    await register(updatedUserDetails);
  };

  return (
    <View className="mb-6">
      {/* Step Indicator */}
      <View className="flex-row justify-between mb-6 px-1">
        {[1, 2, 3].map((step) => (
          <View
            key={step}
            className={`h-1 flex-1 rounded-full mx-1 ${step <= currentStep ? "bg-chartreuse" : "bg-[#2B3B3C]"}`}
          />
        ))}
      </View>

      {currentStep === 1 && (
        <>
          <Text className="text-gray-300 text-base mb-3 font-rmedium">
            Properties of Interest
          </Text>
          <View className="flex-row flex-wrap mb-4">
            {propertyOptions.map((property) => (
              <TouchableOpacity
                key={property}
                className={`p-3 mr-2 mb-2 rounded-xl border ${
                  selectedProperties.includes(property)
                    ? "bg-[rgba(187,204,19,0.1)] border-chartreuse"
                    : "bg-[#2B3B3C] border-transparent"
                }`}
                onPress={() => togglePropertySelection(property)}
              >
                <Text
                  className={`text-center font-rregular ${
                    selectedProperties.includes(property)
                      ? "text-chartreuse"
                      : "text-gray-400"
                  }`}
                >
                  {property}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <InputField
            icon="person-outline"
            placeholder="Last Name"
            value={userDetails.lastName}
            onChangeText={(text) =>
              setUserDetails({ ...userDetails, lastName: text })
            }
          />
          <InputField
            icon="person-outline"
            placeholder="First Name"
            value={userDetails.firstName}
            onChangeText={(text) =>
              setUserDetails({ ...userDetails, firstName: text })
            }
          />
          <InputField
            icon="person-outline"
            placeholder="Middle Name (Optional)"
            value={userDetails.middleName}
            onChangeText={(text) =>
              setUserDetails({ ...userDetails, middleName: text })
            }
          />

          <TouchableOpacity
            onPress={nextStep}
            className="bg-chartreuse p-4 rounded-xl mt-2"
          >
            <Text className="text-center text-[#212A2B] font-rbold text-lg">
              Next Step
            </Text>
          </TouchableOpacity>
        </>
      )}

      {currentStep === 2 && (
        <>
          <InputField
            icon="location-outline"
            placeholder="Current Address"
            value={userDetails.currentAddress}
            onChangeText={(text) =>
              setUserDetails({ ...userDetails, currentAddress: text })
            }
          />

          <View className="mb-4 bg-[#2B3B3C] rounded-xl border border-transparent h-14 justify-center">
            <Picker
              selectedValue={selectedCountry}
              onValueChange={(itemValue) => handleCountryChange(itemValue)}
              style={{ color: "#FFFFFF" }}
              dropdownIconColor={"#9CA3AF"}
            >
              <Picker.Item
                key="select"
                label="Select Country"
                value=""
                color="#9CA3AF"
              />
              {countries.map((country) => (
                <Picker.Item
                  key={country?.name.common}
                  label={country?.name.common}
                  value={country?.name.common}
                  color="#000000"
                />
              ))}
            </Picker>
          </View>

          <InputField
            icon="call-outline"
            placeholder="Mobile Number"
            value={userDetails.mobileNumber}
            onChangeText={(text) =>
              setUserDetails({ ...userDetails, mobileNumber: text })
            }
            keyboardType="phone-pad"
          />

          <View className="flex-row gap-3 mt-2">
            <TouchableOpacity
              onPress={prevStep}
              className="flex-1 bg-[#3D454B] p-4 rounded-xl"
            >
              <Text className="text-center text-white font-rbold text-lg">
                Back
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={nextStep}
              className="flex-1 bg-chartreuse p-4 rounded-xl"
            >
              <Text className="text-center text-[#212A2B] font-rbold text-lg">
                Next Step
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {currentStep === 3 && (
        <>
          <InputField
            icon="mail-outline"
            placeholder="Email Address"
            keyboardType="email-address"
            autoCapitalize="none"
            value={userDetails.email}
            onChangeText={(text) =>
              setUserDetails({ ...userDetails, email: text })
            }
          />

          <View className="mb-4">
            <View className="flex-row items-center bg-[#2B3B3C] rounded-xl h-14 px-4">
              <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />
              <TextInput
                placeholder="Create Password"
                secureTextEntry={!showPassword}
                className="flex-1 text-white ml-3 font-rregular text-base"
                placeholderTextColor="#6B7280"
                value={userDetails.password}
                onChangeText={(text) =>
                  setUserDetails({ ...userDetails, password: text })
                }
              />
              <TouchableOpacity
                onPress={() => setShowPassword((prev) => !prev)}
              >
                <Ionicons
                  name={showPassword ? "eye-outline" : "eye-off-outline"}
                  size={20}
                  color="#9CA3AF"
                />
              </TouchableOpacity>
            </View>
          </View>

          <View className="flex-row gap-3 mt-2">
            <TouchableOpacity
              onPress={prevStep}
              className="flex-1 bg-[#3D454B] p-4 rounded-xl"
            >
              <Text className="text-center text-white font-rbold text-lg">
                Back
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 bg-chartreuse p-4 rounded-xl flex-row justify-center items-center"
              onPress={handleSignup}
              disabled={authLoading}
            >
              {authLoading ? (
                <ActivityIndicator color="#212A2B" />
              ) : (
                <Text className="text-center text-[#212A2B] font-rbold text-lg">
                  Sign Up
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

export default UserSignupForm;
