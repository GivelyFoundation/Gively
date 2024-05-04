import React from 'react';
import { View, Text} from 'react-native';
import styles from '../Styles.js/Styles';

export default function AboutUsScreen({ navigation }) {
    return (
      <View style={styles.container}>
        <Text>Welcome to the About Us Screen!</Text>
      </View>
    );
  }