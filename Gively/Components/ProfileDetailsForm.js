import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, ImageBackground, Image, StyleSheet, Alert } from 'react-native';
import { auth } from '../services/firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDocs, query, where, collection } from 'firebase/firestore';
import { useAuth } from '../services/AuthContext';

export default function ProfileDetailsForm({ userData, handleChange, nextStep }) {


  

  return (
    <View className="flex-2">
        <View className="flex-1 bg-white rounded-t-3xl px-6 items-center justify-center" style={styles.loginForm}>
        <TextInput
          className="bg-gray-200 w-full rounded-full px-4 py-2 mb-4 mt-8"
          placeholder="Username"
          // value={}
          // onChangeText={(value) => }
        />
        <TextInput
          className="bg-gray-200 w-full rounded-full px-4 py-2 mb-4"
          placeholder="Display Name"
          // value={userData.password}
          // onChangeText={(value) => handleChange('password', value)}
          // secureTextEntry
        />
        <TextInput
          className="bg-gray-200 w-full rounded-full px-4 py-2 mb-8"
          placeholder="Bio"
          // value={userData.confirmPassword}
          // onChangeText={(value) => handleChange('confirmPassword', value)}
          // secureTextEntry
        />
        {/* <Pressable className="bg-green-500 w-full py-3 rounded-full items-center mb-4" onPress={handleSignUp}> */}
        <Pressable className="bg-green-500 w-full py-3 rounded-full items-center mb-4" >
          <Text className="text-white text-lg">Add Profile Details</Text>
        </Pressable>
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
    // backgroundColor: 'rgba(0, 0, 0, 0.5)', // Adding background to enhance visibility
    padding: 8, // Slight padding around the text
    borderRadius: 10, // Rounded corners for the button
  },
  loginForm: {
    marginTop: '40%',
    minHeight: '70%',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 30, // Increased padding at the top for better spacing
    paddingBottom: 30, // Increased padding at the bottom
  }
});
