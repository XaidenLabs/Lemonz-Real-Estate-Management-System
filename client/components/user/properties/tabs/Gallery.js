import { useRef, useState, useCallback } from "react";
import { View, Text, Image } from "react-native";
import { Video } from "expo-av";
import { getToken } from "../../../../services/getToken";
import { apiFetch } from "../../../../services/api";

const Gallery = ({ photos, video, propertyId }) => {
  const videoRef = useRef(null);
  const [videoViewed, setVideoViewed] = useState(false); // ensure only one increment per screen open

  const recordVideoView = useCallback(async () => {
    if (videoViewed) return;
    if (!propertyId) return;
    try {
      const token = await getToken();
      await apiFetch(`/api/property/${propertyId}/video-view`, {
        method: "POST",
        token,
      });
      setVideoViewed(true);
    } catch (err) {
      // non-fatal: just log, don't spam user
      console.warn("Failed to record video view:", err?.message || err);
    }
  }, [propertyId, videoViewed]);

  const handlePlaybackStatus = (status) => {
    // record once when playback actually starts (isPlaying true and not buffering)
    if (status && status.isPlaying && !videoViewed) {
      recordVideoView().catch(() => {});
    }
  };

  return (
    <View className="p-4">
      <View className="mb-4">
        <Text className="font-rbold text-2xl text-white mb-4">Photos</Text>
        {photos && (
          <View className="flex-row flex-wrap justify-start">
            {photos.map((img, index) => (
              <Image
                key={index}
                source={{ uri: img }}
                className="h-[100px] w-[100px] mb-4 mr-2 rounded-lg"
                resizeMode="cover"
              />
            ))}
          </View>
        )}
      </View>

      <View className="mb-4">
        <Text className="font-rbold text-2xl text-white mb-4">Video</Text>
        {video ? (
          <View>
            <Video
              ref={videoRef}
              source={{ uri: video }}
              className="w-full h-[200px] rounded-lg"
              useNativeControls
              resizeMode="cover"
              onPlaybackStatusUpdate={handlePlaybackStatus}
            />
          </View>
        ) : (
          <Text className="text-white">No video available</Text>
        )}
      </View>
    </View>
  );
};

export default Gallery;
