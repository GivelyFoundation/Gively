import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity } from 'react-native';

const charityLogo = require('../assets/Images/TSA.png');


const DiscoverCharityCard = ({navigation, image}) => {
  return (
    
    <TouchableOpacity style={styles.card}  onPress={() => navigation.navigate('CharityDetailedScreen')}>
      <Image
        source={charityLogo}
        style={styles.image}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 75,
    height: 75,
    backgroundColor: '#fff', // You can customize the background color
    borderColor: '#E4DFDF',
    borderWidth: 1,
    borderRadius: 10, // You can adjust the border radius as needed
    alignItems: 'center',
    justifyContent: 'center',
    margin: 10
  },
  image: {
    width: '80%', // Adjust the width of the image within the card
    height: '80%', // Adjust the height of the image within the card
    resizeMode: 'cover', // You can change the resizeMode as per your requirement
    borderRadius: 10, // Match the border radius of the card
  },
});

export default DiscoverCharityCard ;
