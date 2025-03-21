import { ActivityIndicator } from "react-native";
import { loadingFlag } from "./data/flags";

export default function LoadingBar() {
  const loadingBarFlag = loadingFlag.useStore({ setter: false });
  return loadingBarFlag.flag ? (
    <ActivityIndicator
      style={{ position: "absolute", top: "50%", left: "50%" }}
      size="large"
      color="#fff"
      role="progressbar"
    />
  ) : null;
}
