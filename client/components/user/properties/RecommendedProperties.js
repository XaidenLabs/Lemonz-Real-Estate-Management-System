import { View, Text, ScrollView } from "react-native";
import { useEffect } from "react";
import { usePreferences } from "../../../contexts/PreferencesContext";
import PropertyCard from "../search/PropertyCard";
import NoProperties from "../NoProperties";

const RecommendedProperties = () => {
  const { recommendations, loading, fetchRecommendations } = usePreferences();

  useEffect(() => {
    fetchRecommendations();
  }, []);

  if (loading) {
    return (
      <View className="p-4">
        <Text className="text-white font-rbold mb-4">
          Loading recommendations...
        </Text>
      </View>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return <NoProperties type="recommended" />;
  }

  return (
    <View className="p-4">
      <Text className="text-white font-rbold text-xl mb-4">
        Recommended for You
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {recommendations.map((property) => (
          <View key={property._id} style={{ width: 280 }} className="mr-4">
            <PropertyCard property={property} showLikeButton={true} />
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default RecommendedProperties;
