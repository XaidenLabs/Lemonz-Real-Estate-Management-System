import { Video } from "expo-av";
import { View, Text, ScrollView, Image } from "react-native";

const Gallery = ({ photos, video }) => {
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
        {video && (
          <View>
            <Video
              source={{ uri: video }}
              className="w-full h-[200px] rounded-lg"
              useNativeControls
              resizeMode="cover"
            />
          </View>
        )}
      </View>
    </View>
  );
};

export default Gallery;
