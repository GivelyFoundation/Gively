
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet} from 'react-native';
import styles from '../Styles.js/Styles';
import { CommonActions } from '@react-navigation/native';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const handleLogin = () => {
   // After login success
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [
          { name: 'Home' },  // 'Home' is the name of the screen you want to navigate to
        ],
      })
    );
  };
  const handleBack = () => {
    navigation.navigate('Splash');
  };
  
  return (
    <View style={styles.container} >
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        onChangeText={setEmail}
        value={email}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        onChangeText={setPassword}
        value={password}
        secureTextEntry
      />
      <Button title="Login" onPress={handleLogin} />
      <Button title="Back" onPress={handleBack} />
    </View>
  );
};