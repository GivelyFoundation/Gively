import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';

const ContactUsScreen = () => {
  // Function to handle email press
  const handleEmailPress = () => {
    const email = "support@gively.com";
    Linking.openURL(`mailto:${email}`);
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.header, {fontFamily: 'Montserrat-Medium'}]}>Contact Us</Text>

      <TouchableOpacity style={styles.button} onPress={handleEmailPress}>
        <Text style={[styles.buttonText,{fontFamily: 'Montserrat-Medium'}]}>Email Us: support@gively.com</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff'
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  infoContainer: {
    marginBottom: 20,
  },
  infoText: {
    fontSize: 16,
    color: '#333',
  },
  button: {
    backgroundColor: '#3FC032',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    width: '100%',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  }
});

export default ContactUsScreen;