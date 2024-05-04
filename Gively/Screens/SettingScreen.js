import React from 'react';
import { View, Text} from 'react-native';
import styles from '../Styles.js/Styles';

export default function SettingScreen({ navigation }) {
    return (
      <View style={styles.container}>
        <Text>Welcome to the Settings Screen!</Text>
      </View>
    );
  }