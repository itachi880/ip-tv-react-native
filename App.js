import ChannelsList from "./src/ChannelList";
import Player from "./src/Player";
import { Dimensions, View } from "react-native";
import { useEffect, useState } from "react";
import { openDatabase, getAllChannels } from "./src/data/db";
export default function App() {
  const [channels, setChannelsData] = useState([]);
  const [selected, setSelected] = useState({ link: "", refferer: "" });
  useEffect(() => {
    openDatabase().then(async () => {
      console.log(setChannelsData);
      const channels = await getAllChannels();
      setChannelsData(channels);
      console.log("res api", [...channels]);
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
        justifyContent: "flex-start",
        alignItems: "flex-start",
      }}
    >
      <ChannelsList
        displayedChannels={channels}
        onChannelClick={({ link, refferer }) => {
          setSelected({ link, refferer });
        }}
      />
      <Player link={selected.link} refferer={selected.refferer} />
    </View>
  );
}

// {
//   /* <ChannelsList /> */
// }
