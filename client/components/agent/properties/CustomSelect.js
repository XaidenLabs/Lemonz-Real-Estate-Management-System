import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TouchableWithoutFeedback,
} from "react-native";

export const CustomSelect = ({
  placeholder,
  selectedValue,
  options,
  onSelect,
  handleModalClose,
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const handleSelect = (item) => {
    onSelect(item);
    setModalVisible(false);
  };

  const closeModal = () => {
    setModalVisible(false);
    if (handleModalClose) handleModalClose();
  };

  return (
    <View className="bg-frenchGray-light rounded-lg mb-4 w-full">
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        className="p-2 py-4 flex-row items-center justify-between"
      >
        <Text className="text-white font-rsemibold">
          {selectedValue || placeholder}
        </Text>
        <Ionicons name="chevron-down-outline" size={17} color={"#FFFFFF"} />
      </TouchableOpacity>

      <Modal
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
        animationType="slide"
      >
        <TouchableWithoutFeedback onPress={closeModal}>
          <View className="flex-1 justify-center items-center bg-transparentBlack">
            <View className="bg-frenchGray-dark rounded-lg w-4/5">
              <FlatList
                data={options}
                keyExtractor={(item) => item.name}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => handleSelect(item)}
                    className="px-4 py-2 mb-2"
                  >
                    <Text className="text-white font-rregular">
                      {item.name} {item.symbol ? ` - ${item.symbol}` : ""}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};
