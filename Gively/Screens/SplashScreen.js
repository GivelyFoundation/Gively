import React from 'react';
import { View, Button } from 'react-native';
import styles from '../Styles.js/Styles';

export default function SplashScreen({ navigation }) {
  const handleLogin = () => {
    navigation.navigate('Login');
  };
  const handleCreateAccount = () => {
    navigation.navigate('CreateAccount');
  };
  return (
    <View style={styles.container}>
      <Button title="Login" onPress={handleLogin} />
      <Button title="CreateAccount" onPress={handleCreateAccount} />
    </View>
  );

}
