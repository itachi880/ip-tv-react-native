import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Button, TextInput } from "react-native";
import { startSqlServer, stopSqlServer } from "./data/ws";

const IPtvDBInterface = ({ setDb_interface = () => {} }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionDetails, setConnectionDetails] = useState({
    ip: "",
    port: "",
  });
  const [isServerRunning, setIsServerRunning] = useState(false);

  // useEffect to stop the server when the component unmounts
  useEffect(() => {
    return () => {
      stopSqlServer();
    };
  }, []);

  const handleConnect = () => {
    if (connectionDetails.ip && connectionDetails.port) {
      startSqlServer(
        connectionDetails.ip,
        connectionDetails.port,
        () => setIsConnected(true), // onConnect callback
        () => {
          setIsConnected(false);
          setIsServerRunning(false);
        } // onDisconnect callback
      );
      setIsServerRunning(true);
    }
  };

  const handleExit = () => {
    stopSqlServer();
    setIsServerRunning(false);
    setDb_interface(false); // Close settings
    console.log("Server stopped and settings closed.");
  };

  const handleInputChange = (field, value) => {
    setConnectionDetails((prevDetails) => ({
      ...prevDetails,
      [field]: value,
    }));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>IP-TV Settings</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter IP Address"
        value={connectionDetails.ip}
        onChangeText={(text) => handleInputChange("ip", text)}
      />

      <TextInput
        style={styles.input}
        placeholder="Enter Port"
        keyboardType="numeric"
        value={connectionDetails.port}
        onChangeText={(text) => handleInputChange("port", text)}
      />

      {/* Connect Button */}
      <Button
        title="Connect"
        onPress={handleConnect}
        color="green"
        disabled={
          isServerRunning || !connectionDetails.ip || !connectionDetails.port
        }
      />

      {/* Connection Status */}
      <Text style={styles.status}>
        Connection Status: {isConnected ? "Connected ✅" : "Disconnected ❌"}
      </Text>

      {/* Exit button */}
      <Button title="Exit & Stop Server" onPress={handleExit} color="red" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, alignItems: "center" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  status: { fontSize: 18, marginBottom: 20 },
  input: {
    width: "80%",
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 10,
    borderRadius: 5,
    textAlign: "center",
  },
});

export default IPtvDBInterface;
