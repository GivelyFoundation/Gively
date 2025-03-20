import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, Image, StyleSheet, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../services/AuthContext';
import Spinner from '../Components/Spinner';
import { getReadableErrorMessage } from '../utilities/firebaseAuthErrorHandler';
import { KeyboardAwareAuthScroll } from '../Components/Auth/KeyboardAuthScroll';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { signIn, user, loading } = useAuth();

  useEffect(() => {
    if (user && !loading) {
      setIsLoggingIn(false);
    }
  }, [user, loading]);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoggingIn(true);
    try {
      await signIn(email, password);
      // Navigation will be handled by the AuthContext listener
    } catch (error) {
      const errorMessage = getReadableErrorMessage(error);
      Alert.alert("Login Failed", errorMessage);
      console.error('Login error:', error.code, error.message);
      setIsLoggingIn(false);
    }
  };

  if (isLoggingIn) {
    return <Spinner />;
  }

  return (
    <KeyboardAwareAuthScroll>
      <Pressable 
        onPress={() => navigation.navigate('Splash')} 
        style={styles.backButton}
        hitSlop={10}
      >
        <Icon name="arrow-back" size={24} color="#000" />
      </Pressable>

      <View style={styles.logoContainer}>
        <Image
          source={require('../assets/Images/logo-2.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.appName}>Gively</Text>
      </View>

      <View style={styles.loginForm}>
        <Text style={styles.title}>Sign in</Text>

        <View style={styles.inputContainer}>
          <Icon name="email" size={20} color="#A9A9A9" />
          <TextInput
            style={styles.input}
            placeholder="abc@email.com"
            value={email}
            onChangeText={setEmail}
            textContentType="emailAddress"
            keyboardType="email-address"
            autoCapitalize="none"
            returnKeyType="next"
          />
        </View>

        <View style={styles.inputContainer}>
          <Icon name="lock" size={20} color="#A9A9A9" />
          <TextInput
            style={styles.input}
            placeholder="Your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!passwordVisible}
            textContentType="password"
            returnKeyType="done"
            onSubmitEditing={handleLogin}
          />
          <Pressable onPress={() => setPasswordVisible(!passwordVisible)} hitSlop={10}>
            <Icon name={passwordVisible ? "visibility-off" : "visibility"} size={20} color="#A9A9A9" />
          </Pressable>
        </View>

        <View style={styles.forgotPasswordContainer}>
          <Pressable 
            onPress={() => Alert.alert('Forgot Password?', 'This functionality is not implemented yet.')}
            hitSlop={10}
          >
            <Text style={styles.forgotPassword}>Forgot Password?</Text>
          </Pressable>
        </View>

        <Pressable style={styles.signInButton} onPress={handleLogin}>
          <Text style={styles.signInButtonText}>SIGN IN</Text>
        </Pressable>
      </View>

      <Text style={styles.orText}>OR</Text>

      <View style={styles.socialLoginContainer}>
        <Pressable style={styles.socialButton}>
          <Image source={require('../assets/Icons/google-icon.png')} style={styles.socialLogo} />
          <Text style={styles.socialButtonText}>Login with Google</Text>
        </Pressable>
        <Pressable style={styles.socialButton}>
          <Image source={require('../assets/Icons/facebook-icon.png')} style={styles.socialLogo} />
          <Text style={styles.socialButtonText}>Login with Facebook</Text>
        </Pressable>
      </View>

      <Pressable 
        onPress={() => navigation.navigate('CreateAccount')}
        style={styles.signUpContainer}
      >
        <Text style={styles.signUpText}>
          DON'T HAVE AN ACCOUNT? <Text style={styles.signUpLink}>SIGN UP</Text>
        </Text>
      </Pressable>
    </KeyboardAwareAuthScroll>
  );
}

const styles = StyleSheet.create({
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 10,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: -20,
  },
  appName: {
    fontSize: 32,
    fontFamily: 'Montserrat-Bold',
    color: '#000',
  },
  loginForm: {
    width: '100%',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    color: '#000',
    marginBottom: 20,
    fontFamily: 'Montserrat-Medium',
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
    marginBottom: 15,
    backgroundColor: '#F8F8F8',
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    fontFamily: 'Montserrat-Regular',
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  forgotPassword: {
    color: '#1C5AA3',
    fontFamily: 'Montserrat-Medium',
  },
  signInButton: {
    width: '100%',
    paddingVertical: 20,
    borderRadius: 12,
    backgroundColor: '#3FC032',
    alignItems: 'center',
  },
  signInButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Montserrat-Bold',
  },
  orText: {
    color: '#A9A9A9',
    marginVertical: 15,
    textAlign: 'center',
    fontFamily: 'Montserrat-Medium',
  },
  socialLoginContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  socialButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    marginBottom: 10,
  },
  socialLogo: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  socialButtonText: {
    fontSize: 16,
    fontFamily: 'Montserrat-Medium',
  },
  signUpContainer: {
    paddingVertical: 10,
  },
  signUpText: {
    color: '#A9A9A9',
    textAlign: 'center',
    fontFamily: 'Montserrat-Medium',
  },
  signUpLink: {
    color: '#1C5AA3',
    fontFamily: 'Montserrat-Bold',
  },
});