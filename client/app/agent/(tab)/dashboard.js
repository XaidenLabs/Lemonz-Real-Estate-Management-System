import { useEffect, useState } from "react";
import { View, ScrollView, StatusBar, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Header from "../../../components/agent/dashboard/Header";
import PropertiesOverview from "../../../components/agent/dashboard/PropertiesOverview";
import PropertiesAnalytics from "../../../components/agent/dashboard/PropertiesAnalytics";
import MetricsPanel from "../../../components/agent/dashboard/MetricsPanel";
import { useProperty } from "../../../contexts/PropertyContext";
import { useAuth } from "../../../contexts/AuthContext";
import OnboardingTutorial from "../../../components/common/OnboardingTutorial";

const AGENT_KEY = "onboarding_agent_seen_v1";

const Dashboard = () => {
  const { user } = useAuth();
  const {
    getProperties,
    agentProperties,
    agentRentProperties,
    agentLeaseProperties,
    agentSaleProperties,
    analytics,
    propertyLoading,
  } = useProperty();

  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    const getPropertiesDetails = async () => {
      await getProperties();
    };
    getPropertiesDetails();
  }, []);

  useEffect(() => {
    const checkTutorial = async () => {
      try {
        const seen = await AsyncStorage.getItem(AGENT_KEY);
        if (!seen) {
          setShowTutorial(true); // only show if agent hasn’t seen it
        }
      } catch (err) {
        // in case of error, default to showing tutorial (safe fallback)
        setShowTutorial(true);
      }
    };

    checkTutorial();
  }, []);

  const [refreshing, setRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); // Key to force re-render/fetch of MetricsPanel

  const onRefresh = async () => {
    setRefreshing(true);
    // Refresh properties
    await getProperties();
    // Refresh metrics by updating key
    setRefreshKey((prev) => prev + 1);
    setRefreshing(false);
  };

  const handleTutorialComplete = async () => {
    setShowTutorial(false);
    await AsyncStorage.setItem(AGENT_KEY, "true");
  };

  return (
    <View className="flex-1 bg-darkUmber-dark">
      <StatusBar barStyle="light-content" backgroundColor="#1A1D1E" />

      {/* Tutorial Overlay */}
      {showTutorial && (
        <OnboardingTutorial
          visible={showTutorial}
          onClose={handleTutorialComplete}
          userType="agent"
        />
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#BBCC13"
          />
        }
      >
        <SafeAreaView className="flex-1">
          <View className="px-4 py-2 space-y-6">
            <Header />

            {/* Overview Stats */}
            <PropertiesAnalytics
              propertiesForRent={agentRentProperties.length}
              propertiesForLease={agentLeaseProperties.length}
              propertiesForSale={agentSaleProperties.length}
              analytics={analytics}
              loading={propertyLoading || refreshing}
            />

            {/* Metrics Panel */}
            <MetricsPanel key={refreshKey} agentId={user?._id} />

            <View className="h-20" />
          </View>
        </SafeAreaView>
      </ScrollView>
    </View>
  );
};

export default Dashboard;
