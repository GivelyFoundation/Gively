import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ImageBackground } from 'react-native';
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
    <ImageBackground source={require('../assets/Images/auth-background.png')} resizeMode="cover" className="flex-1">
      <View className="flex-1 justify-center p-4 bg-opacity-50 bg-black">
        <Text className="text-white text-2xl font-bold mb-2">Sign In</Text>
        <TextInput className="bg-white bg-opacity-90 rounded-full px-4 py-2 mb-4 text-lg" placeholder="Email" value={email} onChangeText={setEmail} />
        <TextInput className="bg-white bg-opacity-90 rounded-full px-4 py-2 mb-4 text-lg" placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
        <Pressable className="bg-green-500 w-full py-3 rounded-full items-center mb-4" onPress={() => {/* Handle login */}}>
          <Text className="text-white text-lg">Login</Text>
        </Pressable>
        <Pressable className="bg-transparent w-full py-3 rounded-full border border-white items-center" onPress={() => navigation.goBack()}>
          <Text className="text-white text-lg">Back</Text>
        </Pressable>
      </View>
    </ImageBackground>
  );
};
