// screens/HomeScreen.js

import React from 'react';
import { View, Text, Button } from 'react-native';
// import firebase from 'firebase';

export default function HomeScreen({ navigation }) {
//   const handleLogout = () => {
//     firebase.auth().signOut()
//       .then(() => {
//         navigation.navigate('Login');
//       })
//       .catch(error => {
//         console.log(error);
//       });
//   };

  return (
    <View>
      <Text>Welcome to the Home Screen!</Text>
      {/* <Button title="Logout" onPress={handleLogout} /> */}
    </View>
  );
}
