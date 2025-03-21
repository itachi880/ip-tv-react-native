import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableHighlight,
  FlatList,
  StyleSheet,
} from "react-native";

import Icon from "react-native-vector-icons/FontAwesome";
import {
  getChannelsPaginated,
  insertChannels,
  m3u8Parser,
  searchChannelsByName,
} from "./data/db";
import * as DocumentPicker from "expo-document-picker";
import { channelsStore } from "./data/data";
import { CHANNELS_QUERY_LIMIT, dbOffset, loadingFlag } from "./data/flags";

const ChannelsList = ({ onChannelClick = () => {} }) => {
  const [displayedChannels, setChannelsStore] = channelsStore.useStore();
  const [localSearch, setLocalSearch] = useState([]);
  const setLoadingState = loadingFlag.useStore({ getter: false });

  const [selectedIndex, setSelectedIndex] = useState(-1);
  const focusedIndex = useRef(-1);

  useEffect(() => {
    console.log("Current Focused Index:", focusedIndex);
  }, [focusedIndex]);

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

  return (
    <View style={styles.container}>
      {/* Search bar */}
      <SearchInput
        onSubmit={async (text) => {
          if (text.trim().length == 0) return setLocalSearch([]);
          const foundChannels = displayedChannels.channels.filter((e) =>
            e.name.toLowerCase().includes(text.toLowerCase())
          );

          if (foundChannels.length <= 5) {
            const dbRes = await searchChannelsByName(text);
            setLocalSearch([
              ...foundChannels,
              ...dbRes.filter(
                (e) => !foundChannels.findIndex((c) => c.id == e.id) < 0
              ),
            ]);
            return;
          }
          setChannelsStore({
            channels: [...displayedChannels.channels, ...dbRes],
          });
        }}
      />

      {/* Upload button */}
      <UploadFile handleFileUpload={handleFileUpload} />
      <FlatList
        focusable={false}
        tvFocusable={false}
        data={
          localSearch.length === 0 ? displayedChannels.channels : localSearch
        }
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item, index }) => (
          <Channel
            name={item.name}
            number={index + 1}
            state={item.state}
            link={item.link}
            referer={item.referer}
            onPress={() => {
              onChannelClick(item);
              setSelectedIndex(index + 2);
            }}
          />
        )}
        contentContainerStyle={{ paddingBottom: 100 }} // Ensures last item is always in view
        ListFooterComponent={<LoadMore />}
      />
    </View>
  );
};

const Channel = ({ name, state, number, link, referer, onPress }) => {
  const [isFocuse, setIsFocuse] = useState(false);
  return (
    <TouchableHighlight
      onFocus={() => setIsFocuse(true)}
      onBlur={() => setIsFocuse(false)}
      onPress={() => onPress({ name, state, number, link, referer })}
      style={[styles.channel, isFocuse && styles.focusedChannel]}
      focusable={true}
    >
      <Text style={styles.channelText}>
        {`${number} : ${name}`}{" "}
        {state === "OK" ? "✅" : state === "NO" ? "❌" : "❓"}
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
    paddingVertical: 4,
    outlineStyle: "none",
    marginLeft: 8,
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
  focusedButton: {
    backgroundColor: "black",
    borderColor: "white",
    borderWidth: 1,
  },
  loadMoreButton: {
    marginTop: 8,
    alignItems: "center",
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
    transform: [{ scale: 0.95 }],
  },
  channelText: {
    color: "white",
  },
  focusedChannel: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    transform: [{ scale: 1 }],
  },
});

function SearchInput({ onSubmit = (text = "") => {} }) {
  const [input, setInput] = useState("");

  return (
    <View style={styles.searchBar}>
      <Icon name="search" />
      <TextInput
        value={input}
        onChange={(e) => setInput(e.nativeEvent.text)}
        onSubmitEditing={(e) => onSubmit(input)}
        placeholder="Search channel"
        cursorColor={"#000"}
        style={styles.input}
      />
    </View>
  );
}
function LoadMore() {
  const [displayedChannels, setChannelsStore] = channelsStore.useStore();
  const setLoadingState = loadingFlag.useStore({ getter: false });
  const [Focused, setFocused] = useState(false);
  return (
    <TouchableHighlight
      style={[
        styles.loadMoreButton,
        Focused ? { backgroundColor: "white" } : { backgroundColor: "#2563EB" },
      ]}
      onPress={async () => {
        setLoadingState({ flag: true });
        console.log("Loading more channels...");

        const result = await getChannelsPaginated(
          CHANNELS_QUERY_LIMIT,
          dbOffset.offset
        );

        result.forEach((e, i) => {
          result[i] = { ...e, quality: null, qualities: [] };
        });

        if (result.length >= 20) {
          dbOffset.offset++;
        }

        setChannelsStore({
          channels: [
            ...displayedChannels.channels,
            ...result.filter(
              (e) =>
                displayedChannels.channels.findIndex(
                  (channel) => channel.id === e.id
                ) < 0
            ),
          ],
        });

        setLoadingState({ flag: false });
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    >
      <Text style={[styles.loadMoreText]}>Load More</Text>
    </TouchableHighlight>
  );
}

const UploadFile = ({ handleFileUpload }) => {
  const [isFocuse, setIsFocuse] = useState(false);
  return (
    <TouchableHighlight
      focusable={false}
      tvFocusable={false}
      style={[styles.uploadButton, isFocuse && styles.focusedButton]}
      onPress={handleFileUpload}
      onFocus={() => setIsFocuse(true)}
      onBlur={() => setIsFocuse(false)}
    >
      <Text style={[styles.uploadButtonText, isFocuse && { color: "white" }]}>
        + Upload Channels File
      </Text>
    </TouchableHighlight>
  );
};

export default ChannelsList;
