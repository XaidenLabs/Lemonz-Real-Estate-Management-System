import React from "react";
import { View, Text, Dimensions } from "react-native";
import { BarChart, LineChart, ProgressChart } from "react-native-chart-kit";
import Ionicons from "@expo/vector-icons/Ionicons";
import Skeleton from "../../common/Skeleton";

const screenWidth = Dimensions.get("window").width;

const PropertiesAnalytics = ({
  propertiesForRent,
  propertiesForLease,
  propertiesForSale,
  analytics,
  loading,
}) => {
  const chartConfig = {
    backgroundGradientFrom: "#1E2923",
    backgroundGradientFromOpacity: 0,
    backgroundGradientTo: "#08130D",
    backgroundGradientToOpacity: 0,
    color: (opacity = 1) => `rgba(187, 204, 19, ${opacity})`, // Chartreuse
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    propsForDots: {
      r: "4",
      strokeWidth: "2",
      stroke: "#BBCC13",
    },
    propsForLabels: {
      fontSize: 10,
      fill: "#9CA3AF",
    },
  };

  const totalProperties =
    propertiesForRent + propertiesForLease + propertiesForSale;

  const labels =
    analytics?.labels?.length > 0
      ? analytics.labels
      : ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const engagementValues =
    analytics?.engagement?.length > 0
      ? analytics.engagement
      : [0, 0, 0, 0, 0, 0];
  const revenueValues =
    analytics?.revenue?.length > 0 ? analytics.revenue : [0, 0, 0, 0, 0, 0];

  // Data for "Customers Engagement"
  const barData = {
    labels: labels,
    datasets: [
      {
        data: engagementValues,
      },
    ],
  };

  // Data for "Revenue Growth"
  const lineData = {
    labels: labels,
    datasets: [
      {
        data: revenueValues,
        color: (opacity = 1) => `rgba(187, 204, 19, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

  // Data for "Top Products/Services" (Real Data)
  const ringData = {
    labels: ["Rent", "Sale", "Lease"],
    data: [
      totalProperties ? propertiesForRent / totalProperties : 0,
      totalProperties ? propertiesForSale / totalProperties : 0,
      totalProperties ? propertiesForLease / totalProperties : 0,
    ],
    colors: ["#BBCC13", "#FFFFFF", "#616A60"],
  };

  const CardHeader = ({ title, subtitle }) => (
    <View className="flex-row justify-between items-center mb-4">
      <View>
        <Text className="text-white font-rbold text-base">{title}</Text>
        {subtitle && (
          <Text className="text-gray-400 text-xs font-rregular">
            {subtitle}
          </Text>
        )}
      </View>
      <Ionicons name="ellipsis-horizontal" size={20} color="#9CA3AF" />
    </View>
  );

  const cardStyle = {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  };

  if (loading) {
    return (
      <View>
        {/* Skeleton for 3 charts */}
        {[1, 2, 3].map((i) => (
          <View key={i} style={cardStyle}>
            <View className="flex-row justify-between mb-4">
              <Skeleton width={150} height={20} />
              <Skeleton width={20} height={10} />
            </View>
            <View className="items-center">
              <Skeleton
                width={screenWidth - 64}
                height={200}
                borderRadius={10}
              />
            </View>
          </View>
        ))}
      </View>
    );
  }

  return (
    <View>
      {/* Customers Engagement (Bar Chart) */}
      <View style={cardStyle}>
        <CardHeader title="Customers Engagement" />
        <View className="items-center">
          <BarChart
            data={barData}
            width={screenWidth - 64}
            height={220}
            yAxisLabel=""
            chartConfig={{
              ...chartConfig,
              fillShadowGradient: "#BBCC13",
              fillShadowGradientOpacity: 1,
            }}
            verticalLabelRotation={0}
            showBarTops={false}
            fromZero
            withInnerLines={false}
          />
        </View>
      </View>

      {/* Revenue Growth (Line Chart) */}
      <View style={cardStyle}>
        <CardHeader
          title="Revenue Growth"
          subtitle="Total Revenue • New Sales • Refunds"
        />
        <View className="items-center">
          <LineChart
            data={lineData}
            width={screenWidth - 64}
            height={220}
            chartConfig={{
              ...chartConfig,
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            }}
            bezier
            style={{
              borderRadius: 16,
            }}
            withVerticalLines={false}
            withHorizontalLines={true}
          />
        </View>
      </View>

      {/* Top Products/Services (Ring Chart/Progress) */}
      <View style={cardStyle}>
        <CardHeader title="Top Products/Services" />
        <View className="items-center">
          <ProgressChart
            data={ringData}
            width={screenWidth - 64}
            height={220}
            strokeWidth={16}
            radius={32}
            chartConfig={{
              ...chartConfig,
              color: (opacity = 1, index) => {
                const colors = ["#BBCC13", "#FFFFFF", "#616A60"];
                return colors[index] || `rgba(255, 255, 255, ${opacity})`;
              },
            }}
            hideLegend={false}
          />
        </View>
      </View>
    </View>
  );
};

export default PropertiesAnalytics;
