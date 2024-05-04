import React, { useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';
import styles from '../Styles.js/Styles';
import { CommonActions } from '@react-navigation/native';

export default function CreateAccountScreen({ navigation }) {
     const [email, setEmail] = useState('');
     const [password, setPassword] = useState('');
     const [confirmPassword, setConfirmPassword] = useState('');
     const handleBack = () => {
      navigation.navigate('Splash');
    };
    const handleSignUp = () => {
     // After login success
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [
          { name: 'Home' },  // 'Home' is the name of the screen you want to navigate to
        ],
      })
    );
  };
  return (
    <View style={styles.container}>
      <Text>CreateAccount</Text>
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
