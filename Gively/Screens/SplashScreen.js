import React from 'react';
import { View, Button } from 'react-native';


export default function SplashScreen({ navigation }) {
  const handleLogin = () => {
    navigation.navigate('Login');
  };
  const handleCreateAccount = () => {
    navigation.navigate('CreateAccount');
  };
  return (
    <View>
      <Button title="Login" onPress={handleLogin} />
      <Button title="CreateAccount" onPress={handleCreateAccount} />
    </View>
  );

}
