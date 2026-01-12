import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { WebView } from "react-native-webview";
import {
  Alert,
  View,
  Text,
  TouchableOpacity,
  Linking,
  Image,
} from "react-native";

const About = ({
  description,
  proprietorName,
  proprietorContact,
  companyName,
  proprietorProfilePic,
  document,
  isDocumentPublic,
  proprietorId,
  coordinates,
  propertyId,
  propertyTitle,
  ownerContact,
  proprietorIsVerified = false,
  proprietorCompletedCount = 0,
}) => {
  const openChat = () => {
    try {
      if (!proprietorId) {
        Alert.alert(
          "Can't open chat",
          "Property has no agent set. Please try again later.",
        );
        return;
      }

      // Preferred: object form (pathname + params) which works reliably with expo-router
      const pathname = `/user/(screens)/chat/${proprietorId}`; // adjust if your route differs
      const navParams = {
        id: proprietorId,
        name: proprietorName,
        profilePicture: proprietorProfilePic,
        propertyId,
        propertyTitle,
        ownerContact,
      };

      // Try object navigation first (safer). If this route doesn't exist in your project, fallback to string.
      try {
        router.push({ pathname, params: navParams });
        return;
      } catch (e) {
        console.warn(
          "Object router.push failed, trying string route fallback:",
          e?.message || e,
        );
      }

      // Fallback: string route with encoded query params
      const qp = [
        `name=${encodeURIComponent(property.agentName || "")}`,
        `profilePicture=${encodeURIComponent(property.agentProfilePicture || "")}`,
        `propertyId=${encodeURIComponent(property._id)}`,
        `propertyTitle=${encodeURIComponent(property.title || "")}`,
        `ownerContact=${encodeURIComponent(property.agentContact || "")}`,
      ].join("&");

      router.push(`/user/(screens)/chat/${property.agentId}?${qp}`);
    } catch (err) {
      console.error("openChat error:", err);
      Alert.alert("Navigation error", err.message || String(err));
    }
  };

  return (
    <View className="p-4">
      <View className="mb-4">
        <Text className="font-rbold text-2xl text-white">Overview</Text>
        <Text className="text-white font-rregular mt-2">{description}</Text>
      </View>

      {document && isDocumentPublic && (
        <TouchableOpacity
          className="mb-6 p-4 bg-chartreuse rounded-lg flex-row items-center justify-between"
          onPress={() => WebBrowser.openBrowserAsync(document)}
        >
          <View className="flex-row items-center">
            <Ionicons name="document-text-outline" size={24} color="#352C1F" />
            <Text className="text-darkUmber-dark text-lg font-rbold ml-3">
              View Property Document
            </Text>
          </View>
          <Ionicons name="arrow-forward-outline" size={24} color="#352C1F" />
        </TouchableOpacity>
      )}

      <View className="mb-6">
        <Text className="font-rbold text-2xl text-white">Proprietor Info</Text>
        <View className="flex-row items-center justify-between mt-2">
          <View className="flex-row items-center justify-start gap-4">
            <View>
              {proprietorProfilePic ? (
                <Image
                  source={{ uri: proprietorProfilePic }}
                  style={{ width: 45, height: 45, borderRadius: 36 }}
                  resizeMode="cover"
                />
              ) : (
                <Ionicons name="person-outline" size={30} color={"#BBCC13"} />
              )}
            </View>
            <View>
              <View className="flex-row items-center">
                <Text className="text-white font-rbold text-lg">{proprietorName}</Text>
                {proprietorIsVerified && Number(proprietorCompletedCount) >= 20 ? (
                  <View className="ml-2 flex-row items-center bg-transparent px-2 py-1 rounded-md">
                    <Ionicons name="ribbon-outline" size={16} color={"#BBCC13"} />
                    <Text className="text-chartreuse font-rregular ml-1 text-sm">Top Seller</Text>
                  </View>
                ) : null}
              </View>
              <Text className="text-white font-rregular text-md">
                {companyName}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center justify-end gap-4">
            <TouchableOpacity
              className="rounded-full p-3 items-center justify-center bg-frenchGray-dark"
              onPress={openChat}
            >
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={20}
                color={"#BBCC13"}
              />
            </TouchableOpacity>

            <TouchableOpacity
              className="rounded-full p-3 items-center justify-center bg-frenchGray-dark"
              onPress={() => {
                const phoneNumber = `tel:${proprietorContact}`;
                Linking.openURL(phoneNumber).catch((err) => err);
              }}
            >
              <Ionicons name="call-outline" size={20} color={"#BBCC13"} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {coordinates && (
        <View className="mb-4">
          <Text className="font-rbold text-2xl text-white mb-3">Location</Text>
          <View
            className="rounded-lg overflow-hidden relative"
            style={{ height: 200 }}
          >
            <WebView
              style={{ flex: 1 }}
              originWhitelist={["*"]}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              source={{
                html: `
                  <!DOCTYPE html>
                  <html lang="en">
                    <head>
                      <meta name="viewport" content="width=device-width, initial-scale=1.0">
                      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
                      <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
                      <style>
                          html, body {
                              margin: 0;
                              padding: 0;
                              width: 100%;
                              height: 100%;
                          }
                          #map {
                              position: absolute;
                              top: 0;
                              bottom: 0;
                              width: 100%;
                              height: 100%;
                          }
                          .custom-marker {
                              background-color: #DFFF00;
                              padding: 8px;
                              border-radius: 50%;
                              display: flex;
                              align-items: center;
                              justify-content: center;
                          }
                      </style>
                    </head>
                    <body>
                      <div id="map"></div>
                      <script>
                          setTimeout(() => {
                              const map = L.map('map').setView([${coordinates.latitude}, ${coordinates.longitude}], 15);
                              L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                                  maxZoom: 19,
                                  attribution: '© OpenStreetMap contributors'
                              }).addTo(map);

                              const customIcon = L.divIcon({
                                  className: 'custom-marker',
                                  html: '<svg xmlns="http://www.w3.org/2000/svg" fill="#352C1F" width="24" height="24" viewBox="0 0 24 24"><path d="M12 2C8.134 2 5 5.134 5 9c0 5.25 7 12 7 12s7-6.75 7-12c0-3.866-3.134-7-7-7zm0 10.5c-1.933 0-3.5-1.567-3.5-3.5S10.067 5.5 12 5.5s3.5 1.567 3.5 3.5-1.567 3.5-3.5 3.5z"/></svg>',
                                  iconSize: [30, 30],
                                  iconAnchor: [15, 30],
                              });

                              L.marker([${coordinates.latitude}, ${coordinates.longitude}], { icon: customIcon })
                                  .addTo(map)
                                  .bindPopup('Property Location')
                                  .openPopup();
                              map.invalidateSize();
                          }, 100);
                      </script>
                  </body>
                </html>
              `,
              }}
            />
            <TouchableOpacity
              className="absolute bottom-3 right-3 bg-chartreuse p-2 rounded-lg flex-row items-center"
              onPress={() => {
                const url = `https://www.google.com/maps/search/?api=1&query=${coordinates.latitude},${coordinates.longitude}`;
                Linking.openURL(url);
              }}
            >
              <Ionicons name="navigate" size={20} color="#352C1F" />
              <Text className="text-darkUmber-dark font-rbold ml-2">
                Directions
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

export default About;
