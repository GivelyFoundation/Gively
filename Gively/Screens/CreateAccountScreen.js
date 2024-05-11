import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ImageBackground } from 'react-native';
import { auth } from '../services/firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';

export default function CreateAccountScreen({ navigation }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignUp = async () => {
    if (!email || !password || !fullName) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      // Handle navigation or state updates post sign-up
    } catch (error) {
      Alert.alert('Signup Failed', error.message);
    }
  };

  return (
    <ImageBackground source={require('../assets/Images/auth-background.png')} resizeMode="cover" className="flex-1">
      <View className="flex-1 justify-center p-4 bg-opacity-50 bg-black">
        <Text className="text-white text-2xl font-bold mb-2">Create Account</Text>
        <TextInput className="bg-white bg-opacity-90 rounded-full px-4 py-2 mb-4 text-lg" placeholder="Full Name" value={fullName} onChangeText={setFullName} />
        <TextInput className="bg-white bg-opacity-90 rounded-full px-4 py-2 mb-4 text-lg" placeholder="Email" value={email} onChangeText={setEmail} />
        <TextInput className="bg-white bg-opacity-90 rounded-full px-4 py-2 mb-4 text-lg" placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
        <Pressable className="bg-green-500 w-full py-3 rounded-full items-center mb-4" onPress={() => handleSignUp}>
          <Text className="text-white text-lg">Sign Up</Text>
        </Pressable>
        <Pressable className="bg-transparent w-full py-3 rounded-full border border-white items-center" onPress={() => navigation.navigate('Splash')}>
          <Text className="text-white text-lg">Back</Text>
        </Pressable>
      </View>
    </ImageBackground>
  );
}
