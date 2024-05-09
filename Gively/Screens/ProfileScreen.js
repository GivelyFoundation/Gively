
import React from 'react';
import { View, Text, StyleSheet, Button, Image, TouchableOpacity } from 'react-native';
import { useFonts } from 'expo-font';

const profilePicture = require('../assets/Images/profileDefault.png');

export default function ProfileScreen({ navigation }) {
  let [fontsLoaded] = useFonts({
    'Montserrat-Regular': require('../assets/Fonts/Montserrat/static/Montserrat-Regular.ttf'),
    'Montserrat-Medium': require('../assets/Fonts/Montserrat/static/Montserrat-Medium.ttf'),
    'Montserrat-Bold': require('../assets/Fonts/Montserrat/static/Montserrat-Bold.ttf'),
  });


  return (
    <View>

      <View style={[profileStyles.header]}>

        <Text style={[profileStyles.headerText, { fontFamily: 'Montserrat-Medium' }]}>Profile</Text>


        <TouchableOpacity>

          <Text style={[profileStyles.editProfile, profileStyles.buttonText, { fontFamily: 'Montserrat-Medium' }]}>Edit Profile </Text>
        
        </TouchableOpacity>
        
      </View>

      <View style={[profileStyles.row, profileStyles.profileInfo]}>

        <Image source={profilePicture} style={profileStyles.profilePicture} />

        <View style={[profileStyles.column]}>

          <Text style={[profileStyles.userNameText, { fontFamily: 'Montserrat-Medium' }]}> Andy Abebaw</Text>

          <View style={[profileStyles.followRow]}>

            <View style={[profileStyles.column]}>

              <TouchableOpacity>

                <Text style={[profileStyles.followText, profileStyles.buttonText, { fontFamily: 'Montserrat-Medium' }]}>43 </Text>

              </TouchableOpacity>


              <Text style={[profileStyles.followText, { fontFamily: 'Montserrat-Medium' }]}>Followers</Text>

            </View>

            <View style={profileStyles.verticalLine} />

            <View style={[profileStyles.column]}>

              <TouchableOpacity>

                <Text style={[profileStyles.followText, profileStyles.buttonText, { fontFamily: 'Montserrat-Medium' }]}>43 </Text>

              </TouchableOpacity>

              <Text style={[profileStyles.followText, { fontFamily: 'Montserrat-Medium' }]}>Following</Text>

            </View>

          </View>

        </View>

        <View style={[profileStyles.row]}>

        </View>

      </View>

      <Text style={[profileStyles.bioHeader, { fontFamily: 'Montserrat-Medium' }]}> Dog Lover, Engineer, Human </Text>

      <Text style={[profileStyles.bioMainText, { fontFamily: 'Montserrat-Medium' }]}>"If you can't feed a hundred people, then
        just feed one".</Text>

      <View style={profileStyles.horizontalLine} />

    </View>
  );
}

const profileStyles = StyleSheet.create({
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
    paddingTop: 30,
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
    backgroundColor: '#cccccc', // Line color
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
  buttonText: {
    color: '#1C5AA3',
   fontFamily:''
  },
  bioHeader: {
    fontSize: 15,
    padding: 30,
    paddingBottom: 10,
    textTransform: 'uppercase',
    color: '#1E1E1E'
  },
  bioMainText: {
    fontSize: 16,
    paddingHorizontal: 30,
    lineHeight: 25,
    color: '#747688'
  }
});
