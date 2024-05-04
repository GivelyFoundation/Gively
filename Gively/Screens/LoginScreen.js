
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet} from 'react-native';
import styles from '../Styles.js/Styles';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const handleLogin = () => {
    navigation.replace('Home');
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