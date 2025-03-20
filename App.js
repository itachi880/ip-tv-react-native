import React, { useEffect, useState, useMemo } from "react";
import { Dimensions, View } from "react-native";
import { openDatabase, getChannelsPaginated } from "./src/data/db";
import { channelsStore, currentChannelStore } from "./src/data/data";
import { CHANNELS_QUERY_LIMIT, fullScreenFlag } from "./src/data/flags";
import { getChannelQualitys } from "./src/utils";
import { createVideoPlayer } from "expo-video";
import ChannelsList from "./src/ChannelList";
import Player from "./src/Player";

export default function App() {
  console.log("app init");

  const setChannelsData = channelsStore.useStore({ getter: false });
  const setCurrentChannel = currentChannelStore.useStore({ getter: false });
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
    openDatabase().then(async () => {
      const channelsResponse = await getChannelsPaginated(
        CHANNELS_QUERY_LIMIT,
        0
      );

      channelsResponse.forEach((e, i) => {
        channelsResponse[i] = { ...e, quality: null, qualities: [] };
      });

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
          const qualities = await getChannelQualitys(item.link, item.referer);
          setCurrentChannel({ ...item, qualities });
        }}
      />
      <Player player={player} />
    </View>
  );
}
