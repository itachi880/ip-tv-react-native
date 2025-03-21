import { createStore } from "react-data-stores";
export const fullScreenFlag = createStore({ flag: false });
export const CHANNELS_QUERY_LIMIT = 20;
export const dbOffset = {
  offset: 0,
};
export const loadingFlag = createStore({ flag: false });
export const popupflagStrore = createStore({ flag: false, content: [] });
