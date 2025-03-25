import React, { useEffect, useMemo, useState } from "react";
import { Dimensions, View, BackHandler, useTVEventHandler } from "react-native";
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
  TV_KEYBORD_EVENT,
} from "./src/data/flags";
import { getChannelQualitys } from "./src/utils";
import { createVideoPlayer } from "expo-video";
import ChannelsList from "./src/ChannelList";
import Player from "./src/Player";
import LoadingBar from "./src/LoadingBar";
import PopUp from "./src/PopUp";
import IPtvDBInterface from "./src/DB_UI_INTEFACE";

function IP_TV_INTERFACE() {
  const setChannelsData = channelsStore.useStore({ getter: false });
  const setCurrentChannel = currentChannelStore.useStore({ getter: false });
  const setLoadingState = loadingFlag.useStore({ getter: false });
  const [IsFullScreen, setFullScreen] = fullScreenFlag.useStore();
  const exitFullScreen = () => {
    if (IsFullScreen.flag) {
      setFullScreen({ flag: false });
      return true;
    }
    BackHandler.exitApp();
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

    return () => {
      player.removeAllListeners("statusChange");
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
          setCurrentChannel({ ...item, qualities, quality: null });
        }}
      />
      <Player player={player} />
      <PopUp />
      <LoadingBar />
    </View>
  );
}

export default function App() {
  useTVEventHandler((event) => {
    console.log(event);
    if (TV_KEYBORD_EVENT.isTextFieldMode) return;
    if (isNaN(+event.eventType)) {
      TV_KEYBORD_EVENT.sequence = [];
      return;
    }
    TV_KEYBORD_EVENT.sequence.push(event.eventType);
    console.log(TV_KEYBORD_EVENT.sequence);
    if (TV_KEYBORD_EVENT.sequence.join("") == "20252025") {
      TV_KEYBORD_EVENT.sequence = [];
      setDb_interface(true);
    }
  });
  const [isDB_INTERFACE, setDb_interface] = useState(false);
  return !isDB_INTERFACE ? (
    <IP_TV_INTERFACE />
  ) : (
    <IPtvDBInterface setDb_interface={setDb_interface} />
  );
}
