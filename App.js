import React, { useEffect, useMemo, useRef } from "react";
import { Dimensions, View, BackHandler } from "react-native";
import {
  openDatabase,
  getChannelsPaginated,
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
  const setChannelsData = channelsStore.useStore({ getter: false });
  const setCurrentChannel = currentChannelStore.useStore({ getter: false });
  const setLoadingState = loadingFlag.useStore({ getter: false });
  const [IsFullScreen, setFullScreen] = fullScreenFlag.useStore();
  const exitFullScreen = () => {
    if (IsFullScreen.flag) {
      setFullScreen({ flag: false });
      return true;
    }
  };

  // Exit full screen on back button press
  BackHandler.addEventListener("hardwareBackPress", exitFullScreen);

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

    player.addListener("statusChange", (data) => {
      if (data.status == "loading") {
        setLoadingState({ flag: true });
        return;
      }

      setLoadingState({ flag: false });
    });

    // Cleanup on unmount
    return () => {
      player.removeAllListeners("statusChange");
      player.release();
      BackHandler.removeEventListener("hardwareBackPress", exitFullScreen);
    };
  }, [player]);

  const { width, height } = Dimensions.get("window");

  // Create refs for focus handling
  const channelsListRef = useRef(null);
  const playerRef = useRef(null);

  // TVEventHandler to handle remote key events

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
        ref={channelsListRef}
        onChannelClick={async (item) => {
          console.log("change to :", item);
          setFullScreen({ flag: true });
          setLoadingState({ flag: true });
          const qualities = await getChannelQualitys(item.link, item.referer);
          setCurrentChannel({ ...item, qualities });
        }}
        focusable={true} // Make it focusable
        hasTVPreferredFocus={true} // Give it initial focus if needed
      />
      <Player
        ref={playerRef}
        player={player}
        focusable={true} // Make it focusable
      />
      <LoadingBar />
    </View>
  );
}
