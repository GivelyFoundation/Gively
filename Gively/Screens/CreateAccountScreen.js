import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import styles from '../Styles.js/Styles';
import { CommonActions } from '@react-navigation/native';
import { auth } from '../services/firebaseConfig'; // Import auth from your Firebase config
import { createUserWithEmailAndPassword } from 'firebase/auth'; // Import the method directly from Firebase auth

export default function CreateAccountScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleBack = () => {
    navigation.navigate('Splash');
  };

  const handleSignUp = () => {
    if (password !== confirmPassword) {
      Alert.alert("Passwords do not match");
      return;
    }
    // Create a new user account using Firebase Auth
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in 
        var user = userCredential.user;
        // Navigate to the Home screen after successful signup
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Home' }],
          })
        );
        console.log("User registered successfully!", user);
      })
      .catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;
        // Display error message
        Alert.alert(errorMessage);
      });
  };

  return (
    <View style={styles.container}>
      <Text>Create Account</Text>
      <TextInput
        placeholder="Email"
        onChangeText={setEmail}
        value={email}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Password"
        onChangeText={setPassword}
        value={password}
        secureTextEntry
      />
      <TextInput
        placeholder="Confirm Password"
        onChangeText={setConfirmPassword}
        value={confirmPassword}
        secureTextEntry
      />
      <Button title="Create Account" onPress={handleSignUp} />
      <Button title="Back" onPress={handleBack} />
    </View>
  );
}
