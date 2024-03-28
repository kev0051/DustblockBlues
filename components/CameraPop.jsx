import React, { useContext } from 'react';
import { TouchableOpacity, Modal, Text, TouchableHighlight, View, StyleSheet } from 'react-native';
import * as Speech from 'expo-speech';
import ttsContext from '../config/ttsContext'; // replace with your actual path



const CameraPop = ({ isVisible, onClose }) => {

  const tts = useContext(ttsContext);

const handleTextPress = (text) => {
  if (tts.ttsChoice === "true") {
    Speech.speak(text);
  }
};
const welcomeText = 'Welcome! To continuously identify legos, press the top right tab. To only identify one piece at a time, please press the white circle below.';

return(
  <Modal
    animationType="slide"
    transparent={true}
    visible={isVisible}
    onRequestClose={onClose}
  >
   <View style={styles.centeredView}>
    <View style={styles.modalView}>
      <TouchableOpacity onPress={() => handleTextPress(welcomeText)}>
        <Text>
          {welcomeText}
        </Text>
      </TouchableOpacity>
        <TouchableHighlight 
          style={{ ...styles.button, backgroundColor: 'red' }} 
          onPress={() => {
            console.log('Modal has been closed.');
            onClose();
          }}
        >
          <Text style={{ color: 'white' }}>Exit</Text>
        </TouchableHighlight>
      </View>
    </View>
  </Modal>
);
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2
  }
});

export default CameraPop;