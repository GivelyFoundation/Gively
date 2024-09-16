import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FeedbackForm from '../Components/FeedbackForm';

const ContactUsScreen = () => {
  const handleEmailPress = () => {
    const email = "support@gively.com";
    Linking.openURL(`mailto:${email}`);
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Our Email</Text>
          <Text style={styles.emailText}>support@gively.com</Text>
          <TouchableOpacity style={styles.button} onPress={handleEmailPress}>
            <Text style={styles.buttonText}>Send us an email</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Feedback Form</Text>
          <FeedbackForm />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 10,
    fontFamily: 'Montserrat-Medium',
  },
  emailText: {
    fontSize: 16,
    marginBottom: 10,
    fontFamily: 'Montserrat-Regular',
  },
  button: {
    backgroundColor: '#3FC032',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Montserrat-Medium',
  },
});

export default ContactUsScreen;