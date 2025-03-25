import { ToastAndroid } from "react-native";
import { db } from "./db";

/**
 * @type {{connection:WebSocket|null}}
 */
const ws = { connection: null };
const startSqlServer = (ip, port, onConnect, onDisconnect) => {
  stopSqlServer();
  ws.connection = new WebSocket(`ws://${ip}:${port}`);
  ws.connection.onopen = () => {
    console.log("Connected to WebSocket Server");
    if (onConnect) onConnect(ip, port);
    ws.connection.send(JSON.stringify({ type: "executor" }));
  };
  ws.connection.onmessage = async (event) => {
    let method = "getAllAsync";
    const data = JSON.parse(event.data);
    // showing sql get executed
    ToastAndroid.showWithGravity(
      `executing : ${data.sql}`,
      ToastAndroid.SHORT,
      ToastAndroid.BOTTOM
    );
    if (
      data.sql
        .split(" ")
        .map((e) => e.toLowerCase()) // SeLeCt => select
        .includes("select")
    ) {
      method = "getAllAsync"; // returns the query select data as array
    } else {
      method = "runAsync"; //return the query state
    }
    try {
      const ret = JSON.stringify({
        data: await db[method](data.sql), //select the appropriet methode from the db and pass the evet data for it
        type: "response",
        fn: data.fn,
      });
      ws.connection.send(ret);
    } catch (e) {
      console.log("err", e);
      const data = JSON.stringify({
        error: e,
        type: "response",
      });
      ws.connection.send(data);
    }
  };
  ws.connection.onerror = (error) => {
    console.error("WebSocket Error:", error);
    if (onDisconnect) onDisconnect(error);
  };
  ws.connection.onclose = () => {
    console.log("WebSocket Connection Closed");
    if (onDisconnect) onDisconnect("connection close");
  };
};
const stopSqlServer = () => {
  if (!ws.connection) return;
  ws.connection.close();
};
export { startSqlServer, stopSqlServer };
