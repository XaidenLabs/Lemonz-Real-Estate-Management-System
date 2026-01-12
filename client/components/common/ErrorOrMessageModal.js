import { Ionicons } from "@expo/vector-icons";
import { View, Text, TouchableOpacity, Modal, Platform } from "react-native";
import Animated, { FadeInUp, FadeOutUp } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const ErrorOrMessageModal = ({ visible, modalType, onClose, text }) => {
  if (!visible) return null;

  const isError = modalType === "error";
  const iconName = isError ? "alert-circle" : "checkmark-circle";
  const accentColor = isError ? "#EF4444" : "#BBCC13"; // Red-500 or Chartreuse
  const bgColor = isError ? "rgba(69, 10, 10, 0.95)" : "rgba(20, 30, 20, 0.95)"; // Dark Red or Dark Green tinted
  const borderColor = isError
    ? "rgba(239, 68, 68, 0.3)"
    : "rgba(187, 204, 19, 0.3)";

  return (
    <Modal visible={visible} transparent={true} animationType="fade">
      <SafeAreaView style={{ flex: 1, pointerEvents: "box-none" }}>
        <Animated.View
          entering={FadeInUp.springify().damping(15)}
          exiting={FadeOutUp}
          style={{
            position: "absolute",
            top: Platform.OS === "ios" ? 60 : 40,
            left: 20,
            right: 20,
            zIndex: 100,
          }}
        >
          <View
            style={{
              backgroundColor: "#1A1F20", // Fallback / Base
              borderRadius: 16,
              borderWidth: 1,
              borderColor: borderColor,
              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 4,
              },
              shadowOpacity: 0.3,
              shadowRadius: 4.65,
              elevation: 8,
              overflow: "hidden",
            }}
          >
            {/* Gradient/tint overlay */}
            <View
              style={{
                backgroundColor: bgColor,
                padding: 16,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  backgroundColor: isError
                    ? "rgba(239, 68, 68, 0.2)"
                    : "rgba(187, 204, 19, 0.2)",
                  padding: 8,
                  borderRadius: 50,
                  marginRight: 12,
                }}
              >
                <Ionicons name={iconName} size={24} color={accentColor} />
              </View>

              <View style={{ flex: 1 }}>
                <Text className="text-white font-rbold text-base mb-1">
                  {isError ? "Error" : "Success"}
                </Text>
                <Text className="text-gray-300 font-rregular text-sm leading-5">
                  {text}
                </Text>
              </View>

              <TouchableOpacity
                onPress={onClose}
                style={{
                  padding: 4,
                  marginLeft: 8,
                }}
              >
                <Ionicons name="close" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            {/* Progress bar line capability (optional, purely visual here for design flair) */}
            <View
              style={{
                height: 3,
                width: "100%",
                backgroundColor: "rgba(255,255,255,0.1)",
              }}
            >
              <View
                style={{
                  height: "100%",
                  width: "100%",
                  backgroundColor: accentColor,
                }}
              />
            </View>
          </View>
        </Animated.View>
      </SafeAreaView>
    </Modal>
  );
};

export default ErrorOrMessageModal;
