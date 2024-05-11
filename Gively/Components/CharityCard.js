import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';

const CharityCard = ({ charity }) => {

  const screenWidth = Dimensions.get('window').width;
  return (
    <View style={[styles.card, { width: screenWidth - 80, height: 300 }]}>
      <Text style={[styles.name, { fontFamily: 'Montserrat-Medium' }]}>{charity.charityName}</Text>
      <Text style={[styles.description, { fontFamily: 'Montserrat-Medium' }]}>{charity.charityDescription}</Text>
      <View style={styles.categoriesContainer}>
        <View style={[styles.column, styles.actionButtons]}>
        <TouchableOpacity style={styles.learnMoreButton}>
        <Text style={[styles.learnMoreButtonText, { fontFamily: 'Montserrat-Medium' }]}>Learn More</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.donateButton}>
          <Text style={[styles.donateButtonText, { fontFamily: 'Montserrat-Medium' }]}>Donate</Text>
        </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    margin: 8,
    shadowColor: '#5A5A5A',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 5,
    borderColor:'#000',
    borderWidth:.1
  },
  name: {
    fontSize: 24,
    marginBottom: 8,
    textAlign: 'center'
  },
  description: {
    fontSize: 16,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flex: 1,
    flexWrap: 'wrap',
    alignContent:'flex-end'
  },
  interestButton: {
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 20,
    marginRight: 10,
    backgroundColor: 'rgba(28, 90, 163, 0.1)',
    marginVertical: 10
  },
  interestButtonText: {
    color: '#1C5AA3',
    fontSize: 12,
    opacity: .9
  },
  donateButton: {
    borderRadius: 12,
    paddingHorizontal: 20,
    marginRight: 10,
    backgroundColor: '#3FC032',
    marginVertical: 10,
    height: 40,
    width: '80%',
    justifyContent: 'center', // Center items horizontally
    alignItems: 'center', // Center items vertically
  },
  donateButtonText: {
    color: '#fff',
    fontSize: 24,
    opacity: .9,
    textTransform:'uppercase'

  },
  learnMoreButton: {
    borderRadius: 20,
    paddingHorizontal: 20,
    marginRight: 10,
  },
  learnMoreButtonText: {
    color: '#1C5AA3',
    fontSize: 16,
    opacity: .9
  },
  column: {
    flexDirection: 'column', // Align children horizontally
    alignItems: 'center', // Align children vertically in the center,
    width: '100%'
  },
  actionButtons: {
   paddingVertical: 0,
   alignSelf: 'flex-end',
  },
});

export default CharityCard;
