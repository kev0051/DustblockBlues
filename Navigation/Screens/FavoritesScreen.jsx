import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { ListItem, Avatar } from '@rneui/themed';
import { Divider } from '@react-native-material/core';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import themeContext from '../../config/themeContext';

function FavoritesScreen({ route, navigation }) {
  const theme = useContext(themeContext);
  const legos = route.params.item;
  const [results, setResults] = useState([]);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    if (favorites.length > 0) {
      var partIDs = favorites.split(' ');
      var sortedLegoFavorites = partIDs.map((x) => legos.find((item) => item.PartID === x));
      setResults(sortedLegoFavorites);
    } else {
      setResults([]);
    }
  }, [favorites, legos]);

  useFocusEffect(
    React.useCallback(() => {
      AsyncStorage.getItem('LegoFavorites').then((response) => {
        if (response === null) {
          setFavorites([]);
        } else {
          setFavorites(response);
        }
      });
      return () => {};
    }, [legos, favorites])
  );

  return (
    <View style={{ backgroundColor: theme.background }}>
      <ScrollView style={{ position: 'relative', marginBottom: 90, backgroundColor: theme.background }}>
        <Text style={{ ...styles.text, left: 20, fontWeight: 'bold', fontSize: 30, color: theme.color }}>Favorites</Text>
        <Divider style={{ marginTop: 10, marginLeft: 20, marginRight: 20 }} />

        {results.map((item) => (
          <ListItem key={item.PartID} onPress={() => navigation.navigate('Lego', { item: item })} containerStyle={{ backgroundColor: theme.theme == 'dark' ? '#000000' : theme.background }} bottomDivider>
            <Avatar size={70} source={{ uri: item.ImageURL }} />
            <ListItem.Content>
              <ListItem.Title style={{ color: theme.color }}>{item.PartName}</ListItem.Title>
              <ListItem.Subtitle style={{ color: theme.color }}>{'Category: ' + item.Category}</ListItem.Subtitle>
            </ListItem.Content>
          </ListItem>
        ))}
      </ScrollView>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  text: {
    position: 'relative',
    left: 20,
    marginBottom: 10,
    fontSize: 15,
  },
});

export default FavoritesScreen;