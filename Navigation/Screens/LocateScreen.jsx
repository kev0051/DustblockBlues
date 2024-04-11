import React, { useState, useEffect, useRef, useContext } from 'react';
import {
  TouchableOpacity,
  Image,
  View,
  StyleSheet,
  Dimensions,
  Pressable,
  Modal,
  Text,
  ActivityIndicator,
  Vibration,
  Platform,
} from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import { AutoFocus, Camera } from 'expo-camera';
import axios from 'axios'; // Import Axios
import * as ImageManipulator from 'expo-image-manipulator';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LocatePop from '../../components/LocatePop'; // adjust the path according to your file structure
import finderror from '../../assets/finderror.png'; // replace with the actual path to your image
import * as Speech from 'expo-speech';
import ttsContext from "../../config/ttsContext";
import tts from '../../config/tts';

function LocateScreen({ route, navigation }) {
  const [showLocatePop, setShowLocatePop] = useState(false);
  useEffect(() => {
    setShowLocatePop(true);
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      return () => {
        try {
          navigation.setParams({ partId: null });
        } catch (e) {}
      };
    }, [])
  );

  const textureDims = Platform.OS === 'ios' ? { height: 1920, width: 1080 } : { height: 1200, width: 1600 };

  const [hasCameraPermission, setHasCameraPermission] = useState();
  const [hasMediaLibraryPermission, setHasMediaLibraryPermission] = useState();
  let cameraRef = useRef();

  const [legoPrediction, setLegoPrediction] = useState(null);
  const [showPrediction, setShowPrediction] = useState(false);  
  const [legoLocations, setLegoLocations] = useState([]);
  const [partLocation, setPartLocation] = useState(false);
  const [legos, setLegos] = useState([]);

  const tts = useContext(ttsContext);

    const handleTextPress = (text) => {  
      if (tts.ttsChoice === "true") {
        Speech.speak(text);
      }
    };
    const warningText = 'The prediction confidence is low. If this error persists please ensure viewing the LEGO from a top-down angle, in a well-lit area, on a uniform background, and without any obstructions.';

  /*
  // Use to debug updates to legoLocations
  useEffect(() => {
    console.log("lego locations updated:", legoLocations);
    legoLocations.map((prediction, index) => {
      for (var i = 0; i < legos.length; i++) {
        if (legos[i].PartID === prediction.name) {
          //console.log(legos[i]);
          console.log("Found Part:", legos[i].PartID);
          setLegoPrediction([legos[i], prediction.confidence.toFixed(2) * 100 ])
          console.log("width: ", (Dimensions.get('window').width) * prediction.width);
          console.log("height: ", ((Dimensions.get('window').height-130))* prediction.height);
          console.log("top: ", (prediction.ycenter) * (Dimensions.get('window').height-130)) + (((Dimensions.get('window').height-130))* prediction.height/2);
          console.log("left: ", (prediction.xcenter) * Dimensions.get('window').width) + ((Dimensions.get('window').width) * prediction.width/2);
        }
      }
      //setShowPrediction(true); //set flag to display prediction
  });
  }, [legoLocations, legos]);
  
  //Use to debug updates to legoPredictions
  useEffect(() => {
    console.log("lego prediction updated:", legoPrediction);
    console.log("show prediction updated: ", showPrediction);
  }, [legoPrediction, showPrediction]);
  */

  let frame1 = 0;
  const computeRecognitionEveryNFrames1 = 60;
  function takePic() {
    const loop = async () => {
        if (frame1 % computeRecognitionEveryNFrames1 === 0) {
          let options = {
            base64: true,
          };

          let image = await cameraRef.current.takePictureAsync(options);

          const actions = [
            {
              resize: {
                width: 400,
                height: 512,
              },
            },
          ];
          const saveOptions = {
            format: ImageManipulator.SaveFormat.JPEG,
            base64: true,
          };
          image = await ImageManipulator.manipulateAsync(image.uri, actions, saveOptions);

          const formData = new FormData();
          formData.append('size', 640);
          formData.append('confidence', 0.25);
          formData.append('iou', 0.45);
          formData.append('image', {
            uri: image.uri,
            name: 'image.jpg',
            type: 'image/jpg',
          });

          axios.post('https://api.ultralytics.com/v1/predict/fmiQDH8IwFsy2KZNqqZp', formData,  {
            headers: {
              'x-api-key': '216ef9d083377da32bc3bf704fdcf69f085b4fff42',
              'Content-Type': 'multipart/form-data',
            },
          })
            .then((response) => {
              let res = [];
              //console.log(responseJson.data);
              res = response.data.data;

              // function to sanatize output
              const regex = /\((\d+)\)/; // Regular expression to match the number inside parentheses
              for(var i = 0; i < res.length; i++){
                const match = res[i].name.match(regex); // Extract the number using regex
                //console.log(match[1]);
                res[i].name = match[1];
              }
              //console.log("res: ", res);
              try{
                if (route.params.partId) {
                  for (var i = 0; i < res.length; i++) {
                    if (res[i].name === route.params.partId) {
                      res = [{ ...response.data.data[i], confidence: response.data.data[i].confidence * 100 }];
                      setPartLocation(true);
                      Vibration.vibrate();
                    }
                  }
                }
              } catch (e) {
              } finally {
              setLegoLocations(res);
              }

            })
            .catch((error) => {
              console.error(error);
            });
        }
        requestAnimationFrame(loop);
      } 

    loop();
  };

  useEffect(() => {
    AsyncStorage.getItem('LegoDB').then((database) => {
      if (database === null) {
        fetch('https://api.npoint.io/f7689e80de563c693342')
          .then((response) => {
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
          })
          .then((data) => {
            setLegos(data);
            AsyncStorage.setItem('LegoDB', JSON.stringify(data));
          })
          .catch((error) => console.error(error));
      } else {
        setLegos(JSON.parse(database));
      }
    });
  }, []);

  const speakPrediction = () => {
    const textToSay = legoPrediction[0].PartName; //easier to hear like this
    if (tts.ttsChoice === "true") {
      Speech.speak(textToSay);
    }
  };

  useEffect(() => {
    (async () => {
      const cameraPermission = await Camera.requestCameraPermissionsAsync();
      const mediaLibraryPermission = await MediaLibrary.requestPermissionsAsync();
      setHasCameraPermission(cameraPermission.status === 'granted');
      setHasMediaLibraryPermission(mediaLibraryPermission.status === 'granted');
    })();
  }, []);

  if (hasCameraPermission === undefined) {
    return <Text>Requesting permissions...</Text>;
  } else if (!hasCameraPermission) {
    return <Text>Permission for camera not granted. Please change this in settings.</Text>;
  }
  
    return (
      <View style={styles.container}>
            {showLocatePop && <LocatePop isVisible={showLocatePop} onClose={() => setShowLocatePop(false)} />}

      {/* this is the prediction modal */}
        <Modal visible={showPrediction} transparent={true} animationType="slide" >
          <View style={styles.modal}>
            <View style={styles.modalContent}>
              {/* if theres a prediction ready, it is displayed to user, else it is just the loading screen */}
              {legoPrediction ? 
                [
                  <Text key= {0} style={{ fontSize: 30, color:"black", fontWeight:'bold'}}onPress={speakPrediction}> {"Prediction: " + legoPrediction[1] + "%"}</Text>,
                  legoPrediction[1] >= 30 && 
                  <Image
                  key = {1}
                  style={{ width: '50%', height: "50%", resizeMode: 'contain' }}
                  source={{ uri: legoPrediction[0].ImageURL }}
                  />,
                  legoPrediction[1] >= 30 && 
                  <TouchableOpacity onPress={() => handleTextPress(legoPrediction[0].PartName)}>
            <Text key={2}>{legoPrediction[0].PartName}</Text>
          </TouchableOpacity>,
                  // takes user to the full part information if they desire
                  legoPrediction[1] >= 30 && 
                  <Pressable key = {3}
                    style={styles.goToPartButton}
                    onPress={() => {
                      navigation.navigate('Lego',{ item:legoPrediction[0]})
                      setShowPrediction(false)
                      setLegoPrediction(null)
                      
                      
                    }}>
                    <Text>Go To Part Page</Text>
                  </Pressable>,
                  legoPrediction[1] < 30 &&
                    <Image
                      key = {5}
                      style={{ width: '50%', height: "50%", resizeMode: 'contain' }}
                      source={legoPrediction[1] < 30 ? finderror : null}
                    />,
                  legoPrediction[1] < 30 &&
                  <TouchableOpacity onPress={() => handleTextPress(warningText)}
                  style={{ backgroundColor: 'white' }}>
                  <Text key={4} style={{ color: 'red' }}>
                    {warningText}
                  </Text>
                </TouchableOpacity>
                ]:
                <ActivityIndicator size="large" />
              }
              {/* dismiss button that serves as cancel even if there is no prediction */}
              <Pressable
                style={styles.dismissButton}
                onPress={() => {
                  setShowPrediction(false)
                  setLegoPrediction(null)
                }}>
                <Text>Dismiss</Text>
              </Pressable>
            </View>
          </View>
        </Modal>

      <Camera style={styles.container} ref={cameraRef} onCameraReady={() => takePic()} />

      {legoLocations.map((prediction, index) => (
        [
        <View  key = {index} onStartShouldSetResponder={() => { {
          for (var i = 0; i < legos.length; i++){
            if (legos[i].PartID === prediction.name){
              setLegoPrediction([legos[i], prediction.confidence.toFixed(2) * 100 ])
            };
          }
          setShowPrediction(true);
        } }} style={[styles.box, {
          width:  (Dimensions.get('window').width) * prediction.width, 
          height: ((Dimensions.get('window').height)) * prediction.height,
          top: ((Dimensions.get('window').height) - ((prediction.ycenter) * (Dimensions.get('window').height))), 
          left: ((prediction.xcenter) * Dimensions.get('window').width),
          // left:  prediction.x
          // width: 428, 400, 415
          // height: 796, 512, 605  
          // left: ,
          // right:  
          }]}
          >
            
            <Text style ={styles.predictionName}>{prediction.name} ({prediction.confidence.toFixed(2) * 100}%)</Text>
          </View>,
          
        
          partLocation && 
            <View key = {index+1} style={ styles.partLocationContainer}>
                <Text style={ [{fontSize: 30,left: '6%',color: "#ff0000",}]}>Part Located!</Text>
                <Text style={ styles.partLocationText}>Width:{((Dimensions.get('window').width) * prediction.width).toFixed(0)}</Text>
                <Text style={ styles.partLocationText}>Height:{(((Dimensions.get('window').height))* prediction.height).toFixed(0)}</Text>
                <Text style={ styles.partLocationText}>Y:{((Dimensions.get('window').height) - (((prediction.ycenter) * (Dimensions.get('window').height)) + 130))}</Text>
                <Text style={ styles.partLocationText}>X:{(((prediction.xcenter) * Dimensions.get('window').width))}</Text>
            </View>]
          
        
      ))}
       
      </View>
    );
  };


const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
  },
  partLocationContainer: {
    position: 'absolute',
    left: Dimensions.get('screen').width / 2 - 90,
    bottom: 30,
    backgroundColor: 'white',
    opacity: 0.5,
    zIndex: 100,
    height: 120,
    borderRadius: 10,
    width: 185,
  },
  partLocationText: {
    left: '30%',
    color: '#ff0000',
  },
  camera: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  modal: {
    flex: 1,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalContent: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 350,
    height: 450,
    borderRadius: 24,
    backgroundColor: '#ffffff',
  },
  goToPartButton: {
    width: 150,
    height: 50,
    marginTop: 20,
    borderRadius: 24,
    color: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ff0000',
  },
  dismissButton: {
    width: 150,
    height: 50,
    marginTop: 10,
    borderRadius: 24,
    color: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dae0db',
  },
  box: {
    borderWidth: 2,
    backgroundColor: 'transparent',
    position: 'absolute',
    zIndex: 75,
    borderColor: '#ff0000',
  },
  predictionName: {
    position: 'absolute',
    color: '#ff0000',
    top: -20,
    width: 1000,
  },
});

export default LocateScreen;

