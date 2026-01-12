import { Ionicons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import { WebView } from "react-native-webview";
import { View, Text, TouchableOpacity } from "react-native";

const About = ({ description, document, coordinates }) => {
  return (
    <View className="p-4">
      <View className="mb-4">
        <Text className="font-rbold text-2xl text-white">Overview</Text>
        <Text className="text-white font-rregular mt-2">{description}</Text>
      </View>

      {document && (
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

      {coordinates && (
        <View className="mb-6">
          <Text className="font-rbold text-2xl text-white mb-3">Location</Text>
          <View className="rounded-lg overflow-hidden" style={{ height: 200 }}>
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
          </View>
        </View>
      )}
    </View>
  );
};

export default About;
