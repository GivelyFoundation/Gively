// screens/HomeScreen.js

import React from 'react';
import { View, Text, Button } from 'react-native';


export default function HomeScreen({ navigation }) {

  const handleLogout = () => {
    navigation.navigate('Login');
  };
  return (
    <View>
      <Text>Welcome to the Home Screen!</Text>
      <Button title="Logout" onPress={handleLogout} /> 
    </View>
  );
}
