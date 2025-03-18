import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  GestureResponderEvent,
} from "react-native";
// @ts-ignore
import Icon from "react-native-vector-icons/FontAwesome";
import { insertChannels, m3u8Parser } from "./data/db";
import * as DocumentPicker from "expo-document-picker";
const ChannelsList = ({
  displayedChannels = [],
  onChannelClick = () => {},
}) => {
  const handleFileUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/*", // Accept any type of document
      });

      if (result.type === "success") {
        const fileUri = result.uri;
        console.log("File uploaded:", fileUri);

        // Read the content of the file (this depends on the type of file you're handling)
        const fileContent = await fetch(fileUri).then((res) => res.text());
        const parsedChannels = m3u8Parser(fileContent);
        console.log(parsedChannels);
        // Insert the parsed channels into the database
        await insertChannels(parsedChannels);

        alert("File uploaded and channels inserted!");
      } else {
        console.log("File upload was canceled");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  return (
    <View className="h-full w-[40%]  overflow-y-auto overflow-x-hidden border border-white bg-black p-2">
      {/* Search bar */}
      <View className="channel speciale-input sticky top-0 mb-2 flex flex-row items-center gap-2 bg-white  px-4 ">
        <Icon name="search" />
        <TextInput
          placeholder="Search channel"
          cursorColor={"#000"}
          className="h-full w-[97%] border-none py-1 outline-none"
        />
      </View>

      {/* Upload button */}
      <TouchableOpacity className="mb-2 bg-white p-2 px-4">
        <Text className="text-black">+ Upload Channels File</Text>
      </TouchableOpacity>
      <FlatList
        data={displayedChannels}
        keyExtractor={(item) => Math.random() + ""}
        renderItem={({ item, index }) => (
          <Channel
            name={item.name}
            number={index + 1}
            state={item.state}
            link={item.link}
            refferer={item.referer}
            onPress={(e, item) => onChannelClick(item)}
          />
        )}
        ListFooterComponent={
          <TouchableOpacity
            className="mt-2 items-center bg-blue-600 p-2"
            onPress={handleFileUpload}
          >
            <Text className="text-white">Load More</Text>
          </TouchableOpacity>
        }
      />
    </View>
  );
};

const Channel = ({ name, state, number, link, refferer, onPress }) => {
  return (
    <TouchableOpacity
      onPress={(e) => {
        if (!onPress) return;
        onPress(e, {
          name,
          state,
          number,
          link,
          refferer,
        });
      }}
      className="channel mb-1 cursor-pointer rounded border border-white p-2"
      onFocus={() => console.log("focuse")}
    >
      <Text className=" text-white">
        {`${number} : ${name}`}
        {state === "OK" ? "✅" : "❓"}
      </Text>
    </TouchableOpacity>
  );
};

export default ChannelsList;
