import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity, Alert, Image, FlatList } from 'react-native';
import * as SMS from 'expo-sms';
import Fuse from 'fuse.js';
import styles from '../Styles.js/Styles';
import { FriendCard } from '../Components/FriendCard';
import { fakeFriends } from '../MockData';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Vector icon for clear button

export default function FriendsListScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const fuse = new Fuse(fakeFriends, {
    keys: ['name'],
    threshold: 0.3, // Adjust to control the fuzziness
  });

  const handleSearch = (text) => {
    setSearchQuery(text);
    if (text) {
      const results = fuse.search(text);
      setSearchResults(results.map(result => result.item));
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
      setSearchResults([]);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowDropdown(false);
  };

  const handleInviteFriends = async () => {
    const isAvailable = await SMS.isAvailableAsync();
    if (isAvailable) {
      const { result } = await SMS.sendSMSAsync(
        [],
        'Join me and download Gively! New users get $5 to the charity of their choice!'
      );

      if (result === 'sent') {
        Alert.alert('Success', 'Invitation sent successfully.');
      } else if (result === 'cancelled') {
        Alert.alert('Cancelled', 'Invitation was cancelled.');
      } else {
        Alert.alert('Error', 'An error occurred.');
      }
    } else {
      Alert.alert('Error', 'SMS is not available on this device.');
    }
  };

  return (
    <View style={[styles.page, friendStyles.container]}>
      <View style={friendStyles.headerContainer}>
        <Text style={[friendStyles.headerText, { fontFamily: 'Montserrat-Medium' }]}>Connect</Text>
      </View>
      <View style={friendStyles.searchBoxContainer}>
        <TextInput
          style={friendStyles.searchBox}
          placeholder="Search..."
          onChangeText={handleSearch}
          value={searchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity style={friendStyles.clearButton} onPress={clearSearch}>
            <Icon name="close" size={16} color="#A9A9A9" />
          </TouchableOpacity>
        )}
      </View>
      {showDropdown && (
        <View style={friendStyles.dropdown}>
          {searchResults.length > 0 ? (
            <FlatList
              data={searchResults}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => Alert.alert('Selected', item.name)}>
                  <Text style={friendStyles.dropdownItem}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          ) : (
            <Text style={friendStyles.noResultsText}>No matching users found</Text>
          )}
        </View>
      )}
      <ScrollView>
        <TouchableOpacity style={friendStyles.inviteFriendsButton} onPress={handleInviteFriends}>
          <Text style={[friendStyles.inviteFriendsButtonText, { fontFamily: 'Montserrat-Bold' }]}>
            Invite Friends From Contacts
          </Text>
        </TouchableOpacity>
        <Text style={[friendStyles.title, { fontFamily: 'Montserrat-Bold' }]}>People You May Know</Text>
        <ScrollView>
          {fakeFriends.map(friend => (
            <FriendCard key={friend.id} friend={friend} areFollow={friend.areFollowing} />
          ))}
        </ScrollView>
        <View style={friendStyles.spacer} />
      </ScrollView>
    </View>
  );
}

const friendStyles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  headerText: {
    fontSize: 24,
  },
  searchBoxContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
  },
  searchBox: {
    flex: 1,
    height: 40,
    borderColor: '#E4DFDF',
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
  },
  clearButton: {
    position: 'absolute',
    right: 10,
    padding: 5,
  },
  dropdown: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    marginHorizontal: 20,
    padding: 10,
    elevation: 5, // Shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    maxHeight: 200, // Limit the height
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomColor: '#E4DFDF',
    borderBottomWidth: 1,
  },
  noResultsText: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    color: '#A9A9A9',
  },
  horizontalLine: {
    height: 1, // Line thickness
    backgroundColor: '#cccccc', // Line color, light grey
    marginTop: 20,
    marginBottom: 5,
    marginHorizontal: 30,
  },
  container: {
    paddingHorizontal: 10,
    paddingVertical: 30,
    marginTop: 40,
  },
  title: {
    fontSize: 16,
    paddingLeft: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  inviteFriendsButton: {
    backgroundColor: '#3FC032',
    padding: 4,
    marginHorizontal: 20,
    alignItems: 'center',
    borderRadius: 10,
    elevation: 5, // Adds shadow for Android
    shadowColor: '#000', // Adds shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  inviteFriendsButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  noFriends: {
    width: 350,
    height: 350,
    alignSelf: 'center'
  },
  spacer: {
    height: 200
  },
  addFriends: {
    alignSelf: 'center',
    fontSize: 18
  }
});
