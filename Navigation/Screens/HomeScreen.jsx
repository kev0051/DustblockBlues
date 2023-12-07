import { StyleSheet, Text, View, ScrollView, TouchableWithoutFeedback, Pressable, Button } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SearchBar, ListItem, Avatar } from "@rneui/themed";
import { Divider } from "@react-native-material/core";
import React, { useState, useEffect, useContext } from "react";
import InformationModal from '../../components/Information';
import SettingsModal from '../../components/SettingsPop';
// for theming page: react useContext and below
import themeContext from '../../config/themeContext';
import Feather from 'react-native-vector-icons/Feather'; // Icon from https://github.com/oblador/react-native-vector-icons
import AsyncStorage from '@react-native-async-storage/async-storage';



function HomeScreen({navigation}){
  // theme
  const theme = useContext(themeContext);
  const [legos, setLegos] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  //array to hold json lego db
  //const legos = require('../../assets/database.json')
  //search term that is typed in the search bar
  //const [searchTerm, setSearchTerm] = useState("")
/*
  useEffect(() => {
    fetch('https://raw.githubusercontent.com/ReedNathan001/DBBDatabase/main/database.json')
      .then(response => response.json())
      .then(data => setLegos(data))
      .catch(error => console.error(error));
  }, []);
  */
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
  //updates searching if letters are typed in the search bar
  const updateSearch = (searchTerm) => {
    setSearchTerm(searchTerm)
  };

  //function that searches and filters the array based on search request
  let results = legos.filter(function(lego) {
    //if user types in spaces
    if (searchTerm.trim().length == 0){
      return legos
    }
      
    //searching based on part name
    let partName = lego.PartName.toLowerCase().indexOf(searchTerm.trim().toLowerCase()) > -1
    //searching based on partID
    let partID = lego.PartID.toLowerCase().indexOf(searchTerm.trim().toLowerCase()) > -1
    //searching based on color
    let color = lego.Colour.toLowerCase().indexOf(searchTerm.trim().toLowerCase()) > -1
    
    //return concatenated results
    return partName+partID+color;
  });

 return(
    <View style={{backgroundColor: theme.background}}>
    
    
    {/* <Text style={{fontSize:20,position:'absolute',left:-5,bottom:-3,textAlign:'center'}}>Menu</Text> */}
    
    <InformationModal></InformationModal>
    <SettingsModal></SettingsModal>
     
      <ScrollView style={{position:'relative', marginBottom:90, backgroundColor: theme.background}}>

      <Text style={{...styles.text, left:20,fontWeight:'bold', fontSize:30, color: theme.color}}>Lego Pieces 
      <View style={{...styles.text, right:30}}>
      <Button onPress={() => navigation.navigate('History',{item:legos})} title="View History"/>
      </View>
      </Text>
      <Text style={{...styles.text, color: theme.color}}>Please select the piece you would like to identify</Text>
      <SearchBar onChangeText={updateSearch} value={searchTerm} placeholder="Search" platform="ios" containerStyle={{position:'relative',margin:16, backgroundColor: theme.background}}/>
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

export default HomeScreen