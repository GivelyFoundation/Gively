import React, { useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';



export default function CreateAccountScreen({ navigation }) {
     const [email, setEmail] = useState('');
     const [password, setPassword] = useState('');
     const [confirmPassword, setConfirmPassword] = useState('');
     const handleBack = () => {
      navigation.navigate('Splash');
    };
    const handleSignUp = () => {
      navigation.navigate('Home');
    };
  return (
    <View>
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
      <Button title="Login" onPress={handleSignUp} />
      <Button title="Back" onPress={handleBack} />
    </View>
  );

}
