import React from 'react';
import { View, Text, Button} from 'react-native';
import styles from '../Styles.js/Styles';
import updateCurrentUserStructure from '../services/updateCurrentUserDocument';

export default function SettingScreen({ navigation }) {
    return (
      <View style={styles.container}>
        <Text>Welcome to the Settings Screen!</Text>
        <Button title="Update User Structure" onPress={updateCurrentUserStructure} />
      </View>
    );
  }