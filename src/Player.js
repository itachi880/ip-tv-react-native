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
  faCheck,
  faCircle,
  faForwardFast,
  faGear,
  faPause,
  faPlay,
  faUpRightAndDownLeftFromCenter,
} from "@fortawesome/free-solid-svg-icons";
import { fullScreenFlag, popupflagStrore } from "./data/flags";
import { currentChannelStore } from "./data/data";
import { updateChannelState } from "./data/db";

const videoWidth = Dimensions.get("window").width * 0.5;

/**
 *
 * @param {object} param0
 * @param {VideoPlayer} param0.player
 * @returns
 */
export default function Player({ player }) {
  const [isFullScreen, setFullScreen] = fullScreenFlag.useStore();
  const [showControlls, setShowControlls] = useState(true);
  const playerRef = useRef(null);
  let timer;
  const currentChannel = currentChannelStore.useStore({ setter: false });
  useEffect(() => {
    if (!player) return;
    player.play();
    player.addListener("statusChange", async (data) => {
      if (
        data.error &&
        data.error.message.includes("code") &&
        currentChannel.state != "NO"
      ) {
        await updateChannelState(currentChannel.id, "NO");

        return;
      }
      if (data.status == "readyToPlay" && currentChannel.state != "OK") {
        await updateChannelState(currentChannel.id, "OK");
      }
    });

    return () => {
      player.removeAllListeners("statusChange");
      if (timer) clearInterval(timer);
    };
  }, [player]); // Ensure player is available when releasing

  useEffect(() => {
    if (!player) return;
    let url = currentChannel.link;
    if (currentChannel.quality) {
      url = url.split("/");
      url[url.length - 1] = currentChannel.quality;
      url = url.join("/");
    }
    console.log(currentChannel, url);
    player.replace({
      uri: url ?? "",
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
      ref={playerRef}
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
        showControlls={showControlls}
        setShowControlls={setShowControlls}
      />
    </View>
  );
}

/**
 *
 * @param {object} param0
 * @param {ReturnType<useVideoPlayer>} param0.player
 * @returns
 */
function Controls({ player, setFullScreen, isFullScreen, showControlls }) {
  const [isPlayed, setIsPlayed] = useState(player.playing ?? false);
  const [isLive, setIsLive] = useState(false);
  let showSettings = false;
  const currentChannel = currentChannelStore.useStore({ setter: false });
  const setPopupData = popupflagStrore.useStore({ getter: false });
  useEffect(() => {
    if (isLive) return;
    if (player.currentTime + 10 >= player.duration) return setIsLive(true);
    player.currentTime = player.duration - 10;
    setIsLive(true);
  }, [isLive]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (!player) return;
      setIsPlayed(player.playing);
    }, 500);
    return () => clearInterval(timer);
  });

  return (
    <View
      style={
        showControlls
          ? styles.controlsContainer
          : styles.hiddeControllsContainer
      }
    >
      <Slider
        focusable={false}
        tvFocusable={false}
        isTVSelectable={false}
        style={styles.slider}
        thumbTintColor="#f00"
        maximumTrackTintColor="#f00"
        minimumTrackTintColor="#f00"
        disabled={true}
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
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
            }}
            accessible={true}
            focusable={true}
            tvParallaxProperties={{ enabled: true }}
            onPress={() => {
              setIsLive(true);
              if (!player) return;
              player.currentTime = player.duration - 20;
            }}
          >
            <Text style={{ textAlign: "center", color: "#fff" }}>
              LIVE{"  "}
            </Text>
            <FontAwesomeIcon
              size={10}
              icon={faCircle}
              color={isLive ? "#f00" : "#fff"}
            />
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
          <TouchableOpacity
            onPress={() => {
              if (showSettings) return (showSettings = false);
              showSettings = true;
              setPopupData({
                flag: true,
                content: [
                  <QualityItem key={0} e={["auto", null, null]} />,
                  ...currentChannel.qualities.map((e, i) => (
                    <QualityItem key={i + 1} e={e} />
                  )),
                ],
              });
            }}
          >
            <FontAwesomeIcon icon={faGear} color="#fff" />
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
  hiddeControllsContainer: {
    display: "none",
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
    zIndex: 100,
    pointerEvents: "none",
  },
  settingItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    gap: 10,
    zIndex: 101,
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

    top: 0,
    zIndex: 102,
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
const QualityItem = ({ e }) => {
  const [currentChannel, setCurrentChannel] = currentChannelStore.useStore();
  const [isFocuse, setIsFocuse] = useState(false);
  const setPopupData = popupflagStrore.useStore({ getter: false });
  return (
    <TouchableOpacity
      onFocus={() => setIsFocuse(true)}
      onBlur={() => setIsFocuse(false)}
      onPress={() => {
        setPopupData({ flag: false });
        if (currentChannel.quality == e[1]) {
          setCurrentChannel({ quality: null });
          return;
        }
        setCurrentChannel({ quality: e[1] });
      }}
      style={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 10,
        backgroundColor: isFocuse ? "#000" : "#fff",
      }}
    >
      <Text style={styles.settingItemLabel}>
        {e[0] != "auto"
          ? `${e[0].split("x")[1]}p (${
              e[2] / 1024 <= 800
                ? (e[2] / 1024).toFixed(0) + "KB/s"
                : (e[2] / 1024 / 1024).toFixed(2) + "MB/s"
            })`
          : "auto"}
      </Text>
      <View
        style={[
          {
            width: 20,
            height: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderColor: "red",
            borderWidth: 2,
            borderStyle: "dashed",
          },
          currentChannel.quality == e[1]
            ? { backgroundColor: "red", borderWidth: 0 }
            : {},
        ]}
      >
        {currentChannel.quality == e[1] && (
          <FontAwesomeIcon icon={faCheck} color="#fff" />
        )}
      </View>
    </TouchableOpacity>
  );
};
