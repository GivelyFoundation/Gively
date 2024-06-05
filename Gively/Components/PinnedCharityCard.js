import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const PinnedCharityCard = ({ username, charity, reason }) => {

  return (
    <View style={styles.container}>
      <Text style={[styles.infoText, { fontFamily: 'Montserrat-Medium'}]}>
        <Text style={{ fontFamily: 'Montserrat-Bold'}}> {username}</Text> is raising money for <Text style={{ fontFamily: 'Montserrat-Bold'}}>{charity}</Text>.
      </Text>
      {reason && (
        <Text style={[styles.reasonText, { fontFamily: 'Montserrat-Regular'}]}>{reason}
        </Text>)}
      <TouchableOpacity style={styles.donateButton}>
        <Text style={[styles.donateButtonText, { fontFamily: 'Montserrat-Medium' }]}>Donate</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    marginHorizontal:0,
    shadowColor: '#5A5A5A',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
    borderColor: "#D8D8D8",
    borderWidth: 1,
    alignItems: 'center', // Center items horizontally
     alignSelf: 'center',
  },
  infoText: {
    fontSize: 16,
    textAlign: 'center', 
    paddingBottom: 4
  },
  reasonText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom:4,
    color: '#6B6B6B',
    fontFamily: 'Montserrat-Regular',
  },
  donateButton: {
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: '#3FC032',
    marginVertical: 4,
    height: 36,
    width: '80%',
    justifyContent: 'center', // Center items horizontally
    alignItems: 'center', // Center items vertically
  },
  donateButtonText: {
    color: '#fff',
    fontSize: 16,
    opacity: 0.9,
    textTransform: 'uppercase'
  },
});

export default PinnedCharityCard;