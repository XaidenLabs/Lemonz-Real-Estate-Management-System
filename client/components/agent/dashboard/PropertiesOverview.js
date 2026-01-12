import { View, Text } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import Skeleton from "../../common/Skeleton";

const PropertiesOverview = ({
  numberOfProperties,
  propertiesForRent,
  propertiesForLease,
  propertiesForSale,
  totalRevenue,
  loading,
}) => {
  const Card = ({ icon, value, label, subLabel, color = "#BBCC13" }) => (
    <View
      style={{
        backgroundColor: "rgba(255, 255, 255, 0.05)",
        borderColor: "rgba(255, 255, 255, 0.1)",
      }}
      className="w-[48%] p-4 rounded-2xl border mb-4"
    >
      {loading ? (
        <View>
          <View className="flex-row justify-between mb-2">
            <Skeleton width={30} height={30} borderRadius={15} />
            <Skeleton width={20} height={10} borderRadius={4} />
          </View>
          <Skeleton width={100} height={28} style={{ marginBottom: 4 }} />
          <Skeleton width={80} height={12} />
        </View>
      ) : (
        <>
          <View className="flex-row justify-between items-start mb-2">
            <Ionicons name={icon} size={24} color={color} />
            <View className="bg-[#2B3B3C] p-1 rounded-md">
              <Ionicons name="ellipsis-horizontal" size={16} color="#9CA3AF" />
            </View>
          </View>
          <Text
            className="text-white text-2xl font-rbold mb-1"
            numberOfLines={1}
          >
            {value}
          </Text>
          <Text className="text-gray-400 text-xs font-rregular">{label}</Text>
        </>
      )}
    </View>
  );

  return (
    <View className="flex-row flex-wrap justify-between">
      <Card
        icon="wallet-outline"
        value={`$${(totalRevenue || 0).toLocaleString()}`}
        label="Lifetime Revenue"
      />
      <Card
        icon="business-outline"
        value={numberOfProperties}
        label="Total Properties"
      />
      <Card
        icon="pricetag-outline"
        value={propertiesForSale}
        label="For Sale"
      />
      <Card
        icon="key-outline"
        value={propertiesForRent + propertiesForLease}
        label="Rent & Lease"
      />
    </View>
  );
};

export default PropertiesOverview;
