import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ImageBackground, Image, StyleSheet } from 'react-native';
import { auth } from '../services/firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDocs, query, where, collection } from 'firebase/firestore';

export default function CreateAccountScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSignUp = async () => {
    if (!email || !password || !username) {
       Alert.alert('Error', 'Please fill all fields');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Please make sure your passwords match');
      return;
    }
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'Home' }], }));
    } catch (error) {
      Alert.alert('Signup Failed', error.message);
    }
  };

  return (
    <View className="flex-1">
      {/* <Text className="text-black text-lg">Sign in with Google</Text>
      <View style={styles.backgroundContainer}>
        <ImageBackground 
          source={require('../assets/Images/auth-background.png')} 
          resizeMode="contain"
          style={styles.backgroundImage}
        >
          <View style={styles.imageOverlay} />
        </ImageBackground>
      </View>

      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'flex-end' }}>
        <Image 
          source={require('../assets/Images/logo-1.png')} 
          style={styles.logo} 
          resizeMode="contain" 
        />

        <Pressable onPress={() => navigation.navigate('Splash')} style={styles.backButton}>
          <Text className="text-white text-lg">Back</Text>
        </Pressable> */}

        <View className="bg-white rounded-t-3xl px-6 items-center justify-center" style={styles.loginForm}>
          <View className="items-center justify-center">
            <Text className="text-2xl font-bold mb-2">Create an Account</Text>
            <Text className="text-lg mb-4">Sign Up and start giving!</Text>
          </View>
          {/* <TextInput className="bg-gray-200 w-full rounded-full px-4 py-2 mb-4" placeholder="Full Name" value={fullName} onChangeText={setFullName} /> */}
          <TextInput className="bg-gray-200 w-full rounded-full px-4 py-2 mb-4" placeholder="Email" value={email} onChangeText={setEmail} />
          <TextInput className="bg-gray-200 w-full rounded-full px-4 py-2 mb-4" placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
          <TextInput className="bg-gray-200 w-full rounded-full px-4 py-2 mb-4" placeholder="Confirm Password" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />
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
      {/* </View> */}
    </View>
  );
};

const styles = StyleSheet.create({
  backgroundContainer: {
    position: 'absolute',
    top: -120,
    left: 0,
    right: 0,
    height: '60%',
  },
  backgroundImage: {
    height: '100%',
    width: '100%',
  },
  imageOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)', // Semi-transparent black to enhance contrast
  },
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
