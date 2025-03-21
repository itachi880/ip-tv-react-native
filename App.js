import React, { useEffect, useState, useMemo } from "react";
import { Dimensions, View } from "react-native";
import {
  openDatabase,
  getChannelsPaginated,
  getAllChannels,
  countChannels,
} from "./src/data/db";
import { channelsStore, currentChannelStore } from "./src/data/data";
import {
  CHANNELS_QUERY_LIMIT,
  dbOffset,
  fullScreenFlag,
  loadingFlag,
} from "./src/data/flags";
import { getChannelQualitys } from "./src/utils";
import { createVideoPlayer } from "expo-video";
import ChannelsList from "./src/ChannelList";
import Player from "./src/Player";
import LoadingBar from "./src/LoadingBar";

export default function App() {
  console.log("app init");

  const setChannelsData = channelsStore.useStore({ getter: false });
  const setCurrentChannel = currentChannelStore.useStore({ getter: false });
  const setLoadingState = loadingFlag.useStore({ getter: false });
  const setFullScreen = fullScreenFlag.useStore({ getter: false });
  // Memoize the player to prevent re-creating it unnecessarily
  const player = useMemo(
    () =>
      createVideoPlayer({
        uri: "",
        headers: {
          Referer: "",
        },
      }),
    []
  );

  useEffect(() => {
    setLoadingState({ flag: true });
    openDatabase().then(async () => {
      console.log("db opened", await countChannels());
      const channelsResponse = await getChannelsPaginated(
        CHANNELS_QUERY_LIMIT,
        0
      );
      dbOffset.offset++;
      channelsResponse.forEach((e, i) => {
        channelsResponse[i] = { ...e, quality: null, qualities: [] };
      });

      setLoadingState({ flag: false });
      setChannelsData({ channels: channelsResponse });
    });

    // Cleanup on unmount
    return () => {
      player.release();
    };
  }, [player]);

  const { width, height } = Dimensions.get("window");

  return (
    <View
      style={{
        backgroundColor: "rgb(0,0,0)",
        display: "flex",
        flexDirection: "row",
        width: width,
        height: height,
        gap: 0,
        justifyContent: "space-between",
        alignItems: "flex-start",
      }}
    >
      <ChannelsList
        onChannelClick={async (item) => {
          console.log("change to :", item);
          setFullScreen({ flag: true });
          setLoadingState({ flag: true });
          const qualities = await getChannelQualitys(item.link, item.referer);
          setCurrentChannel({ ...item, qualities });
        }}
      />
      <Player player={player} />
      <LoadingBar />
    </View>
  );
}
