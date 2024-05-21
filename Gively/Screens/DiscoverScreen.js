
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import styles from '../Styles.js/Styles';
import DiscoverCharityCard from '../Components/DiscoverCharityCard';
import { charityCategories } from '../MockData';

const charityLogo = require('../assets/Images/TSA.png');

const charitylogos = [charityLogo, charityLogo, charityLogo, charityLogo, charityLogo, charityLogo, charityLogo]

const renderDiscoverCharityCards = (charityLogos) => {
  return charityLogos.map((charityLogo, index) => (
    <DiscoverCharityCard key={index} image={charityLogo} />
  ));
};


export default function DiscoverScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const handleSearch = () => {
    // Here you can implement your search logic.
    // For simplicity, let's just filter some dummy data.
    const filteredResults = dummyData.filter(item =>
      item.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setSearchResults(filteredResults);
  };
  return (
    <View style={[styles.page, discoverStyles.container]}>
      <Text style={[discoverStyles.headerText, { fontFamily: 'Montserrat-Medium' }]}>Discover</Text>
      <TextInput
        style={[discoverStyles.searchBox]}
        placeholder="Search..."
        onChangeText={text => setSearchQuery(text)}
        value={searchQuery}
      />

      <View style={discoverStyles.sectionContainer}>
        <Text style={[discoverStyles.subheadingText, { fontFamily: 'Montserrat-Medium' }]}>LOCAL</Text>
        <ScrollView horizontal>
          <View style={{ flexDirection: 'row' }}>
            {renderDiscoverCharityCards(charitylogos)}
          </View>
        </ScrollView>
      </View>

      <View style={discoverStyles.sectionContainer}>
        <Text style={[discoverStyles.subheadingText, { fontFamily: 'Montserrat-Medium' }]}>OUR PICKS FOR YOU</Text>
        <ScrollView horizontal>
          <View style={{ flexDirection: 'row' }}>
            {renderDiscoverCharityCards(charitylogos)}
          </View>
        </ScrollView>
      </View>
      <TouchableOpacity
        style={discoverStyles.petitionButton}
        onPress={() => navigation.navigate('Petition')} // Navigate to PetitionScreen
      >
        <Text style={[discoverStyles.petitionButtonText, { fontFamily: 'Montserrat-Medium' }]}>Share A Change.Org Petition</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={discoverStyles.goFundMeButton}
        onPress={() => navigation.navigate('GoFundMe')}>
        <Text style={[discoverStyles.goFundMeButtonText, { fontFamily: 'Montserrat-Medium' }]}>Share A GoFundMe</Text>
      </TouchableOpacity>
      <View style={discoverStyles.sectionContainer}>
        <View style={[discoverStyles.browseByCategorySection]}>
          <Text style={[discoverStyles.subheadingText, { fontFamily: 'Montserrat-Medium' }]}>BROWSE BY CATEGORY</Text>
          <TouchableOpacity>
            <Text style={[discoverStyles.seeAllButton, { fontFamily: 'Montserrat-Medium' }]}>SEE ALL </Text>
          </TouchableOpacity>
        </View>
        <View style={discoverStyles.categoryButtonContainer}>
          {charityCategories.map((category, index) => (
            <TouchableOpacity key={index} style={discoverStyles.categoryButton}>
              <Text style={[discoverStyles.categoryButtonText, { fontFamily: 'Montserrat-Medium' }]}>{category.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>


    </View>
  );
}

const discoverStyles = StyleSheet.create({
  headerText: {
    paddingLeft: 20,
    fontSize: 24
  },
  subheadingText: {
    paddingLeft: 20,
    paddingVertical: 10,
    fontSize: 16,
    color: '#8C8A9A'
  },
  searchBox: {
    height: 40,
    borderColor: '#E4DFDF',
    borderWidth: 1,
    marginBottom: 10,
    borderRadius: 12,
    marginVertical: 10,
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    paddingHorizontal: 20
  },
  container: {
    paddingHorizontal: 10,
    paddingVertical: 30,
    marginTop: 40,
    flex: 1
  },
  sectionContainer: {
    flexGrow: 0, // Prevents the section from growing to fill available space
    marginBottom: 10, // Adds spacing between sections
  },
  categoryButtonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap', // Allow buttons to wrap to the next line
    justifyContent: 'flex-start', // Align buttons at the beginning of the container
    marginBottom: 10, // Added margin bottom to create space between rows of buttons
    paddingHorizontal: 20
  },
  categoryButton: {
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginRight: 10,
    marginBottom: 10, // Added margin bottom to create space between buttons
    backgroundColor: 'rgba(28, 90, 163, 0.1)',
    alignSelf: 'flex-start', // Make the button take up width necessary for content
  },
  categoryButtonText: {
    color: '#1C5AA3',
    fontSize: 14,
    opacity: .9,
    textAlign: 'center', // Align text in the center
    flexWrap: 'wrap', // Allow text to wrap to the next line
  },
  seeAllButton: {
    textAlign: 'center',
    color: '#1C5AA3',
    fontSize: 16,
    opacity: .9,
  },
  browseByCategorySection: {
    flexDirection: 'row', // Align children horizontally
    alignItems: 'center', // Align children vertically in the center
    width: '100%', // Ensure the row takes full width of the screen
    justifyContent: 'space-between',
    paddingRight: 20,
    paddingBottom: 10
  },
  petitionButton: {
    borderRadius: 12,
    borderColor: '#1C5AA3',
    borderWidth: 1,
    height: 36,
    width: '94%',
    justifyContent: 'center', // Center items horizontally
    alignItems: 'center', // Center items vertically
    alignSelf: 'center',
    marginBottom: 10,
  },
  petitionButtonText: {
    color: '#1C5AA3',
    fontSize: 16,
    opacity: 0.9,
  },
  goFundMeButton: {
    borderRadius: 12,
    borderColor: '#3FC032',
    borderWidth: 1,
    height: 36,
    width: '94%',
    justifyContent: 'center', // Center items horizontally
    alignItems: 'center', // Center items vertically
    alignSelf: 'center',
    marginBottom: 10,
  },
  goFundMeButtonText: {
    color: '#3FC032',
    fontSize: 16,
    opacity: 0.9,
  },
})