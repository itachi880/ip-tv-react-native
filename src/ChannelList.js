import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableHighlight,
  FlatList,
  StyleSheet,
  Keyboard,
} from "react-native";

import Icon from "react-native-vector-icons/FontAwesome";
import { getChannelsPaginated, insertChannels, m3u8Parser } from "./data/db";
import * as DocumentPicker from "expo-document-picker";
import { channelsStore } from "./data/data";
import { CHANNELS_QUERY_LIMIT, dbOffset, loadingFlag } from "./data/flags";

const ChannelsList = ({ onChannelClick = () => {} }) => {
  const [displayedChannels, setChannelsStore] = channelsStore.useStore();
  const setLoadingState = loadingFlag.useStore({ getter: false });
  const handleFileUpload = async () => {
    try {
      setLoadingState({ flag: true });
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
      });
      if (result.canceled) {
        console.log("File upload was canceled");
        return;
      }
      const fileUri = result.assets[0].uri;

      const fileContent = await fetch(fileUri).then((res) => res.text());
      const parsedChannels = m3u8Parser(fileContent);

      await insertChannels(parsedChannels);

      setLoadingState({ flag: false });
      alert("File uploaded and channels inserted!");
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  console.log(Keyboard, displayedChannels);
  const [selectedIndex, setSelectedIndex] = useState(-1);

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
      <TouchableHighlight
        style={[styles.uploadButton]}
        onPress={handleFileUpload}
        onFocus={() => {
          console.log("foucuse");
          setSelectedIndex(1);
        }}
      >
        <Text
          style={[styles.uploadButtonText]}
          onFocus={() => {
            console.log("foucuse");
            setSelectedIndex(1);
          }}
        >
          + Upload Channels File
        </Text>
      </TouchableHighlight>

      <FlatList
        data={displayedChannels.channels}
        keyExtractor={(item) => Math.random() + ""}
        renderItem={({ item, index }) => (
          <Channel
            name={item.name}
            number={index + 1}
            state={item.state}
            link={item.link}
            refferer={item.referer}
            index={index + 2}
            selectedIndex={selectedIndex}
            onPress={(e) => {
              onChannelClick(item);
            }}
            onFocus={() => {
              setSelectedIndex(index + 2);
            }}
          />
        )}
        ListFooterComponent={
          <TouchableHighlight
            style={styles.loadMoreButton}
            onPress={async () => {
              setLoadingState({ flag: true });
              console.log("loading more start", dbOffset.offset);
              const result = await getChannelsPaginated(
                CHANNELS_QUERY_LIMIT,
                dbOffset.offset
              );
              console.log("loading more fetched", result.length);
              result.forEach((e, i) => {
                result[i] = { ...e, quality: null, qualities: [] };
              });
              console.log("loading more maped");

              if (result.length >= 20) {
                dbOffset.offset++;
              }
              console.log("loading mor set");
              setChannelsStore({
                channels: [
                  ...displayedChannels.channels,
                  ...result.filter((e) => {
                    if (
                      displayedChannels.channels.findIndex(
                        (channel) => channel.id == e.id
                      ) > 0
                    ) {
                      return false;
                    }
                    return true;
                  }),
                ],
              });
              setLoadingState({ flag: false });
            }}
          >
            <Text style={styles.loadMoreText}>Load More</Text>
          </TouchableHighlight>
        }
      />
    </View>
  );
};

const Channel = ({
  name,
  state,
  number,
  link,
  refferer,
  onPress,
  index,
  selectedIndex,
  onFocus,
}) => {
  const [isFocuse, setIsFocuse] = useState(false);
  const [isSelected, setIsSelected] = useState(index == selectedIndex);
  console.log(isFocuse);
  return (
    <TouchableHighlight
      onFocus={() => {
        console.log("foucuse");
        setIsFocuse(true);
      }}
      onBlur={() => {
        console.log("blure");
        setIsFocuse(false);
      }}
      onPress={(e) => {
        if (!onPress) return;
        onPress(e, { name, state, number, link, refferer });
      }}
      style={[styles.channel, !isFocuse ? styles.foucusedChannel : {}]}
    >
      <Text
        style={[styles.channelText]}
        onFocus={() => {
          setIsFocuse(true);
        }}
        onBlur={() => {
          console.log("foucuse");
          setIsFocuse(false);
        }}
      >
        {`${number} : ${name}`} {state === "OK" ? "✅" : "❓"}
      </Text>
    </TouchableHighlight>
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
  foucusedChannel: {
    transform: [{ scale: 0.95 }],
  },
});

export default ChannelsList;
