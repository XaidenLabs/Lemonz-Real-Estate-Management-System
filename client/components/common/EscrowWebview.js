import React, { useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, SafeAreaView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { WebView } from "react-native-webview";

const EscrowWebview = ({ url, title = "Complete Payment", onClose, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(true);

  const handleNavChange = (navState) => {
    const u = navState.url || "";
    // common success / cancel markers
    if (u.includes("/escrow/success") || u.includes("escrow/success") || u.includes("/payment/success") || u.includes("payment/success")) {
      onSuccess && onSuccess(u);
    } else if (u.includes("/escrow/cancel") || u.includes("escrow/cancel") || u.includes("/payment/cancel") || u.includes("payment/cancel")) {
      onCancel && onCancel(u);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={{ height: 56, flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 12 }}>
        <TouchableOpacity onPress={() => onClose && onClose()}>
          <Ionicons name="close" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={{ fontWeight: "700" }}>{title}</Text>
        <View style={{ width: 28 }} />
      </View>

      {url ? (
        <WebView
          source={{ uri: url }}
          onNavigationStateChange={handleNavChange}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          startInLoadingState
          style={{ flex: 1 }}
        />
      ) : (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text>No checkout URL provided</Text>
        </View>
      )}

      {loading && (
        <View style={{ position: "absolute", top: 56, left: 0, right: 0, bottom: 0, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" />
        </View>
      )}
    </SafeAreaView>
  );
};

export default EscrowWebview;
