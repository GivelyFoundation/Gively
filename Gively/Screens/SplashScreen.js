import React from 'react';
import { View, Text, Pressable, StyleSheet, Image } from 'react-native';
import { useAuth } from '../services/AuthContext';
import Spinner from '../Components/Spinner';

export default function SplashScreen({ navigation }) {
  const { user, loading } = useAuth()

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
      <Image
        source={require('../assets/Images/logo-2.png')} 
        style={styles.logo} 
        resizeMode="contain"
      />
      <Text style={styles.appName}>Gively</Text>
      </View>

      {user ? (
        <View style={styles.spinnerContainer}>
          <Spinner />
        </View>
      ) : (
        <View style={styles.buttonContainer}>
          <Pressable style={[styles.button, styles.createAccountButton]} onPress={() => navigation.navigate('CreateAccount')}>
            <Text style={styles.createAccountButtonText}>CREATE ACCOUNT</Text>
          </Pressable>
          <Pressable style={[styles.button, styles.signInButton]} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.signInButtonText}>SIGN IN</Text>
          </Pressable>
        </View>
      )}

      {/* <View style={styles.buttonContainer}>
        <Pressable style={[styles.button, styles.createAccountButton]} onPress={() => navigation.navigate('CreateAccount')}>
          <Text style={styles.createAccountButtonText}>CREATE ACCOUNT</Text>
        </Pressable>
        <Pressable style={[styles.button, styles.signInButton]} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.signInButtonText}>SIGN IN</Text>
        </Pressable>
      </View> */}


    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  logoContainer: {
    alignItems: 'center', 
    marginTop: 150,
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: -20,
  },
  appName: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#000',
    // marginBottom: 40,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  button: {
    width: '70%',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  createAccountButton: {
    borderColor: '#3FC032',
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  createAccountButtonText: {
    color: '#3FC032',
    fontSize: 16,
  },
  signInButton: {
    borderColor: '#1C5AA3',
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  signInButtonText: {
    color: '#1C5AA3',
    fontSize: 16,
  },
  spinnerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
