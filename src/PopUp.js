import React from "react";
import { ScrollView } from "react-native";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { popupflagStrore } from "./data/flags";

const PopUp = () => {
  const [PopUpData, setIsOpen] = popupflagStrore.useStore();
  return (
    <Modal visible={PopUpData.flag} transparent={true} animationType="fade">
      <View style={styles.popupOverlay}>
        <View style={styles.popupContent}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => {
              setIsOpen({ flag: false });
            }}
          >
            <Text style={styles.closeButtonText}>&times;</Text>
          </TouchableOpacity>
          <ScrollView style={styles.optionsContainer}>
            {PopUpData.content}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  popupOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  popupContent: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    width: "80%",
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    top: 5,
    right: 20,
  },
  closeButtonText: {
    fontSize: 30,
  },
  optionsContainer: {
    width: "100%",
    marginTop: 30,
  },
  option: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    alignItems: "center",
  },
});

export default PopUp;
