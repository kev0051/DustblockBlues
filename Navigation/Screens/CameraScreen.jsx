import React, {useState, useEffect, useRef, useContext} from 'react';
import {Image,View,StyleSheet,Dimensions,Pressable,Modal,Text,ActivityIndicator, TouchableWithoutFeedback, Alert, TouchableOpacity} from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import {startPrediction} from '../../helpers/tensor-helper';
import {Camera} from 'expo-camera';
import * as tf from "@tensorflow/tfjs";
import { cameraWithTensors } from '@tensorflow/tfjs-react-native';
import {fetch, bundleResourceIO } from '@tensorflow/tfjs-react-native';
import { Switch } from "@react-native-material/core";
import * as ImageManipulator from 'expo-image-manipulator';
import * as Speech from 'expo-speech';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CameraPop from '../../components/CameraPop'; // adjust the path according to your file structure
import finderror from '../../assets/finderror.png'; // replace with the actual path to your image
import ttsContext from "../../config/ttsContext";
import tts from '../../config/tts';

//tensor flow initializations
  const initialiseTensorflow = async () => {
    await tf.ready();
    tf.getBackend(); 
  }
  const TensorCamera = cameraWithTensors(Camera);

  //model files
  const modelJson = require('../../model/model.json');
  /*
  const loadModel = async () => {
    const model = await tf.loadLayersModel('https://cdn.jsdelivr.net/gh/ReedNathan001/DBBDatabase@main/model.json');
    return model;
  };*/

  const modelWeights1 = require('../../model/weights1of4.bin');
  const modelWeights2 = require('../../model/weights2of4.bin');
  const modelWeights3 = require('../../model/weights3of4.bin');
  const modelWeights4 = require('../../model/weights4of4.bin');

  //the order of lego IDs based on trained model
  const RESULT_MAPPING = [
    "4211866", "4540797", "4542578", "4211815", "6284188", "6325504", "4502595", "6331441",
    "4495930", "6326620", "4514554", "6288218", "6275844", "370626", "4543490", "6028041",
    "6268905", "6279881", "6083620", "4177434", "4198367", "6276836", "4509912", "4495412",
    "4153707", "4211807", "4652235", "6009019", "4121715", "6284699", "4539880", "4566251",
    "4666579", "6007973", "4634091", "4509376", "4611705", "4211510", "4211805", "6008527",
    "4585040", "4142865", "370826", "6271869", "6280394", "4121667", "6313520", "4565452",
    "370526", "4225033", "4582792", "4142822", "6185471", "4513174", "373726", "4522934",
    "6195314", "4162857", "6035364", "4141270", "6012451", "6278132", "4239601", "4499858",
    "4535768", "6031821", "4211651", "4211639", "4153718", "4640536", "6273715", "6265091",
    "4140806", "4541326", "370726", "6173127", "4552347", "4566249", "4177431", "4211713",
    "6346535", "4587275", "6261375", "4142236", "4514553", "6271161"
];

  
  //camera screen function with navigation as argument
  function CameraScreen({navigation}){

    const tts = useContext(ttsContext);

const handleTextPress = (text) => {  
  if (tts.ttsChoice === "true") {
    Speech.speak(text);
  }
};
const warningText = 'The prediction confidence is low. If this error persists please ensure viewing the LEGO from a top-down angle, in a well-lit area, on a uniform background, and without any obstructions.';

    
    const [showCameraPop, setShowCameraPop] = useState(false);

    const textureDims = Platform.OS === 'ios' ?
  {
    height: 1920,
    width: 1080,
  } :
  {
    height: 1200,
    width: 1600,
  };

    //camera permissions
    const [hasCameraPermission, setHasCameraPermission] = useState();
    const [hasMediaLibraryPermission, setHasMediaLibraryPermission] = useState();
  
    //unused maybe useful variables
    // const [isProcessing, setIsProcessing] = useState(false);


    //this is where the state of prediction is updated
    const [legoPrediction, setLegoPrediction] = useState(null);
    //tensor mage that updates everyframe to capture the frame when user presses capture image
    const [tensorImage, setTensorImage] = useState()
    //holds pretrained model
    const [model, setModel] = useState()
    //prediction state to show prediction modal
    const [showPrediction, setShowPrediction] = useState(false)

    const [loading, setLoading] = useState(false)

    //livemode state
    const [liveMode, setLiveMode] = useState(false)
    //livemode toggle switch, sets prediction to null so that live predictions dont interfere with capture predictions
    const toggleSwitch = () => {
      setLiveMode(previousState => !previousState)
      setLegoPrediction(null)
    };
    // lego database
    //const legos = require('../../assets/database.json')
    const [legos, setLegos] = useState([]);

    //speech function
    const speakPrediction = () => {
      const textToSay = legoPrediction[0].PartName; //easier to hear like this
      if (tts.ttsChoice === "true") {
        Speech.speak(textToSay);
      }
    };
  // const speakDismiss = () => {
  //     const textToSay = 'Dismiss';
  //     Speech.speak(textToSay);
  //   };
/*
  useEffect(() => {
    fetch('https://raw.githubusercontent.com/ReedNathan001/DBBDatabase/main/database.json')
      .then(response => response.json())
      .then(data => setLegos(data))
      .catch(error => console.error(error));
  }, []);
*/

useEffect(() => {
  // Show the CameraPop component when the CameraScreen component mounts
  setShowCameraPop(true);
}, []);

useEffect(() => {
  AsyncStorage.getItem('LegoDB').then(
    database => {
      if(database === null){
      fetch('https://api.npoint.io/f7689e80de563c693342')
      .then(response => {
        if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
      })
      .then(
        data => { setLegos(data);
          AsyncStorage.setItem('LegoDB', JSON.stringify(data));
        }
    
      )
      .catch(error => console.error(error));
      }
    else{
      setLegos(JSON.parse(database));
    }
  })
}, []);

    useEffect(() => {
        (async () => {
          //checks permissions
          const cameraPermission = await Camera.requestCameraPermissionsAsync();
          const mediaLibraryPermission = await MediaLibrary.requestPermissionsAsync();
          setHasCameraPermission(cameraPermission.status === "granted");
          setHasMediaLibraryPermission(mediaLibraryPermission.status === "granted");
          //initializes tensorflow and loads the model as soon as camera page is loaded
          await initialiseTensorflow();
          try{
            setModel(await tf.loadGraphModel(bundleResourceIO(modelJson, [modelWeights1, modelWeights2, modelWeights3, modelWeights4])));
          }
          catch(e){
            console.error(e);
          }
          //const model = await loadModel();
          //setModel(model);
        })();
      }, []);


      if (hasCameraPermission === undefined) {
        return <Text>Requesting permissions...</Text>
      } else if (!hasCameraPermission) {
        return <Text>Permission for camera not granted. Please change this in settings.</Text>
      }


      //live stream predictions, glitches in the beginning because model is still loading, needs to toggle button on and off to unglitch
      let frame = 0;
      const computeRecognitionEveryNFrames = 60;
      const handleCameraStream = async (images) => {
            //loops every frame
            console.log(images);
            const loop = async () => {
                if(frame % computeRecognitionEveryNFrames === 0){

                    const nextImageTensor = images.next().value;
                    //this is where the prediction happens based on the model
                    try{ 
                      const imageData2 = tf.image.resizeBilinear(nextImageTensor,[640,640])
                      const fin = tf.expandDims(imageData2, 0);
                      const normalized = fin.cast('float32').div(127.5).sub(1);
                      //if the model exists, the prediction part starts
                      if (model){
                        const prediction = await startPrediction(model, normalized);
                        
                        const highestPrediction = prediction.indexOf(
                          Math.max.apply(null, prediction),
                        );
                        //looks for the part that was predicted in the model, updates the state of the prediction lego
                        for (var i = 0; i < legos.length; i++){
                          if (legos[i].PartID === RESULT_MAPPING[highestPrediction]){
                            setLegoPrediction([legos[i], Number(100*prediction[highestPrediction]).toFixed(1) ])
                          }
                        }
                        tf.dispose([normalized]);
                      }
                    }
                    //if theres an error or live stream is turned off, this activates and exits the loop
                    catch(e){
                     return 1
                    }

                }
                frame += 1;
                frame = frame % computeRecognitionEveryNFrames;
            
              requestAnimationFrame(loop);
            }
           
            loop();
      }

    // const handleImageCapture = async () => {
    //   setIsProcessing(true);
    //   const imageData = await cameraRef.current.takePictureAsync({
    //     base64: true,
    //     quality: 1,
    //   });
    //   processImagePrediction(imageData);
    // };

    // const processImagePrediction = async (base64Image) => {
    //   const croppedData = await cropPicture(base64Image, 300);
    //   const model = await getModel();
    //   const tensor = await convertBase64ToTensor(croppedData.base64);
    //   console.log(tensor.value)

    //   // MediaLibrary.saveToLibraryAsync(croppedData.uri)

    //   const prediction = await startPrediction(model, tensor);
    //   console.log(prediction)
    //   const highestPrediction = prediction.indexOf(
    //     Math.max.apply(null, prediction),
    //   );
    //   setPresentedShape(RESULT_MAPPING[highestPrediction]);

    // };

      
    
  //picture capture prediction, this function grabs a tensor of every frame and sets it to the tensor state to be used for prediction if the user clicks capture
  //very ineffecient, if image can be converted to tensor then solution might be a lot faster
 
 /*
  const handleTensorCapture = async (images: IterableIterator<tf.Tensor3D>) => {
    const loop = async () => { 
      setTensorImage(images.next().value)
      requestAnimationFrame(loop);
      
    }
    loop();
  }
*/

let frameCount = 0;
const captureEveryNFrames = 30; // Change this to capture frames less or more frequently
//30fps so 1 frame captured per second
const handleTensorCapture = async (images) => {
  console.log(images);
  const loop = async () => { 
    if (frameCount % captureEveryNFrames === 0) {
      const tensor = images.next().value;
      const resizedTensor = tf.image.resizeBilinear(tensor, [640, 640]);
      setTensorImage(resizedTensor);
    }
    frameCount++;
    requestAnimationFrame(loop);
  }
  loop();
}

  //when user clicks capture image button, this function fires using the tensor state frm previous function and predicting based on that
    const handleImageCapture = async () => {
  
      setLoading(true)
      //prediction preperations
      try{
        const imageData2 = tf.image.resizeBilinear(tensorImage,[640,640])
        console.log(imageData2);   
        const fin = tf.expandDims(imageData2, 0);
        console.log(fin); 
        const normalized = fin.cast('float32').div(127.5).sub(1);
        console.log(normalized); 
        //prediction
        if (model){
          //console.log(model);
          const prediction = await startPrediction(model, normalized);
          const highestPrediction = prediction.indexOf(
            Math.max.apply(null, prediction),
          );
          
          //finding lego based on ID and setting it to state of prediction model
          for (var i = 0; i < legos.length; i++){
            if (legos[i].PartID === RESULT_MAPPING[highestPrediction]){
              const predictionPercentage = Number(100*prediction[highestPrediction]).toFixed(1);
              setLegoPrediction([legos[i], predictionPercentage])
              if (predictionPercentage < 80) {
                setShowCameraPop(true);
              }
            }
          }
          //activates prediction modal
          setShowPrediction(true)
        }
      }
      catch (e){
        console.log(e)
      }
      setLoading(false)
    };


    return (
<View style={styles.container}>
  {/* this is the prediction modal */}
  <Modal visible={showPrediction} transparent={true} animationType="slide" >
    <View style={styles.modal}>
      <View style={styles.modalContent}>
        {/* if theres a prediction ready, it is displayed to user, else it is just the loading screen */}
        {legoPrediction ? 
          [
            <Text key= {0} style={{ fontSize: 30, color:"black", fontWeight:'bold'}}onPress={speakPrediction}> {"Prediction: " + legoPrediction[1] + "%"}</Text>,
            legoPrediction[1] >= 80 && 
            <Image
              key = {1}
              style={{ width: '50%', height: "50%", resizeMode: 'contain' }}
              source={{ uri: legoPrediction[0].ImageURL }}
            />,
            legoPrediction[1] >= 80 && 
            <TouchableOpacity onPress={() => handleTextPress(legoPrediction[0].PartName)}>
            <Text key={2}>{legoPrediction[0].PartName}</Text>
          </TouchableOpacity>,
            legoPrediction[1] >= 80 && 
              <Pressable key = {3}
                style={styles.goToPartButton}
                onPress={() => {
                  navigation.navigate('Lego',{ item:legoPrediction[0]})
                  setShowPrediction(false)
                  setLegoPrediction(null)
                }}>
                <Text>Go To Part Page</Text>
              </Pressable>, 
                  // Add a message when the prediction is below 50
    legoPrediction[1] < 80 &&
    <Image
  key = {5}
  style={{ width: '50%', height: "50%", resizeMode: 'contain' }}
  source={legoPrediction[1] < 80 ? finderror : null}
/>,
    legoPrediction[1] < 80 &&
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
                  // setLegoPrediction(null)
                }}>
                <Text>Dismiss</Text>
              </Pressable>
            </View>
          </View>
        </Modal>

        {model && [<Switch key= {1} style={styles.switch}  onValueChange={toggleSwitch} value={liveMode} />,
        < Text key= {2} style={styles.switchText}>Live Mode</Text>]}
        {/* Show the CameraPop component if showCameraPop is true */}
        {showCameraPop && <CameraPop isVisible={showCameraPop} onClose={() => setShowCameraPop(false)} />}
        
        {/* this is the prediction for livemode, only fires if in live mode and if there is a prediction */}
        {legoPrediction && liveMode ? 
                  [<Pressable key = {1} style={{zIndex: 100}} onPress= {()=> setShowPrediction(true)}>
                    <Text 
                      style={{ fontSize: 30,zIndex: 100, top: 50, color:"white", fontWeight:'bold', position: "absolute",}}>
                    {"Prediction: " + legoPrediction[1] + "%"}
                    </Text>
                  </Pressable>,
                  <TouchableWithoutFeedback key = {2} style={{zIndex: 100}} onPress= {()=> setShowPrediction(true)}>
                  <Image
                    style={{ width: '15%', height: "15%", resizeMode: 'contain',position: "absolute",zIndex: 100,top: 70, left: 45 }}
                    source={{ uri: legoPrediction[0].ImageURL }}
                  />
                  </TouchableWithoutFeedback>,
                   legoPrediction[1] < 50 &&
                  <Pressable key={3} style={{ zIndex: 100, top: 150 }} onPress={() => handleTryAgain()}>
                    <Text style={{ fontSize: 20, color: "white", fontWeight: 'bold', textAlign: "center" }}>
                      Try Again
                    </Text>
                  </Pressable>
                  ] :
                  null
          }

        {/* works but ram heavy  */}
        {/* livemode check, different components fire depending whether user in live or picture mode, capture button disappears from livemode */}
        {liveMode?
          <TensorCamera
            style={styles.camera}
            type={Camera.Constants.Type.back}
            onReady={(tensors)=>handleCameraStream(tensors)}
            resizeHeight={640}
            resizeWidth={640}
            resizeDepth={3}
            autorender={true}
            cameraTextureHeight={1920}
            cameraTextureWidth={1080}
            />

        :
        
            [ <TensorCamera 
                key={1}
                style={styles.camera}
                type={Camera.Constants.Type.back}
                onReady={(tensors)=>handleTensorCapture(tensors)}
                // onReady={()=>console.log("yes")}
                resizeHeight={640}
                resizeWidth={640}
                resizeDepth={3}
                autorender={true}
                cameraTextureHeight={1920} //480
                cameraTextureWidth={1080} //270
              />,
              model?
              <Pressable
                key={2}
                onPress={() => handleImageCapture()}
                style={({ pressed }) => [
                  {
                    backgroundColor: pressed
                      ? 'grey'
                      : 'white'
                  },
                  styles.captureButton
                ]}>
              </Pressable> : <ActivityIndicator key={3} animating= {true}  style={[styles.captureButton]} size="large" />
              
              // <ActivityIndicator animating= {loading} hidesWhenStopped = {!loading} style={{backgroundColor: "transparent"}} key= {3} size="large" />
            ]
          }
        
       
      </View>
    );
  };





//css themes for UI
const styles = StyleSheet.create({
  container: {
    // flex: 1,
    width: '100%',
    height: '100%',
  },

  switch:{
    position: "absolute",
    left: Dimensions.get('screen').width - 70,
    zIndex: 100,
    top: 50,
  },
  switchText:{
    position: "absolute",
    left: Dimensions.get('screen').width - 80,
    zIndex: 100,
    top: 85,
    color: "white",
  },
  camera: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-between",
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
  captureButton: {
    position: 'absolute',
    left: Dimensions.get('screen').width / 2 - 45,
    bottom: 40,
    width: 75,
    zIndex: 75,
    height: 75,
    borderRadius: 75,
  
    
  },
  modal: {
    flex: 1,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)'
    
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
  }
 
});

export default CameraScreen;
