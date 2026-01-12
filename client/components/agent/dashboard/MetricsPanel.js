import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import axios from "axios";
import { config } from "../../../config";
import { getToken } from "../../../services/getToken";
import Skeleton from "../../common/Skeleton";

const MetricsPanel = ({ agentId }) => {
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agentId]);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const response = await axios.get(
        `${config.API_BASE_URL}/api/property/metrics/${agentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMetrics(response.data.properties || []);
    } catch (error) {
      console.error("Error fetching metrics:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderSkeletons = () => {
    return (
      <View>
        {[1, 2, 3].map((i) => (
          <View
            key={i}
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              borderColor: "rgba(255, 255, 255, 0.1)",
            }}
            className="border p-4 rounded-2xl mb-3 flex-row justify-between items-center"
          >
            <View className="flex-1 mr-4">
              <Skeleton width={120} height={20} style={{ marginBottom: 6 }} />
              <Skeleton width={80} height={12} />
            </View>
            <View className="flex-row gap-4">
              <Skeleton width={30} height={30} borderRadius={15} />
              <Skeleton width={30} height={30} borderRadius={15} />
              <Skeleton width={30} height={30} borderRadius={15} />
            </View>
          </View>
        ))}
      </View>
    );
  };

  return (
    <View className="mb-20">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-white font-rbold text-xl">
          Property Performance
        </Text>
        <TouchableOpacity onPress={fetchMetrics}>
          <Ionicons name="refresh-circle" size={28} color="#BBCC13" />
        </TouchableOpacity>
      </View>

      {loading ? (
        renderSkeletons()
      ) : metrics.length === 0 ? (
        <View className="items-center py-4">
          <Text className="text-gray-400 font-rregular">
            No performance data yet.
          </Text>
        </View>
      ) : (
        <ScrollView scrollEnabled={false}>
          {metrics.map((property) => (
            <View
              key={property._id}
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                borderColor: "rgba(255, 255, 255, 0.1)",
              }}
              className="border p-4 rounded-2xl mb-3 flex-row justify-between items-center"
            >
              <View className="flex-1 mr-4">
                <Text className="text-white font-rbold mb-1" numberOfLines={1}>
                  {property.title}
                </Text>
                <Text className="text-gray-400 font-rregular text-xs">
                  {property.address || "No address"}
                </Text>
              </View>

              <View className="flex-row gap-4">
                <View className="items-center">
                  <Ionicons name="heart" size={16} color="#FF4D4D" />
                  <Text className="text-white font-rbold text-xs mt-1">
                    {property.savedBy.length || 0}
                  </Text>
                </View>

                <View className="items-center">
                  <Ionicons name="eye" size={16} color="#BBCC13" />
                  <Text className="text-white font-rbold text-xs mt-1">
                    {property.views || 0}
                  </Text>
                </View>

                <View className="items-center">
                  <Ionicons name="videocam" size={16} color="#3B82F6" />
                  <Text className="text-white font-rbold text-xs mt-1">
                    {property.videoViews || 0}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

export default MetricsPanel;
