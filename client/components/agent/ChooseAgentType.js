import { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AgentSignupForm from "./AgentSignupForm";
import CompanyAgentSignupForm from "./CompanyAgentSignupForm";

const Continue = ({ agentType, agentTypeIcon, onPress }) => {
  return (
    <TouchableOpacity
      className="flex-row items-center justify-between w-full bg-frenchGray-dark rounded-lg px-2 py-4 mb-4"
      onPress={onPress}
    >
      <View className="flex-row items-center justify-start gap-2">
        <Ionicons name={agentTypeIcon} size={20} color={"#9CA3AF"} />
        <Text className="text-white font-rbold">
          Continue as {agentType === "Individual" ? "an" : "a"} {agentType}
        </Text>
      </View>
      <Ionicons name="arrow-forward-outline" size={20} color={"#9CA3AF"} />
    </TouchableOpacity>
  );
};

const ChooseAgentType = () => {
  const [showAgentForm, setShowAgentForm] = useState(false);
  const [showIndividualAgentForm, setShowIndividualAgentForm] = useState(false);
  const [showCompanyAgentForm, setShowCompanyAgentForm] = useState(false);
  const [companyAgentDetails, setCompanyAgentDetails] = useState({
    companyName: "",
    currentAddress: "",
    country: "",
    countryCode: "",
    mobileNumber: "",
    email: "",
    password: "",
    role: "",
  });

  const [individualAgentDetails, setIndividualAgentDetails] = useState({
    lastName: "",
    firstName: "",
    companyName: "",
    currentAddress: "",
    country: "",
    countryCode: "",
    mobileNumber: "",
    email: "",
    password: "",
    role: "",
  });

  return (
    <>
      {!showAgentForm ? (
        <View>
          <Continue
            agentType="Individual"
            agentTypeIcon="person-outline"
            onPress={() => {
              setShowAgentForm(true);
              setShowIndividualAgentForm(true);
              setIndividualAgentDetails({
                ...individualAgentDetails,
                role: "individual-agent",
              });
            }}
          />

          <Continue
            agentType="Company"
            agentTypeIcon="business-outline"
            onPress={() => {
              setShowAgentForm(true);
              setShowCompanyAgentForm(true);
              setCompanyAgentDetails({
                ...companyAgentDetails,
                role: "company-agent",
              });
            }}
          />
        </View>
      ) : showCompanyAgentForm ? (
        <CompanyAgentSignupForm
          agentDetails={companyAgentDetails}
          setAgentDetails={setCompanyAgentDetails}
        />
      ) : (
        showIndividualAgentForm && (
          <AgentSignupForm
            agentDetails={individualAgentDetails}
            setAgentDetails={setIndividualAgentDetails}
          />
        )
      )}
    </>
  );
};

export default ChooseAgentType;
