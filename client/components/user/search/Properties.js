import { View, Text } from "react-native";
import ErrorOrMessageModal from "../../common/ErrorOrMessageModal";
import Button from "../../common/Button";
import NoProperties from "../NoProperties";
import PropertyCard from "./PropertyCard";

const Properties = ({
  properties,
  updateProperty,
  propertyMessage,
  setPropertyMessage,
  userId,
  setPage,
  currentPage,
  totalPages,
}) => {
  if (properties.length === 0) {
    return <NoProperties type="none" />;
  }

  return (
    <View>
      <View className="flex-row flex-wrap justify-between mt-2">
        {properties.map((property) => (
          <PropertyCard
            key={property._id}
            property={property}
            onLikePress={updateProperty}
          />
        ))}

        <ErrorOrMessageModal
          visible={propertyMessage !== ""}
          modalType="message"
          onClose={() => setPropertyMessage("")}
          text={propertyMessage}
        />
      </View>

      <View className="flex-row items-center justify-between mt-4">
        <Button
          text="Previous"
          bg={currentPage > 1}
          onPress={() => {
            setPage(currentPage - 1);
          }}
          disabled={currentPage === 1}
        />

        <Text className="text-sm font-rregular mx-3 text-white">
          Page {currentPage} of {totalPages}
        </Text>

        <Button
          text="Next"
          bg={currentPage < totalPages}
          onPress={() => {
            setPage(currentPage + 1);
          }}
          disabled={currentPage === totalPages}
        />
      </View>
    </View>
  );
};

export default Properties;
