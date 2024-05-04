import React from 'react';
import { View, Text, TextInput, Button, StyleSheet} from 'react-native';

export default function HomeFeedScreen({ navigation }) {
    const goToTest = () => {
        navigation.navigate('Test');
      };
      const handleLogout = () => {
        navigation.navigate('Login');
      };
      return (
        <View>
          <Text>Welcome to the Home Screen!</Text>
          <Button title="Logout" onPress={handleLogout} /> 
          <Button title="Test" onPress={goToTest} /> 
        </View>
      );
}