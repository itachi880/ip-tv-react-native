import { createStore } from "react-data-stores";

export const currentChannelStore = createStore({
  link: "",
  referer: null,
  quality: null,
  qualities: [],
});
export const channelsStore = createStore({ channels: [] });
