import { StyleSheet, Text, View, ScrollView, TouchableWithoutFeedback, Pressable } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { ListItem, Avatar } from "@rneui/themed";
import { Divider } from "@react-native-material/core";
import React, { useState, useEffect, useContext } from "react";
import InformationModal from '../../components/Information';
import SettingsModal from '../../components/SettingsPop';
// for theming page: react useContext and below
import themeContext from '../../config/themeContext';
import Feather from 'react-native-vector-icons/Feather'; // Icon from https://github.com/oblador/react-native-vector-icons

import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

function HistoryScreen({route, navigation}){
  // theme
  const theme = useContext(themeContext);
  const legos = route.params.item;
  const [results, setResults] = useState([]);
  const [history, setHistory] = useState([]);

  // set up results
  useEffect(() => {
    if(history.length > 0){
      var partIDs = history.split(' ');
      var sortedLegoHist = partIDs.map(x => legos.find(item => item.PartID === x));
      setResults(sortedLegoHist);
    }
    else{
      setResults([]);
    }
  }, [history]);

  useFocusEffect(
  React.useCallback(() => {
      AsyncStorage.getItem('LegoHistory').then(
          response => {
              if(response === null){ // if there is no history on the device
                  setHistory([]);
          }
          else{ // if there is history on the device
              setHistory(response);
          }
      });
      return() => {

      };
    }, [legos, history])
);

 return(
    <View style={{backgroundColor: theme.background}}>
    
    
    {/* <Text style={{fontSize:20,position:'absolute',left:-5,bottom:-3,textAlign:'center'}}>Menu</Text> */}
    
    <InformationModal></InformationModal>
    <SettingsModal></SettingsModal>
     
      <ScrollView style={{position:'relative', marginBottom:90, backgroundColor: theme.background}}>

      <Text style={{...styles.text, left:20,fontWeight:'bold', fontSize:30, color: theme.color}}>History</Text>
      <Divider style={{ marginTop: 10,marginLeft:20,marginRight:20,}}/>
      {/* iterate over the json file and print one by one */}
      
      {results.map(item => (
          <ListItem key = {item.PartID} onPress={() => navigation.navigate('Lego',{ item:item})} containerStyle={{backgroundColor: theme.theme == "dark" ? "#000000" : theme.background}} bottomDivider>
          <Avatar size={70} source={{ uri: item.ImageURL }} /> 
          <ListItem.Content>
            <ListItem.Title style={{color: theme.color}}>{item.PartName}</ListItem.Title>
            <ListItem.Subtitle style={{color: theme.color}}>{'Category: ' + item.Category}</ListItem.Subtitle>
            </ListItem.Content> 
          </ListItem>
      ))}

      </ScrollView>
      <StatusBar style="auto" />
      </View>
    );
}

const styles = StyleSheet.create({
  text:{
    position:'relative',
    left:20, 
    marginBottom:10, 
    fontSize:15,
  }
});

export default HistoryScreen