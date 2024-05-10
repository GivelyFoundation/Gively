import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import styles from '../Styles.js/Styles';
import { CommonActions } from '@react-navigation/native';
import { auth } from '../services/firebaseConfig'; // Import auth from your Firebase config
import { signInWithEmailAndPassword } from 'firebase/auth'; // Import the method directly from Firebase auth

export default function LoginScreen({ navigation }){
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // Attempt to sign in with email and password using Firebase Auth
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in successfully, navigate to the Home screen
        console.log("User logged in:", userCredential.user);
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Home' }],
          })
        );
      })
      .catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;
        // Show error message if login fails
        Alert.alert("Login Failed", errorMessage);
      });
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
