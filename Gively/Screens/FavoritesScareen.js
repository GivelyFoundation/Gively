

import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { charities} from '../MockData';
import CharityCard from '../Components/CharityCard';

export default function FavoriteScreen () {
    return (
      <View style={[styles.contentContainer, styles.page]} >
        <ScrollView
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[styles.scrollView]} >
          {charities.map((charity, index) => (
            <CharityCard key={index} charity={charity} />
          ))}
        </ScrollView>
      </View>
    );
  };
  
  
const styles = StyleSheet.create({
    header: {
      paddingTop: 70,
      flexDirection: 'row', // Align children horizontally
      alignItems: 'center', // Align children vertically in the center
      width: '100%', // Ensure the row takes full width of the screen
      justifyContent: 'space-between',
      paddingRight: 20
    },
    row: {
      flexDirection: 'row', // Align children horizontally
      alignItems: 'center', // Align children vertically in the center
    },
    followRow: {
      flexDirection: 'row', // Align children horizontally
      margin: 10,
      alignItems: 'center',
    },
    column: {
      flexDirection: 'column', // Align children horizontally
      alignItems: 'center', // Align children vertically in the center,
    },
    followColumn: {
      flexDirection: 'column', // Align children horizontally
      alignItems: 'center', // Align children vertically in the center,
      marginRight: 80
    },
    userNameText: {
      fontSize: 24,
    },
    followText: {
      fontSize: 16,
      color: '#747688'
    },
    profileInfo: {
      width: '100%',
      paddingTop: 20,
      paddingLeft: 30,
      paddingRight: 30,
      justifyContent: 'space-between'
    },
    headerText: {
      paddingLeft: 30,
      fontSize: 24
    },
    editProfile: {
      fontSize: 16
    },
    verticalLine: {
      height: '70%', // Adjust height to control the line's length relative to the row height
      alignContent: 'center',
      width: 1, // The thickness of the line
      backgroundColor: '#DDDDDD', // Line color
      marginHorizontal: 20, // Space around the line
    },
    horizontalLine: {
      height: 1, // Line thickness
      backgroundColor: '#cccccc', // Line color, light grey
      marginTop: 20,
      marginBottom: 5,
      marginHorizontal: 30,
    },
    profilePicture: {
      width: 100, // Set the width as needed
      height: 100, // Set the height as needed
    },
    pieChartPlaceHolder:{
      width: 150, // Set the width as needed
      height: 150, // Set the height as needed
      alignItems: 'center', // Center items horizontally
      alignSelf: 'center',
    },
    buttonText: {
      color: '#1C5AA3',
      fontFamily: ''
    },
    bioHeader: {
      fontSize: 15,
      padding: 30,
      paddingVertical:10,
      paddingBottom: 10,
      textTransform: 'uppercase',
      color: '#1E1E1E'
    },
    bioMainText: {
      fontSize: 16,
      paddingHorizontal: 30,
      lineHeight: 25,
      color: '#747688'
    },
    interestContainer: {
      alignItems: 'center',
      padding: 10,
      paddingBottom:14,
      paddingHorizontal: 30
    },
    interestButton: {
      borderRadius: 20,
      paddingVertical: 5,
      paddingHorizontal: 20,
      marginRight: 10,
      backgroundColor: 'rgba(28, 90, 163, 0.1)',
    },
    interestButtonText: {
      color: '#1C5AA3',
      fontSize: 16,
      opacity: .9
    },
    switchStyle: {
      paddingTop: 10,
      paddingHorizontal: 30,
    },
    contentContainer: {
      alignContent: 'center',
      paddingTop: 10,
      backgroundColor: '#fff',
      height: 1000
    },
    scrollView: {
      flexGrow: 1,
      flexDirection: 'columm',
      paddingVertical: 4,
      paddingHorizontal: 30,
    },
    portfolioContainer:{
      alignContent: 'center',
      paddingTop: 20,
      backgroundColor: '#fff',
      height: 1000
    },
    charityCardInfoContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginHorizontal:30,
      marginTop: 10,
    },
    charityName: {
      fontSize: 16,
      fontWeight: 'bold',
    },
    percentage: {
      fontSize: 16,
      fontWeight: '500',
    }
  });
  