import React from 'react';
import { View, Text, TextInput, Button, StyleSheet} from 'react-native';
import styles from '../Styles.js/Styles';

export default function HomeFeedScreen({ navigation }) {
      const handleLogout = () => {
        navigation.navigate('Login');
      };
      return (
        <View style={styles.container}>
          <Text>Welcome to the Home Screen!</Text>
          <Button title="Logout" onPress={handleLogout} /> 
        </View>
      );
}