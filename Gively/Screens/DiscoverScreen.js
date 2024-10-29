import React, { useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import styles from '../styles/Styles';
import DiscoverCharityCard from '../Components/DiscoverCharityCard';
import { charityCategories } from '../MockData';
import { useNavigation } from '@react-navigation/native';

const charityLogo = require('../assets/Images/TSA.png');
const charityLogos = [charityLogo, charityLogo, charityLogo, charityLogo, charityLogo, charityLogo, charityLogo];
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const renderDiscoverCharityCards = (charityLogos) => {
  const navigation = useNavigation();
  return charityLogos.map((charityLogo, index) => (
    <DiscoverCharityCard key={index} image={charityLogo} navigation={navigation} />
  ));
};

export default function DiscoverScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const handleSearch = () => {
    // Implement your search logic here
    const filteredResults = dummyData.filter(item =>
      item.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setSearchResults(filteredResults);
  };

  return (
    <SafeAreaView style={[styles.page, discoverStyles.container]}>
      <View style={discoverStyles.container}>
        <ScrollView >
          <View style={discoverStyles.headerContainer}>
            <Text style={discoverStyles.headerText}>Discover</Text>
          </View>
        
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
                {renderDiscoverCharityCards(charityLogos)}
              </View>
            </ScrollView>
          </View>

          <View style={discoverStyles.sectionContainer}>
            <Text style={[discoverStyles.subheadingText, { fontFamily: 'Montserrat-Medium' }]}>OUR PICKS FOR YOU</Text>
            <ScrollView horizontal>
              <View style={{ flexDirection: 'row' }}>
                {renderDiscoverCharityCards(charityLogos)}
              </View>
            </ScrollView>
          </View>
          <TouchableOpacity
            style={discoverStyles.petitionButton}
            onPress={() => navigation.navigate('Petition')}
          >
            <Text style={[discoverStyles.petitionButtonText, { fontFamily: 'Montserrat-Medium' }]}>Share A Change.Org Petition</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={discoverStyles.goFundMeButton}
            onPress={() => navigation.navigate('GoFundMe')}
          >
            <Text style={[discoverStyles.goFundMeButtonText, { fontFamily: 'Montserrat-Medium' }]}>Share A GoFundMe</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={discoverStyles.petitionButton}
            onPress={() => navigation.navigate('VolunteerScreen')}
          >
            <Text style={[discoverStyles.petitionButtonText, { fontFamily: 'Montserrat-Medium' }]}>Share A Volunteer Opportunity</Text>
          </TouchableOpacity>
          <View style={discoverStyles.sectionContainer}>
            <View style={[discoverStyles.browseByCategorySection]}>
              <Text style={[discoverStyles.subheadingText, { fontFamily: 'Montserrat-Medium' }]}>BROWSE BY CATEGORY</Text>
              <TouchableOpacity>
                <Text style={[discoverStyles.seeAllButton, { fontFamily: 'Montserrat-Medium' }]}>SEE ALL</Text>
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
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const discoverStyles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SCREEN_HEIGHT * 0.02,
  },
  headerText: {
    fontSize: SCREEN_WIDTH * 0.06,
    fontFamily: 'Montserrat-Medium',
  },
  subheadingText: {
    paddingLeft: 20,
    paddingVertical: 10,
    fontSize: 16,
    color: '#8C8A9A',
  },
  searchBox: {
    height: SCREEN_HEIGHT * 0.05,
    borderColor: '#E4DFDF',
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: '#FFF',
    paddingHorizontal: SCREEN_WIDTH * 0.05,
    fontFamily: 'Montserrat-Regular',
    fontSize: SCREEN_WIDTH * 0.04,
  },
  container: {
    flex: 1,
    paddingHorizontal: SCREEN_WIDTH * 0.03, // Reduced horizontal padding
    paddingTop: SCREEN_HEIGHT * 0.02,
  },
  sectionContainer: {
    flexGrow: 0,
    marginBottom: 10,
  },
  categoryButtonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  categoryButton: {
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginRight: 10,
    marginBottom: 10,
    backgroundColor: 'rgba(28, 90, 163, 0.1)',
    alignSelf: 'flex-start',
  },
  categoryButtonText: {
    color: '#1C5AA3',
    fontSize: 14,
    opacity: 0.9,
    textAlign: 'center',
  },
  seeAllButton: {
    textAlign: 'center',
    color: '#1C5AA3',
    fontSize: 16,
    opacity: 0.9,
  },
  browseByCategorySection: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'space-between',
    paddingRight: 20,
    paddingBottom: 10,
  },
  petitionButton: {
    borderRadius: 12,
    borderColor: '#1C5AA3',
    borderWidth: 1,
    height: 36,
    width: '94%',
    justifyContent: 'center',
    alignItems: 'center',
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
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 10,
  },
  goFundMeButtonText: {
    color: '#3FC032',
    fontSize: 16,
    opacity: 0.9,
  },
});
