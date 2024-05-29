import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useAuth } from '../services/AuthContext';
import { auth, firestore } from '../services/firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

export default function SignUpForm({ navigation, userData, nextStep, handleChange, accountCreated, setAccountCreated }) {
  const { startSignUp } = useAuth();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

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
      startSignUp();
      setAccountCreated(true);
      nextStep(); // Move to the next step in the account creation process
    } catch (error) {
      Alert.alert('Signup Failed', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign up</Text>
      <View style={styles.inputContainer}>
        <Icon name="email" size={20} color="#A9A9A9" />
        <TextInput
          style={styles.input}
          placeholder="abc@email.com"
          value={userData.email}
          onChangeText={(value) => handleChange('email', value)}
          textContentType="emailAddress"
        />
      </View>
      <View style={styles.inputContainer}>
        <Icon name="lock" size={20} color="#A9A9A9" />
        <TextInput
          style={styles.input}
          placeholder="Your password"
          value={userData.password}
          onChangeText={(value) => handleChange('password', value)}
          secureTextEntry={!passwordVisible}
          textContentType="password"
        />
        <Pressable onPress={() => setPasswordVisible(!passwordVisible)}>
          <Icon name={passwordVisible ? "visibility-off" : "visibility"} size={20} color="#A9A9A9" />
        </Pressable>
      </View>
      <View style={styles.inputContainer}>
        <Icon name="lock" size={20} color="#A9A9A9" />
        <TextInput
          style={styles.input}
          placeholder="Confirm password"
          value={userData.confirmPassword}
          onChangeText={(value) => handleChange('confirmPassword', value)}
          secureTextEntry={!confirmPasswordVisible}
          textContentType="password"
        />
        <Pressable onPress={() => setConfirmPasswordVisible(!confirmPasswordVisible)}>
          <Icon name={confirmPasswordVisible ? "visibility-off" : "visibility"} size={20} color="#A9A9A9" />
        </Pressable>
      </View>
      <Pressable style={styles.signUpButton} onPress={handleSignUp}>
        <Text style={styles.signUpButtonText}>SIGN UP</Text>
      </Pressable>
      <View style={styles.socialLoginContainer}>
        <Pressable style={styles.socialButton}>
          <FontAwesome name="google" size={20} color="#DB4437" />
          <Text style={styles.socialButtonText}>Sign up with Google</Text>
        </Pressable>
        <Pressable style={styles.socialButton}>
          <FontAwesome name="facebook" size={20} color="#4267B2" />
          <Text style={styles.socialButtonText}>Sign up with Facebook</Text>
        </Pressable>
      </View>
      <Pressable onPress={() => navigation.navigate('Login')}>
        <Text style={styles.signInText}>
          ALREADY HAVE AN ACCOUNT? <Text style={styles.signInLink}>SIGN IN</Text>
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-evenly',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 30,
    paddingVertical: 40,
  },
  title: {
    fontSize: 28,
    color: '#000',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 10,
    backgroundColor: '#F8F8F8',
  },
  input: {
    flex: 1,
    marginLeft: 10,
  },
  signUpButton: {
    width: '100%',
    paddingVertical: 20,
    borderRadius: 12,
    backgroundColor: '#3FC032',
    alignItems: 'center',
    marginBottom: 20,
  },
  signUpButtonText: {
    color: 'white',
    fontSize: 16,
  },
  socialLoginContainer: {
    width: '100%',
    alignItems: 'center',
  },
  socialButton: {
    width: '70%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    marginBottom: 10,
  },
  socialButtonText: {
    fontSize: 16,
    marginLeft: 10,
  },
  signInText: {
    color: '#A9A9A9',
  },
  signInLink: {
    color: '#1C5AA3',
  },
});
