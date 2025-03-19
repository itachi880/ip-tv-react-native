import ChannelsList from "./src/ChannelList";
import Player from "./src/Player";
import { Dimensions, View } from "react-native";
import { useEffect, useState } from "react";
import {
  openDatabase,
  getAllChannels,
  getChannelsPaginated,
} from "./src/data/db";
import { currentChannelStore } from "./src/data/data";
import { CHANNELS_QUERY_LIMIT, fullScreenFlag } from "./src/data/flags";
import { getChannelQualitys } from "./src/utils";

export default function App() {
  const [channels, setChannelsData] = useState([]);
  const [currentChannel, setCurrentChannel] = currentChannelStore.useStore();
  const setFullScreen = fullScreenFlag.useStore({ getter: false });
  useEffect(() => {
    openDatabase().then(async () => {
      const channelsResponse = await getChannelsPaginated(
        CHANNELS_QUERY_LIMIT,
        0
      );

      channelsResponse.forEach((e, i) => {
        channelsResponse[i] = { ...e, quality: null, qualities: [] };
      });

      setChannelsData([...channelsResponse]);
    });
  }, []);
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
        displayedChannels={channels}
        onChannelClick={async (item) => {
          console.log("change to :", item);
          const qualities = await getChannelQualitys(item.link, item.referer);
          setCurrentChannel({ ...item, qualities });
          setFullScreen({ flag: true });
        }}
      />
      <Player />
    </View>
  );
}
