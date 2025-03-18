import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useVideoPlayer, VideoPlayer } from "expo-video";
import Slider from "@react-native-community/slider";
// @ts-ignore
import Icon from "react-native-vector-icons/FontAwesome";

const src =
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

const Player = ({ link, refferer }) => {
  console.log("Using data:", { link, refferer });
  const player = useVideoPlayer(src, (player) => {
    player.loop = true;
    player.play();
  });
  const videoRef = useRef < VideoPlayer > null;
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [quality, setQuality] = (useState < string) | (null > null);
  const [videoSource, setVideoSource] = useState(link); // Start with adaptive link

  // Device screen dimensions
  const { width, height } = Dimensions.get("window");
  const videoHeight = height * 0.5;

  // Play/Pause Handler
  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  // Handle progress updates
  const handleProgress = (data) => {
    if (duration > 0) {
      setProgress(data.positionMillis / duration);
    }
  };

  // Get video duration when loaded
  const handleLoad = (meta) => {
    setDuration(meta.durationMillis);
  };

  // Handle Quality Selection (Locking Quality)
  const handleQualityChange = (quality) => {
    let newSource = link; // Default to adaptive
    if (quality === "low") {
      newSource = "https://path.to/your/low_quality.m3u8";
    } else if (quality === "medium") {
      newSource = "https://path.to/your/medium_quality.m3u8";
    } else if (quality === "high") {
      newSource = "https://path.to/your/high_quality.m3u8";
    }

    setVideoSource(newSource);
    setQuality(
      quality === "auto" ? "Auto" : `${quality.toUpperCase()} Quality`
    );
  };

  // Seek video
  const handleSeek = (value) => {
    if (videoRef.current) {
      videoRef.current.setPositionAsync(value * duration);
    }
  };

  return (
    <View style={styles.container}>
      <Video
        ref={videoRef}
        source={{
          uri: videoSource,
          headers: refferer ? { Referer: refferer } : {},
        }}
        style={styles.video}
        shouldPlay={isPlaying}
        resizeMode="cover"
        onPlaybackStatusUpdate={handleProgress}
        onLoad={handleLoad}
        isLooping
      />

      {/* Custom Controls */}
      <View style={styles.controls}>
        <View style={styles.controlRow}>
          <TouchableOpacity style={styles.buttonText}>
            <Text style={{ color: "#fff" }}>
              LIVE <Icon name="dot-circle-o" color="#fff" />
            </Text>
          </TouchableOpacity>

          {/* Play/Pause */}
          <View style={styles.playControls}>
            <TouchableOpacity
              onPress={handlePlayPause}
              style={styles.buttonText}
            >
              <Icon name="backward" size={15} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handlePlayPause}
              style={styles.buttonText}
            >
              {!isPlaying ? (
                <Icon name="play-circle-o" size={20} color="#fff" />
              ) : (
                <Icon name="pause-circle-o" size={20} color="#fff" />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handlePlayPause}
              style={styles.buttonText}
            >
              <Icon name="forward" size={15} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Settings - Quality Selection */}
          <TouchableOpacity
            style={styles.buttonText}
            onPress={() => handleQualityChange("auto")}
          >
            <Text style={{ color: "#fff" }}>Auto</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.buttonText}
            onPress={() => handleQualityChange("low")}
          >
            <Text style={{ color: "#fff" }}>480p</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.buttonText}
            onPress={() => handleQualityChange("medium")}
          >
            <Text style={{ color: "#fff" }}>720p</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.buttonText}
            onPress={() => handleQualityChange("high")}
          >
            <Text style={{ color: "#fff" }}>1080p</Text>
          </TouchableOpacity>
        </View>

        {/* Progress Bar */}
        <Slider
          style={styles.slider}
          value={progress}
          onValueChange={handleSeek}
          minimumValue={0}
          maximumValue={1}
        />

        {/* Quality Display */}
        {quality && <Text style={styles.qualityText}>Quality: {quality}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "red",
    position: "absolute",
    right: 0,
    width: Dimensions.get("window").height * 0.5 * (16 / 9),
    height: Dimensions.get("window").height * 0.5,
    overflow: "visible",
  },
  video: {
    backgroundColor: "black",
    width: "100%",
    height: "100%",
  },
  controls: {
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: Dimensions.get("window").height * 0.5 * 0.2,
  },
  controlRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 10,
  },
  playControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "white",
    paddingHorizontal: 5,
  },
  slider: {
    width: "100%",
  },
  qualityText: {
    color: "white",
    fontSize: 14,
    marginTop: 5,
  },
});

export default Player;
