import { StyleSheet,Modal, Text, View, ScrollView,Image, Pressable, Touchable, TouchableOpacity } from 'react-native';
import React, { useState, useContext, useRef } from 'react';
import { Divider} from 'react-native-paper';
// import GestureRecognizer, {swipeDirections} from 'react-native-swipe-gestures';

// for theming page: react useContext and below
import themeContext from '../../config/themeContext';
import * as Speech from 'expo-speech';
import ttsContext from '../../config/ttsContext';

// for history
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

function LegoPartScreen({ route, navigation}){
    //params passed from homepage
    const partId = route.params.item.PartID;
    const legoName = route.params.item.PartName;
    const legoSet = route.params.item.SetNumber;
    const legoColor = route.params.item.Colour;
    const legoQuantity = route.params.item.Quantity;
    const imageURL = route.params.item.ImageURL;
    // const legoSetCount = route.params.item.SetCount;
    const legoCategory = route.params.item.Category;
   
    //variable to toggle full screen image
    const [showModal, setShowModal] = useState(false)
    const [isInFavorites, setIsInFavorites] = useState(false);

    // theme
    const theme = useContext(themeContext);
    const tts = useContext(ttsContext);
    //Text-to-Speech Functions
    const speakLegoNameAndID = () => {
        const textToSay = 'LEGO piece' + legoName + ',' + 'LEGO ID' + partId;
        if (tts.ttsChoice == "true") {
            Speech.speak(textToSay);
        }
    };
    const speakSet = () => {
        const textToSay = 'Set Number' + legoSet;
        if (tts.ttsChoice == "true") {
            Speech.speak(textToSay);
        }
    };
    const speakColor = () => {
        const textToSay = 'Color' + legoColor;
        if (tts.ttsChoice == "true") {
            Speech.speak(textToSay);
        }
    };
    const speakQuantity = () => {
        const textToSay = 'Quantity' + legoQuantity;
        if (tts.ttsChoice == "true") {
            Speech.speak(textToSay);
        }
    };
    const speakCategory = () => {
        const textToSay = 'Category' + legoCategory;
        if (tts.ttsChoice == "true") {
            Speech.speak(textToSay);
        }
    };
    
    const checkIfInFavorites = async () => {
      try {
        const favoritesString = await AsyncStorage.getItem('LegoFavorites');
        const favorites = favoritesString ? favoritesString.split(' ') : [];
        
        setIsInFavorites(favorites.includes(partId));
      } catch (error) {
        console.error('Error checking if part is in favorites:', error);
      }
    };
    
    const toggleFavorites = async () => {
      try {
        const favoritesString = await AsyncStorage.getItem('LegoFavorites');
        let favorites = favoritesString ? favoritesString.split(' ') : [];
        
        if (isInFavorites) {
          // Remove part from favorites
          favorites = favorites.filter((item) => item !== partId);
          setIsInFavorites(false);
        } else {
          // Add part to favorites
          favorites.push(partId);
          setIsInFavorites(true);
        }
        
        // Update AsyncStorage with the new favorites list
        await AsyncStorage.setItem('LegoFavorites', favorites.join(' '));
      } catch (error) {
        console.error('Error toggling favorites:', error);
      }
    };
  
    storeData = async (newValue) => {
        await AsyncStorage.setItem('LegoHistory', newValue);
    };
  
  
    useFocusEffect(
        React.useCallback(() => {
          checkIfInFavorites();
            return () => {
                // fuction to update history
                AsyncStorage.getItem('LegoHistory').then(
                    response => {
                        if(response === null){ // if there is no history on the device
                            let output = partId;
                            //console.log(output);
                            storeData(output);
                            
                        }
                        else{ // if there is history on the device
                        let results = response.split(" ");
                            let output = partId; // first term as part Id
                            results.forEach(item =>{
                                if(item != partId){
                                    output = output.concat(" ", item); // add all other part Id's not including the current one
                                }
                            });
                            //console.log(output);
                            storeData(output);
                    }
                }
                );
            };
        }, [partId])
    );

    //page html
    return(
        
        <View style={{...styles.container, backgroundColor: theme.theme == "dark" ? "#000000" : theme.background}}>
            {/* modal not present until photo is clicked */}
            <Modal 
                    animationType="slide"
                    transparent={false}
                    visible={showModal}
                    onRequestClose={() => {
                    alert("Modal has been closed.");
                    setModalVisible(!showModal);
                    }}
            > 
                <View style={{ backgroundColor: "black"}}>
                    <Pressable
                    
                        style={[styles.button, styles.buttonClose]}
                        onTouchStart={() => setShowModal(!showModal)}
                    >
                    <Image
                        style={{ width: '100%', height: "100%", resizeMode: 'contain' }}
                        source={{ uri: imageURL }}
                    />
                    </Pressable>
                </View>
            </Modal>
            
            
            <Pressable onPress={() => navigation.goBack()} name="left" style={{...styles.backButton, backgroundColor: theme.theme == "dark" ? "#000000" : theme.background}} size="30"> 
                <Text style={{fontSize: 25, color:"#ff0000", left: 5 }}> {'<'} Home</Text>
            </Pressable>

            <View style={styles.partContainer}>
                <Text style={{...styles.title}}onPress={speakLegoNameAndID}>{legoName} #{partId}</Text>
                
                <TouchableOpacity onPress = {() => setShowModal(true)}>
                    <Image style={styles.image}
                        source={{
                        uri: imageURL,
                        }}
                    />
                </TouchableOpacity>

                
            </View>
            
            <ScrollView style={{padding: 15}}>
                <Text style={{...styles.infoText, color: theme.color}} onPress={speakSet}>{'Set #: ' + legoSet} </Text>
                <Divider style={{height: 1.5}}/>
                <Text style={{...styles.infoText, color: theme.color}}onPress={speakColor}>{'Color: ' + legoColor}</Text>
                <Divider style={{height: 1.5}}/>
                <Text style={{...styles.infoText, color: theme.color}}onPress={speakQuantity}>{'Quantity: ' + legoQuantity}</Text>
                <Divider style={{height: 1.5}}/>
                <Text style={{...styles.infoText, color: theme.color}}onPress={speakCategory}>{'Category: ' + legoCategory}</Text>
            </ScrollView>

            <Pressable style={[styles.locateButton, {marginTop:50}]} onPress={()=>navigation.navigate('Locate', { partId: partId})}>
                <Text style={styles.locateText}>Locate</Text>
            </Pressable>
            
            {!isInFavorites ? (
              <Pressable style={[styles.addToFavoritesButton, { marginTop: 50 }]} onPress={toggleFavorites}>
              <Text style={styles.addToFavoritesButtonText}>Favorite</Text>
              </Pressable>
            ) : (
              <Pressable style={[styles.addToFavoritesButton, { marginTop: 50, backgroundColor: 'red' }]} onPress={toggleFavorites}>
              <Text style={styles.addToFavoritesButtonText}>Unfavorite</Text>
              </Pressable>
            )}

        </View>
    )
}

//page styling
const styles = StyleSheet.create({
  
    addToFavoritesButton: {
      position: "absolute",
      top:"85%",
      right: "3%",
      alignItems: 'center',
      justifyContent: 'center',
      width: '44%', // Adjust the width as needed
      height: 40, // Adjust the height as needed
      borderRadius: 20, // Adjust the border radius as needed
      backgroundColor: '#ff0000',
      alignSelf: 'center',
    },
    
    addToFavoritesButtonText: {
      fontSize: 22,
      fontWeight: 'bold',
      color: 'white',
    },

    locateButton: {
        position: "absolute",
        top:"85%",
        left: "3%",
        alignItems: 'center',
        justifyContent: 'center',
        width: "44%",
        height: 40,
        borderRadius: 20,
        backgroundColor: "#ff0000",
    },
    locateText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: 'white',
    },
    
    infoText:{
        fontSize: 22,
        padding: 15,
        fontWeight: "bold"
    },
    image:{
        top: "3%",
        left: "5%",
        width: '90%',
        height: '75%',
        resizeMode: 'contain',
        objectFit: "contain"
    },
    title:{
        position: "relative",
        top: "5%",
        fontSize: 25,
        padding: 10,
        textAlign: "center",
        fontWeight: "bold"
        
    },
    partContainer:{
        // alignItems: 'center',
        width: "85%",
        height: "37.5%",
        backgroundColor: '#ffffff',
        marginTop: 15,
        marginLeft: "7.5%",
        borderRadius:  50,
        shadowColor: '#000',
        shadowOffset: { width: -1, height: 9 },
        shadowOpacity: .5,
        shadowRadius: 8,  
        
    },
    
    container: {
      flex: 1,
      backgroundColor: '#fff',

    },
    backButton: {
        marginTop:50  
    },

  });

export default LegoPartScreen