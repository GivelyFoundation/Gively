import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, ImageBackground, Image, StyleSheet, Alert } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useAuth } from '../services/AuthContext';
import { auth, firestore } from '../services/firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';

export default function SignUpForm({ navigation, userData, nextStep, handleChange, accountCreated, setAccountCreated }) {
  const { startSignUp, endSignUp } = useAuth();

  useEffect(() => {
    startSignUp();
    return () => {};
  }, []);

  const handleSignUp = async () => {
    if (accountCreated) {
      nextStep();
      return;
    }
    const { email, password, confirmPassword } = userData;
    if (!email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Please make sure your passwords match');
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await setDoc(doc(firestore, "users", user.uid), {
        email: user.email,
        username: '',
        displayName: '',
        bio: '',
        profilePicture: '',
        pinnedCharity: null,
        interests: [],
        following: [],
        followers: []
      });
      setAccountCreated(true);
      nextStep(); // Move to the next step in the account creation process
    } catch (error) {
      Alert.alert('Signup Failed', error.message);
    }
  };

  return (
    <View className="flex-2">
      <View className="flex-1 bg-white rounded-t-3xl px-6 items-center justify-center" style={styles.loginForm}>
        <TextInput
          className="bg-gray-200 w-full rounded-full px-4 py-2 mb-4 mt-8"
          placeholder="Email"
          value={userData.email}
          onChangeText={(value) => handleChange('email', value)}
          textContentType="emailAddress"
        />
        <TextInput
          className="bg-gray-200 w-full rounded-full px-4 py-2 mb-4"
          placeholder="Password"
          value={userData.password}
          onChangeText={(value) => handleChange('password', value)}
          secureTextEntry
          textContentType="password"
        />
        <TextInput
          className="bg-gray-200 w-full rounded-full px-4 py-2 mb-8"
          placeholder="Confirm Password"
          value={userData.confirmPassword}
          onChangeText={(value) => handleChange('confirmPassword', value)}
          secureTextEntry
          textContentType="password"
        />
        <Pressable className="bg-green-500 w-full py-3 rounded-full items-center mb-4" onPress={handleSignUp}>
          <Text className="text-white text-lg">Sign Up</Text>
        </Pressable>
        <Pressable className="bg-blue-600 w-full py-3 rounded-full items-center mb-2">
          <Text className="text-white text-lg">Sign up with Google</Text>
        </Pressable>
        <Pressable className="bg-black w-full py-3 rounded-full items-center mb-2">
          <Text className="text-white text-lg">Sign up with Apple</Text>
        </Pressable>
        <Pressable className="bg-blue-800 w-full py-3 rounded-full items-center mb-4">
          <Text className="text-white text-lg">Sign up with Facebook</Text>
        </Pressable>
        <Text onPress={() => navigation.navigate('Login')} className="text-sm underline">
          Already have an account? Sign In
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  logo: {
    width: 80,
    height: 80,
    position: 'absolute',
    top: 45,
    left: 20,
  },
  backButton: {
    position: 'absolute',
    top: 65,
    right: 20,
    padding: 8,
    borderRadius: 10,
  },
  loginForm: {
    marginTop: '40%',
    minHeight: '70%',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 30,
    paddingBottom: 30,
  },
});
