import React from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

const Spinner = ({ size = 'large', color = '#3FC032' }) => (
  <View style={styles.container}>
    <ActivityIndicator size={size} color={color} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
});

export default Spinner;