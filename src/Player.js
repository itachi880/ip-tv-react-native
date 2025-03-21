import React, { useState, useEffect, useRef } from "react";
import { useVideoPlayer, VideoPlayer, VideoView } from "expo-video";
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import Slider from "@react-native-community/slider";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  faBackwardFast,
  faCircle,
  faForwardFast,
  faGear,
  faPause,
  faPlay,
  faUpRightAndDownLeftFromCenter,
} from "@fortawesome/free-solid-svg-icons";
import { fullScreenFlag, loadingFlag } from "./data/flags";
import { currentChannelStore } from "./data/data";

const videoWidth = Dimensions.get("window").width * 0.5;

/**
 *
 * @param {object} param0
 * @param {VideoPlayer} param0.player
 * @returns
 */
export default function Player({ player }) {
  const [isFullScreen, setFullScreen] = fullScreenFlag.useStore();
  const setLoadingState = loadingFlag.useStore({ getter: false });
  console.log("player init");
  let timer;

  const [currentChannel, setCurrentChannel] = currentChannelStore.useStore();

  useEffect(() => {
    if (!player) return;
    player.play();
    player.addListener("statusChange", (data) => {
      if (data.status == "loading") {
        setLoadingState({ flag: true });
        return;
      }
      setLoadingState({ flag: false });
    });

    return () => {
      if (timer) clearInterval(timer);
      player.removeAllListeners("statusChange");
    };
  }, [player]); // Ensure player is available when releasing
  useEffect(() => {
    if (!player) return;
    player.replace({
      uri: currentChannel.link ?? "",
      headers: {
        Referer: currentChannel.referer || "",
      },
    });
  }, [currentChannel, player]);
  return (
    <View
      style={
        isFullScreen.flag ? styles.fullScreenContainer : styles.contentContainer
      }
    >
      <VideoView
        style={styles.video}
        player={player}
        allowsFullscreen
        allowsPictureInPicture
        nativeControls={false}
      />
      <Controls
        player={player}
        setFullScreen={setFullScreen}
        isFullScreen={isFullScreen}
      />
    </View>
  );
}

function Settings({ qualities = [], selectedQuality = null, onQualityChange }) {
  const [qualitySelected, setSelectedQuality] = useState(
    !selectedQuality ? "auto" : selectedQuality
  );
  const [showQualitys, setShowQualitys] = useState(true);
  return (
    <View style={styles.settingsMenu} pointerEvents="none">
      <Text
        style={{
          color: "#fff",
          borderBottomColor: "#fff",
          borderBottomWidth: 1,
          paddingBottom: 5,
          marginBottom: 5,
        }}
      >
        Settings
      </Text>
      <View style={styles.settingItem}>
        <Text style={{ color: "#fff" }}>Quality:</Text>
        <View
          style={{
            position: "relative",
            backgroundColor: "black",
            borderTopRightRadius: 5,
            borderTopLeftRadius: 5,
          }}
        >
          <View style={{ width: 150, position: "relative" }}>
            <Text
              style={{
                color: "white",
                padding: 5,
                borderBottomWidth: 1,
                borderBottomColor: showQualitys ? "white" : "black",
                paddingInline: 10,
                textAlign: "center",
              }}
              onPress={() => setShowQualitys((prev) => !prev)}
            >
              <Text style={{ width: "90%" }}>
                {qualitySelected !== "auto"
                  ? qualitySelected[0].split("x")[1] + "p"
                  : "auto"}
              </Text>
            </Text>
            <View style={styles.settingItemSelect}>
              <TouchableOpacity>
                <Text
                  style={{ color: "white" }}
                  onPress={() => console.log("cliked")}
                >
                  hello
                </Text>
              </TouchableOpacity>
              <TouchableOpacity>
                <Text
                  style={{ color: "white" }}
                  onPress={() => console.log("cliked")}
                >
                  hello
                </Text>
              </TouchableOpacity>
              <TouchableOpacity>
                <Text
                  style={{ color: "white" }}
                  onPress={() => console.log("cliked")}
                >
                  hello
                </Text>
              </TouchableOpacity>
              <TouchableOpacity>
                <Text onPress={() => console.log("cliked")}>hello</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
/**
 *
 * @param {object} param0
 * @param {ReturnType<useVideoPlayer>} param0.player
 * @returns
 */
function Controls({ player, setFullScreen, isFullScreen }) {
  const [isPlayed, setIsPlayed] = useState(player.playing ?? false);
  const [isLive, setIsLive] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (isLive) return;
    if (player.currentTime + 10 >= player.duration) return setIsLive(true);
    player.currentTime = player.duration - 10;
    setIsLive(true);
  }, [isLive]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (!player) return;
      console.log(player.currentTime, player.duration);
      setIsPlayed(player.playing);
    }, 500);
    return () => clearInterval(timer);
  });

  return (
    <View style={styles.controlsContainer}>
      <Slider
        style={styles.slider}
        thumbTintColor="#f00"
        maximumTrackTintColor="#f00"
        minimumTrackTintColor="#f00"
        minimumValue={0}
        maximumValue={0.999}
        value={+(player.currentTime / player.duration)}
        onValueChange={(value) => {
          if (!player) return;
          player.currentTime = value * player.duration;
        }}
      />
      <View style={styles.btns}>
        <View style={styles.left}>
          <TouchableOpacity
            onPress={() => {
              setIsLive(true);
              if (!player) return;
              player.currentTime = player.duration - 10;
            }}
          >
            <Text style={{ textAlign: "center", color: "#fff" }}>
              LIVE
              <FontAwesomeIcon
                size={10}
                icon={faCircle}
                color={isLive ? "#f00" : "#fff"}
              />
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.center}>
          <TouchableOpacity
            onPress={() => {
              if (!player) return;
              if (player.currentTime - 10 < 0) return;
              player.currentTime -= 10;
            }}
          >
            <FontAwesomeIcon icon={faBackwardFast} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              if (!player) return;
              if (!isPlayed) {
                player.play();
              } else {
                player.pause();
              }
              setIsPlayed((prev) => !prev);
            }}
          >
            <FontAwesomeIcon icon={isPlayed ? faPause : faPlay} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              if (!player) return;
              if (player.currentTime + 10 >= player.duration) return;
              player.currentTime += 10;
            }}
          >
            <FontAwesomeIcon icon={faForwardFast} color="#fff" />
          </TouchableOpacity>
        </View>
        <View style={styles.right}>
          <TouchableOpacity onPress={() => setShowSettings((prev) => !prev)}>
            <FontAwesomeIcon icon={faGear} color="#fff" />
            {showSettings && (
              <Settings
                onQualityChange={() => {}}
                qualities={[]}
                selectedQuality={"auto"}
              />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setFullScreen({ flag: !isFullScreen.flag });
            }}
          >
            <FontAwesomeIcon
              icon={faUpRightAndDownLeftFromCenter}
              color="#fff"
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  contentContainer: {
    width: videoWidth,
    height: videoWidth * (9 / 16),
    position: "relative",
    backgroundColor: "red",
  },
  fullScreenContainer: {
    position: "absolute",
    ...Dimensions.get("window"),
    scale: 1,
    fontScale: 1,
  },
  video: {
    width: "100%",
    height: "100%",
    borderRadius: 0,
    borderWidth: 1,
    borderColor: "white",
    backgroundColor: "red",
  },
  slider: {
    width: "100%",
    color: "#000",
    paddingTop: 5,
    zIndex: 1,
  },
  controlsContainer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    paddingBottom: 5,
    borderTopColor: "white",
    borderTopWidth: 0.5,
    paddingInline: 5,
  },
  btns: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingInline: 30,
    paddingBlock: 10,
  },
  left: {
    display: "flex",
    alignItems: "flex-start",
  },
  center: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "10",
  },
  right: {
    display: "flex",
    flexDirection: "row",
    gap: 10,
  },
  settingsMenu: {
    position: "absolute",
    bottom: 40,
    right: 0,
    backgroundColor: "rgba(20, 20, 20, 0.7)",
    color: "white",
    padding: 15,
    borderRadius: 5,
    minWidth: 150,
    zIndex: 10,
    pointerEvents: "none",
  },
  settingItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    gap: 10,
    flexDirection: "row",
  },
  settingItemLabel: {
    fontSize: 14,
  },
  settingItemSelect: {
    backgroundColor: "black",
    color: "white",
    borderWidth: 1,
    padding: 5,
    fontSize: 14,
    borderRadius: 3,
    width: "70%",
    position: "absolute",
    zIndex: 5,
    top: 0,
  },
  eBtn: {
    width: 50,
    height: 20,
    backgroundColor: "white",
    borderRadius: 20,
    position: "relative",
  },
  eBtnBefore: {
    content: "",
    width: 25,
    height: 25,
    backgroundColor: "#0075ff",
    position: "absolute",
    top: "-50%",
    borderRadius: "50%",
    left: "100%",
    boxShadow: "0 0 8px 1px #000",
    transition: "left 0.1s linear",
  },
});
