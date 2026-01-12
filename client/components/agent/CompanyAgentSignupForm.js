import { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";
import { fetchCountries } from "../../services/countryApi";
import { useAuth } from "../../contexts/AuthContext";
import { config } from "../../config";

const CompanyAgentSignupForm = ({ agentDetails, setAgentDetails }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  // NEW: emergency contact
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
        throw error;
      }
    };

    const getBanks = async () => {
      try {
        const res = await fetch(`${config.API_BASE_URL}/api/user/banks`);
        const json = await res.json();
        if (json.success && json.banks) setBanks(json.banks);
      } catch (err) {
        console.warn("Failed to fetch banks:", err);
      }
    };

    getCountries();
    getBanks();
  }, []);

  const validateEmail = (email) => {
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;

    if (email.match(emailRegex)) {
      return true;
    } else {
      return false;
    }
  };

  const nextStep = () => {
    if (currentStep === 1) {
      if (agentDetails.companyName === "") {
        return setAuthError("Input fields must not be empty");
      }

      setCurrentStep((prevStep) => Math.min(prevStep + 1, 4));
    } else {
      if (
        agentDetails.currentAddress === "" ||
        agentDetails.country === "" ||
        agentDetails.mobileNumber === ""
      ) {
        return setAuthError("Input fields must not be empty");
      }

      setCurrentStep((prevStep) => Math.min(prevStep + 1, 4));
    }
  };

  const prevStep = () => {
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
      country: countryDetails.name.common,
      countryCode,
    });
  };

  const handleSignup = async () => {
    if (agentDetails.email === "" || agentDetails.password === "") {
      return setAuthError("Input fields must not be empty");
    }

    if (!validateEmail(agentDetails.email)) {
      return setAuthError("Enter a valid email");
    }

    if (agentDetails.password.length < 8) {
      return setAuthError(
        "Password length must be equal to or greater than 8 characters",
      );
    }

    if (
      !emergencyContact.name ||
      !emergencyContact.relationship ||
      !emergencyContact.phone ||
      !emergencyContact.email
    ) {
      return setAuthError(
        "Emergency contact must include name, relationship, phone and email",
      );
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
      {currentStep === 1 && (
        <View>
          <TextInput
            placeholder="Company Name"
            className="bg-frenchGray-light text-white p-2 mb-4 rounded-lg w-full font-rregular"
            placeholderTextColor="#9CA3AF"
            value={agentDetails.companyName}
            onChangeText={(text) =>
              setAgentDetails({ ...agentDetails, companyName: text })
            }
          />

          <TouchableOpacity
            onPress={nextStep}
            className="bg-chartreuse p-3 rounded-lg mt-4"
          >
            <Text className="text-center text-frenchGray-dark font-rbold">
              Next
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {currentStep === 2 && (
        <>
          <TextInput
            placeholder="Current Address"
            className="bg-frenchGray-light text-white p-2 mb-4 rounded-lg w-full font-rregular"
            placeholderTextColor="#9CA3AF"
            value={agentDetails.currentAddress}
            onChangeText={(text) =>
              setAgentDetails({ ...agentDetails, currentAddress: text })
            }
          />

          <View className="bg-frenchGray-light mb-4 rounded-lg w-full font-regular">
            <Picker
              selectedValue={selectedCountry}
              onValueChange={(itemValue) => handleCountryChange(itemValue)}
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

          <View className="flex-row items-center mb-4">
            <View className="bg-frenchGray-light text-white p-2 py-[14px] rounded-lg">
              <Text className="text-white">{`${agentDetails.countryCode}`}</Text>
            </View>
            <TextInput
              placeholder="Mobile Number"
              className="bg-frenchGray-light text-white p-2 ml-2 rounded-lg flex-1 font-regular"
              placeholderTextColor="#9CA3AF"
              value={agentDetails.mobileNumber}
              onChangeText={(text) =>
                setAgentDetails({ ...agentDetails, mobileNumber: text })
              }
            />
          </View>

          <TouchableOpacity
            onPress={prevStep}
            className="bg-frenchGray-dark p-3 rounded-lg mt-4"
          >
            <Text className="text-center text-white font-rbold">Back</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={nextStep}
            className="bg-chartreuse p-3 rounded-lg mt-4"
          >
            <Text className="text-center text-frenchGray-dark font-rbold">
              Next
            </Text>
          </TouchableOpacity>
        </>
      )}

      {currentStep === 3 && (
        <>
          <TextInput
            placeholder="Email"
            className="bg-frenchGray-light text-white p-2 mb-4 rounded-lg w-full font-rregular"
            placeholderTextColor="#9CA3AF"
            value={agentDetails.email}
            onChangeText={(text) =>
              setAgentDetails({ ...agentDetails, email: text })
            }
          />

          <View className="relative w-full">
            <TextInput
              placeholder="Password"
              secureTextEntry={!showPassword}
              className="bg-frenchGray-light text-white p-2 mb-4 rounded-lg w-full font-rregular"
              placeholderTextColor="#9CA3AF"
              value={agentDetails.password}
              onChangeText={(text) =>
                setAgentDetails({ ...agentDetails, password: text })
              }
            />
            <TouchableOpacity
              className="absolute top-[10px] right-[8px]"
              onPress={() => setShowPassword((prev) => !prev)}
            >
              <Ionicons
                name={showPassword ? "eye-outline" : "eye-off-outline"}
                size={20}
                color={"#9CA3AF"}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={prevStep}
            className="bg-frenchGray-dark p-3 rounded-lg mt-4"
          >
            <Text className="text-center text-white font-rbold">Back</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={nextStep}
            className="bg-chartreuse p-3 rounded-lg mt-4"
          >
            <Text className="text-center text-frenchGray-dark font-rbold">
              Next
            </Text>
          </TouchableOpacity>
        </>
      )}

      {/* NEW: Step 4 - Emergency contact + consent */}
      {currentStep === 4 && (
        <>
          <TextInput
            placeholder="Emergency contact name"
            className="bg-frenchGray-light text-white p-2 mb-4 rounded-lg w-full font-rregular"
            placeholderTextColor="#9CA3AF"
            value={emergencyContact.name}
            onChangeText={(text) =>
              setEmergencyContact({ ...emergencyContact, name: text })
            }
          />

          <TextInput
            placeholder="Relationship"
            className="bg-frenchGray-light text-white p-2 mb-4 rounded-lg w-full font-rregular"
            placeholderTextColor="#9CA3AF"
            value={emergencyContact.relationship}
            onChangeText={(text) =>
              setEmergencyContact({ ...emergencyContact, relationship: text })
            }
          />

          <TextInput
            placeholder="Emergency contact phone"
            className="bg-frenchGray-light text-white p-2 mb-4 rounded-lg w-full font-rregular"
            placeholderTextColor="#9CA3AF"
            keyboardType="phone-pad"
            value={emergencyContact.phone}
            onChangeText={(text) =>
              setEmergencyContact({ ...emergencyContact, phone: text })
            }
          />

          <TextInput
            placeholder="Emergency contact email"
            className="bg-frenchGray-light text-white p-2 mb-4 rounded-lg w-full font-rregular"
            placeholderTextColor="#9CA3AF"
            value={emergencyContact.email}
            onChangeText={(text) =>
              setEmergencyContact({ ...emergencyContact, email: text })
            }
          />

          {/* Bank details */}
          <View className="bg-frenchGray-light mb-4 rounded-lg w-full font-regular">
            <Picker
              selectedValue={selectedBankCode}
              onValueChange={(itemValue) => setSelectedBankCode(itemValue)}
              style={{ color: "#FFFFFF" }}
              dropdownIconColor={"#9CA3AF"}
              selectionColor={"#FFFFFF"}
            >
              <Picker.Item key="select" label="Select bank" value="" />
              {banks.map((bank) => (
                <Picker.Item key={bank.code} label={bank.name} value={bank.code} />
              ))}
            </Picker>
          </View>

          <TextInput
            placeholder="Account name"
            className="bg-frenchGray-light text-white p-2 mb-4 rounded-lg w-full font_rregular"
            placeholderTextColor="#9CA3AF"
            value={bankAccountName}
            onChangeText={(text) => setBankAccountName(text)}
          />

          <TextInput
            placeholder="Account number"
            className="bg-frenchGray-light text-white p-2 mb-4 rounded-lg w-full font_rregular"
            placeholderTextColor="#9CA3AF"
            keyboardType="numeric"
            value={bankAccountNumber}
            onChangeText={(text) => setBankAccountNumber(text)}
          />

          <TouchableOpacity
            onPress={prevStep}
            className="bg-frenchGray-dark p-3 rounded-lg mt-4"
          >
            <Text className="text-center text-white font-rbold">Back</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-chartreuse p-3 rounded-lg mt-4"
            onPress={handleSignup}
          >
            <Text className="text-center text-white">
              {authLoading ? "Loading..." : "Signup"}
            </Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

export default CompanyAgentSignupForm;
