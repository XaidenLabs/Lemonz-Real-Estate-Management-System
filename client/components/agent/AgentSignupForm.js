import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";
import { fetchCountries } from "../../services/countryApi";
import { useAuth } from "../../contexts/AuthContext";
import { config } from "../../config";

const InputField = ({
  icon,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  editable = true,
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
          className={`flex-1 text-white ml-3 font-rregular text-base ${!editable ? "opacity-50" : ""}`}
          placeholderTextColor="#6B7280"
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          editable={editable}
        />
      </View>
    </View>
  );
};

const AgentSignupForm = ({ agentDetails, setAgentDetails }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const [emergencyContact, setEmergencyContact] = useState({
    name: "",
    relationship: "",
    phone: "",
    email: "",
  });
  const [banks, setBanks] = useState([]);
  const [selectedBankCode, setSelectedBankCode] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [bankAccountName, setBankAccountName] = useState("");

  const { authLoading, setAuthError, register } = useAuth();

  useEffect(() => {
    const getCountries = async () => {
      try {
        const countriesData = await fetchCountries();
        setCountries(countriesData);
      } catch (error) {
        // failed silently
      }
    };

    // Manual Bank List
    const MANUAL_BANKS = [
      { name: "Access Bank", code: "044" },
      { name: "Citibank Nigeria", code: "023" },
      { name: "Ecobank Nigeria", code: "050" },
      { name: "Fidelity Bank", code: "070" },
      { name: "First Bank of Nigeria", code: "011" },
      { name: "First City Monument Bank", code: "214" },
      { name: "Globus Bank", code: "00103" },
      { name: "Guaranty Trust Bank", code: "058" },
      { name: "Heritage Bank", code: "030" },
      { name: "Jaiz Bank", code: "301" },
      { name: "Keystone Bank", code: "082" },
      { name: "Kuda Bank", code: "50211" },
      { name: "Moniepoint Microfinance Bank", code: "50371" },
      { name: "Opay", code: "100004" },
      { name: "Palmpay", code: "100033" },
      { name: "Polaris Bank", code: "076" },
      { name: "Providus Bank", code: "101" },
      { name: "Stanbic IBTC Bank", code: "221" },
      { name: "Standard Chartered Bank", code: "068" },
      { name: "Sterling Bank", code: "232" },
      { name: "SunTrust Bank", code: "100" },
      { name: "Titan Trust Bank", code: "102" },
      { name: "Union Bank of Nigeria", code: "032" },
      { name: "United Bank For Africa", code: "033" },
      { name: "Unity Bank", code: "215" },
      { name: "Wema Bank", code: "035" },
      { name: "Zenith Bank", code: "057" },
    ];

    setBanks(MANUAL_BANKS);

    getCountries();
    // getBanks(); // fetching from API removed
  }, []);

  const validateEmail = (email) => {
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;
    return !!email.match(emailRegex);
  };

  const nextStep = () => {
    if (currentStep === 1) {
      if (
        agentDetails.lastName === "" ||
        agentDetails.firstName === "" ||
        agentDetails.companyName === ""
      ) {
        return setAuthError("Input fields must not be empty");
      }
    } else if (currentStep === 2) {
      if (
        agentDetails.currentAddress === "" ||
        !agentDetails.country ||
        agentDetails.mobileNumber === ""
      ) {
        return setAuthError("Input fields must not be empty");
      }
    } else if (currentStep === 3) {
      if (agentDetails.email === "" || agentDetails.password === "") {
        return setAuthError("Input fields must not be empty");
      }
      if (!validateEmail(agentDetails.email)) {
        return setAuthError("Enter a valid email");
      }
      if (agentDetails.password.length < 8) {
        return setAuthError("Password must be at least 8 characters");
      }
    }

    setAuthError(""); // clear errors
    setCurrentStep((prevStep) => Math.min(prevStep + 1, 4));
  };

  const prevStep = () => {
    setAuthError("");
    setCurrentStep((prevStep) => Math.max(prevStep - 1, 1));
  };

  const handleCountryChange = (country) => {
    setSelectedCountry(country);
    const countryDetails = countries.find((c) => c.name.common === country);
    const countryCode = countryDetails?.idd?.root
      ? countryDetails.idd.root +
        (countryDetails.idd.suffixes ? countryDetails.idd.suffixes[0] : "")
      : "";
    setAgentDetails({
      ...agentDetails,
      country: countryDetails?.name.common,
      countryCode,
    });
  };

  const handleSignup = async () => {
    if (
      !emergencyContact.name ||
      !emergencyContact.relationship ||
      !emergencyContact.phone ||
      !emergencyContact.email
    ) {
      return setAuthError(
        "Emergency contact must include name, relationship, phone and email"
      );
    }

    if (!selectedBankCode || !bankAccountNumber || !bankAccountName) {
      return setAuthError("Please provide valid bank details");
    }

    const fullMobileNumber = `${agentDetails.countryCode}${agentDetails.mobileNumber}`;

    const updatedAgentDetails = {
      ...agentDetails,
      mobileNumber: fullMobileNumber,
      emergencyContact,
      bankAccountNumber,
      bankAccountName,
      bankName: banks.find((b) => b.code === selectedBankCode)?.name || "",
      bankCode: selectedBankCode,
    };

    await register(updatedAgentDetails);
  };

  return (
    <View className="mb-6">
      {/* Step Indicator */}
      <View className="flex-row justify-between mb-6 px-1">
        {[1, 2, 3, 4].map((step) => (
          <View
            key={step}
            className={`h-1 flex-1 rounded-full mx-1 ${step <= currentStep ? "bg-chartreuse" : "bg-[#2B3B3C]"}`}
          />
        ))}
      </View>

      {currentStep === 1 && (
        <View>
          <InputField
            icon="person-outline"
            placeholder="Last Name"
            value={agentDetails.lastName}
            onChangeText={(text) =>
              setAgentDetails({ ...agentDetails, lastName: text })
            }
          />
          <InputField
            icon="person-outline"
            placeholder="First Name"
            value={agentDetails.firstName}
            onChangeText={(text) =>
              setAgentDetails({ ...agentDetails, firstName: text })
            }
          />
          <InputField
            icon="briefcase-outline"
            placeholder="Brand Name"
            value={agentDetails.companyName}
            onChangeText={(text) =>
              setAgentDetails({ ...agentDetails, companyName: text })
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
        </View>
      )}

      {currentStep === 2 && (
        <>
          <InputField
            icon="location-outline"
            placeholder="Current Address"
            value={agentDetails.currentAddress}
            onChangeText={(text) =>
              setAgentDetails({ ...agentDetails, currentAddress: text })
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

          <View className="flex-row items-center mb-4">
            <View className="bg-[#2B3B3C] h-14 px-4 justify-center rounded-xl mr-2">
              <Text className="text-white font-rmedium">
                {agentDetails.countryCode || "+00"}
              </Text>
            </View>
            <View className="flex-1">
              <View className="flex-row items-center bg-[#2B3B3C] rounded-xl h-14 px-4">
                <Ionicons name="call-outline" size={20} color="#9CA3AF" />
                <TextInput
                  placeholder="Mobile Number"
                  className="flex-1 text-white ml-3 font-rregular text-base"
                  placeholderTextColor="#6B7280"
                  value={agentDetails.mobileNumber}
                  onChangeText={(text) =>
                    setAgentDetails({ ...agentDetails, mobileNumber: text })
                  }
                  keyboardType="phone-pad"
                />
              </View>
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
              onPress={nextStep}
              className="flex-1 bg-chartreuse p-4 rounded-xl"
            >
              <Text className="text-center text-[#212A2B] font-rbold text-lg">
                Next
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
            value={agentDetails.email}
            onChangeText={(text) =>
              setAgentDetails({ ...agentDetails, email: text })
            }
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <View className="mb-4">
            <View className="flex-row items-center bg-[#2B3B3C] rounded-xl h-14 px-4">
              <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />
              <TextInput
                placeholder="Password"
                secureTextEntry={!showPassword}
                className="flex-1 text-white ml-3 font-rregular text-base"
                placeholderTextColor="#6B7280"
                value={agentDetails.password}
                onChangeText={(text) =>
                  setAgentDetails({ ...agentDetails, password: text })
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
              onPress={nextStep}
              className="flex-1 bg-chartreuse p-4 rounded-xl"
            >
              <Text className="text-center text-[#212A2B] font-rbold text-lg">
                Next
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {currentStep === 4 && (
        <>
          <Text className="text-gray-300 text-sm mb-2 font-rmedium">
            Emergency Contact
          </Text>
          <InputField
            icon="person-outline"
            placeholder="Contact Name"
            value={emergencyContact.name}
            onChangeText={(text) =>
              setEmergencyContact({ ...emergencyContact, name: text })
            }
          />
          <InputField
            icon="people-outline"
            placeholder="Relationship"
            value={emergencyContact.relationship}
            onChangeText={(text) =>
              setEmergencyContact({ ...emergencyContact, relationship: text })
            }
          />
          <InputField
            icon="call-outline"
            placeholder="Contact Phone"
            value={emergencyContact.phone}
            onChangeText={(text) =>
              setEmergencyContact({ ...emergencyContact, phone: text })
            }
            keyboardType="phone-pad"
          />
          <InputField
            icon="mail-outline"
            placeholder="Contact Email"
            value={emergencyContact.email}
            onChangeText={(text) =>
              setEmergencyContact({ ...emergencyContact, email: text })
            }
            keyboardType="email-address"
          />

          <View className="border-t border-gray-700 my-4" />
          <Text className="text-gray-300 text-sm mb-2 font-rmedium">
            Bank Details (For Payouts)
          </Text>

          <View className="mb-4 bg-[#2B3B3C] rounded-xl border border-transparent h-14 justify-center">
            <Picker
              selectedValue={selectedBankCode}
              onValueChange={(itemValue) => setSelectedBankCode(itemValue)}
              style={{ color: "#FFFFFF" }}
              dropdownIconColor={"#9CA3AF"}
            >
              <Picker.Item
                key="select"
                label="Select Bank"
                value=""
                color="#9CA3AF"
              />
              {banks.map((bank) => (
                <Picker.Item
                  key={bank.code}
                  label={bank.name}
                  value={bank.code}
                  color="#000000"
                />
              ))}
            </Picker>
          </View>

          <InputField
            icon="card-outline"
            placeholder="Account Number"
            value={bankAccountNumber}
            onChangeText={(text) => setBankAccountNumber(text)}
            keyboardType="numeric"
          />

          <InputField
            icon="person-circle-outline"
            placeholder="Account Name"
            value={bankAccountName}
            onChangeText={setBankAccountName}
            editable={true}
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
              className="flex-1 bg-chartreuse p-4 rounded-xl flex-row justify-center items-center"
              onPress={handleSignup}
              disabled={authLoading}
            >
              {authLoading ? (
                <ActivityIndicator color="#212A2B" />
              ) : (
                <Text className="text-center text-[#212A2B] font-rbold text-lg">
                  Submit
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

export default AgentSignupForm;
