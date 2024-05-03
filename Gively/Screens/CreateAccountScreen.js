// screens/SignUpScreen.js

import React, { useState } from 'react';
import { View, TextInput, Button } from 'react-native';
// import firebase from 'firebase';

export default function CreateAccountScreen({ navigation }) {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');

//   const handleSignUp = () => {
//     firebase.auth().createUserWithEmailAndPassword(email, password)
//       .then(() => {
//         navigation.navigate('Home');
//       })
//       .catch(error => {
//         console.log(error);
//       });
//   };

  return (
    <View>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      {/* <Button title="Sign Up" onPress={handleSignUp} /> */}
    </View>
  );
}
