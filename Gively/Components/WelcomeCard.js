import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const WelcomeCard = ({ username, donationAmount, charityCount }) => {
    return (
      <View style={styles.container}>
        <Text style={[styles.welcomeText, { fontFamily: 'Montserrat-Medium'}]}>Welcome back {username}!</Text>
        <Text style={[styles.infoText, { fontFamily: 'Montserrat-Medium'}]}>
          This week your network has donated <Text style={{ fontFamily: 'Montserrat-Bold'}}>${donationAmount}</Text> to <Text style={{ fontFamily: 'Montserrat-Bold'}}>{charityCount}</Text> charities.
        </Text>
        <TouchableOpacity onPress={() => console.log('Learn more pressed')}>
          <Text style={[styles.learnMore, { fontFamily: 'Montserrat-Medium'}]}>Learn More</Text>
        </TouchableOpacity>
      </View>
    );
  };

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    marginHorizontal: 20,
    marginTop: 20,
    shadowColor: '#5A5A5A',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
    borderColor: "#D8D8D8",
    borderWidth: 1,
    marginBottom: 10
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3FC032',
    marginBottom: 10,
    textTransform: 'uppercase'
  },
  infoText: {
    fontSize: 16,
    marginBottom: 10,
  },
  learnMore: {
    color: '#1C5AA3',
    fontSize: 14
  },
});

export default WelcomeCard;
