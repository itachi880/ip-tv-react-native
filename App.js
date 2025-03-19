import ChannelsList from "./src/ChannelList";
import Player from "./src/Player";
import { Dimensions, View } from "react-native";
import { useEffect, useState } from "react";
import { openDatabase, getAllChannels } from "./src/data/db";
import { getChannelQualitys } from "./src/utils";
import { currentChannelStore } from "./src/data/data";
export default function App() {
  const [channels, setChannelsData] = useState([
    {
      name: "2M Monde (360p)",
      referer: "http://www.radio2m.ma/",
      link: "https://cdn-globecast.akamaized.net/live/eds/2m_monde/hls_video_ts_tuhawxpiemz257adfc/2m_monde.m3u8",

      qualities: [],
      quality: null,
    },
    {
      name: "Al Aoula International (360p)",
      referer: "https://snrtlive.ma/",
      link: "https://cdn-globecast.akamaized.net/live/eds/al_aoula_inter/hls_snrt/al_aoula_inter.m3u8",

      qualities: [],
      quality: null,
    },
    {
      name: "Al Aoula Laâyoune (360p)",
      referer: "https://snrtlive.ma/",
      link: "https://cdn-globecast.akamaized.net/live/eds/al_aoula_laayoune/hls_snrt/index.m3u8",

      qualities: [],
      quality: null,
    },
    {
      name: "Al Maghribia (360p)",
      referer: "https://snrtlive.ma/",
      link: "https://cdn-globecast.akamaized.net/live/eds/al_maghribia_snrt/hls_snrt/index.m3u8",

      qualities: [],
      quality: null,
    },
    {
      name: "Arryadia (360p) [Not 24/7]",
      referer: "https://snrtlive.ma/",
      link: "https://cdn-globecast.akamaized.net/live/eds/arriadia/hls_snrt/index.m3u8",

      qualities: [],
      quality: null,
    },
    {
      name: "Assadissa (360p)",
      referer: "https://snrtlive.ma/",
      link: "https://cdn-globecast.akamaized.net/live/eds/assadissa/hls_snrt/index.m3u8",

      qualities: [],
      quality: null,
    },
    {
      name: "Athaqafia (360p)",
      referer: "https://snrtlive.ma/",
      link: "https://cdn-globecast.akamaized.net/live/eds/arrabiaa/hls_snrt/index.m3u8",

      qualities: [],
      quality: null,
    },
    {
      name: "Chada TV (720p)",
      referer: null,
      link: "https://chadatv.vedge.infomaniak.com/livecast/chadatv/playlist.m3u8",

      qualities: [],
      quality: null,
    },
    {
      name: "Medi 1 TV Afrique (1080p) [Not 24/7]",
      referer: null,
      link: "https://streaming1.medi1tv.com/live/smil:medi1fr.smil/playlist.m3u8",

      qualities: [],
      quality: null,
    },
    {
      name: "Medi 1 TV Afrique (1080p) [Not 24/7]",
      referer: null,
      link: "https://streaming2.medi1tv.com/live/smil:medi1fr.smil/playlist.m3u8",

      qualities: [],
      quality: null,
    },
    {
      name: "Medi 1 TV Arabic (1080p) [Not 24/7]",
      referer: null,
      link: "https://streaming1.medi1tv.com/live/smil:medi1ar.smil/playlist.m3u8",

      qualities: [],
      quality: null,
    },
    {
      name: "Medi 1 TV Arabic (1080p) [Not 24/7]",
      referer: null,
      link: "https://streaming2.medi1tv.com/live/smil:medi1ar.smil/playlist.m3u8",

      qualities: [],
      quality: null,
    },
    {
      name: "Medi 1 TV Maghreb (1080p) [Not 24/7]",
      referer: null,
      link: "https://streaming1.medi1tv.com/live/smil:medi1tv.smil/playlist.m3u8",

      qualities: [],
      quality: null,
    },
    {
      name: "Medi 1 TV Maghreb (1080p) [Not 24/7]",
      referer: null,
      link: "https://streaming2.medi1tv.com/live/smil:medi1tv.smil/playlist.m3u8",

      qualities: [],
      quality: null,
    },
    {
      name: "Tamazight (360p)",
      referer: "https://snrtlive.ma/",
      link: "https://cdn-globecast.akamaized.net/live/eds/tamazight_tv8_snrt/hls_snrt/index.m3u8",

      qualities: [],
      quality: null,
    },
  ]);
  const [currentChannel, setCurrentChannel] = currentChannelStore.useStore();
  useEffect(() => {
    // openDatabase().then(async () => {
    //   console.log(setChannelsData);
    //   const channels = await getAllChannels();
    //   setChannelsData(channels);
    //   console.log("res api", [...channels]);
    // });
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
        onChannelClick={(item) => {
          console.log("change to :", item);
          setCurrentChannel({ ...item });
        }}
      />
      <Player />
    </View>
  );
}
