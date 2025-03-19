import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
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
        type: "application/*",
      });

      if (result.type === "success") {
        const fileUri = result.uri;
        console.log("File uploaded:", fileUri);

        const fileContent = await fetch(fileUri).then((res) => res.text());
        const parsedChannels = m3u8Parser(fileContent);
        console.log(parsedChannels);

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
    <View style={styles.container}>
      {/* Search bar */}
      <View style={styles.searchBar}>
        <Icon name="search" />
        <TextInput
          placeholder="Search channel"
          cursorColor={"#000"}
          style={styles.input}
        />
      </View>

      {/* Upload button */}
      <TouchableOpacity style={styles.uploadButton}>
        <Text style={styles.uploadButtonText}>+ Upload Channels File</Text>
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
            onPress={(e) => onChannelClick(item)}
          />
        )}
        ListFooterComponent={
          <TouchableOpacity
            style={styles.loadMoreButton}
            onPress={handleFileUpload}
          >
            <Text style={styles.loadMoreText}>Load More</Text>
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
        onPress(e, { name, state, number, link, refferer });
      }}
      style={styles.channel}
      onFocus={() => console.log("focuse")}
    >
      <Text style={styles.channelText}>
        {`${number} : ${name}`} {state === "OK" ? "✅" : "❓"}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    height: "100%",
    width: "40%",
    borderColor: "white",
    borderWidth: 1,
    backgroundColor: "black",
    padding: 8,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  input: {
    flex: 1,
    height: "100%",
    borderWidth: 0,
    paddingVertical: 4,
    outlineStyle: "none",
  },
  uploadButton: {
    marginBottom: 8,
    backgroundColor: "white",
    padding: 8,
    paddingHorizontal: 16,
  },
  uploadButtonText: {
    color: "black",
  },
  loadMoreButton: {
    marginTop: 8,
    alignItems: "center",
    backgroundColor: "#2563EB",
    padding: 8,
  },
  loadMoreText: {
    color: "white",
  },
  channel: {
    marginBottom: 4,
    borderRadius: 4,
    borderColor: "white",
    borderWidth: 1,
    padding: 8,
  },
  channelText: {
    color: "white",
  },
});

export default ChannelsList;
