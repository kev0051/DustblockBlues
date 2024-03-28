import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';
import {bundleResourceIO, decodeJpeg} from '@tensorflow/tfjs-react-native';

import {Base64Binary} from '../utils/utils';
const BITMAP_DIMENSION = 224;

//const modelJson = require('../model/model.json');
//const modelWeights = require('../model/weights.bin');

// Load the model from a URL instead
const loadModel = async () => {
  const model = await tf.loadGraphModel((bundleResourceIO(modelJson, [modelWeights1, modelWeights2, modelWeights3, modelWeights4])));
  return model;
};
// 0: channel from JPEG-encoded image
// 1: gray scale
// 3: RGB image
const TENSORFLOW_CHANNEL = 3;
export const getModel = loadModel
/*
export const getModel = async () => {
  try {
    // wait until tensorflow is ready
    await tf.ready();
    // load the trained model
    return await tf.loadLayersModel(bundleResourceIO(modelJson, modelWeights));
  } catch (error) {
    console.log('Could not load model', error);
  }
};
*/
export const convertBase64ToTensor = async (base64) => {
  try {
    const uIntArray = Base64Binary.decode(base64);
    // decode a JPEG-encoded image to a 3D Tensor of dtype
    const decodedImage = decodeJpeg(uIntArray, 3);
    // reshape Tensor into a 4D array
    return decodedImage.reshape([
      1,
      BITMAP_DIMENSION,
      BITMAP_DIMENSION,
      TENSORFLOW_CHANNEL,
    ]);
  } catch (error) {
    console.log('Could not convert base64 string to tesor', error);
  }
};

export const startPrediction = async (model, tensor) => {
  try {
    // predict against the model
    const output = await model.predict(tensor);
    // return typed array
    return output.dataSync();
  } catch (error) {
    console.log('Error predicting from tesor image', error);
  }
};
