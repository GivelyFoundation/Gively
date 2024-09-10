import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, FlatList, SafeAreaView, Dimensions } from 'react-native';
import * as SMS from 'expo-sms';
import Fuse from 'fuse.js';
import { debounce } from 'lodash';
import { FriendCard } from '../Components/FriendCard';
import { fakeFriends } from '../MockData';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function ConnectScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fuse = new Fuse(fakeFriends, {
    keys: ['name'],
    threshold: 0.3,
    includeScore: true,
  });

  const handleSearch = useCallback(
    debounce((text) => {
      setIsLoading(true);
      if (text) {
        const results = fuse.search(text);
        setSearchResults(results.map(result => ({ ...result.item, score: result.score })));
        setShowDropdown(true);
      } else {
        setShowDropdown(false);
        setSearchResults([]);
      }
      setIsLoading(false);
    }, 300),
    []
  );

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

  const renderSearchResult = ({ item }) => (
    <TouchableOpacity
      style={styles.dropdownItem}
      onPress={() => {
        Alert.alert('Selected', item.name);
        clearSearch();
      }}
    >
      <Text>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderFriendItem = ({ item }) => (
    <View style={styles.friendCardContainer}>
      <FriendCard friend={item} areFollow={item.areFollowing} />
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerText}>Connect</Text>
        </View>
        <View style={styles.searchBoxContainer}>
          <TextInput
            style={styles.searchBox}
            placeholder="Search..."
            onChangeText={(text) => {
              setSearchQuery(text);
              handleSearch(text);
            }}
            value={searchQuery}
            accessibilityLabel="Search for friends"
            accessibilityRole="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity style={styles.clearButton} onPress={clearSearch}>
              <Icon name="close" size={16} color="#A9A9A9" />
            </TouchableOpacity>
          )}
        </View>
        {isLoading && <Text style={styles.loadingText}>Searching...</Text>}
        {showDropdown && (
          <View style={styles.dropdownContainer}>
            <FlatList
              data={searchResults}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderSearchResult}
              maxToRenderPerBatch={10}
              initialNumToRender={10}
              ListEmptyComponent={<Text style={styles.noResultsText}>No matching users found</Text>}
            />
          </View>
        )}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>People You May Know</Text>
          <TouchableOpacity style={styles.inviteFriendsButton} onPress={handleInviteFriends}>
            <Text style={styles.inviteFriendsButtonText}>
              Invite Friends
            </Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={fakeFriends}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderFriendItem}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    paddingHorizontal: SCREEN_WIDTH * 0.03, // Reduced horizontal padding
    paddingTop: SCREEN_HEIGHT * 0.02,
  },
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
  searchBoxContainer: {
    position: 'relative',
    marginBottom: SCREEN_HEIGHT * 0.02,
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
  clearButton: {
    position: 'absolute',
    right: SCREEN_WIDTH * 0.02,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SCREEN_WIDTH * 0.02,
  },
  dropdownContainer: {
    position: 'absolute',
    top: SCREEN_HEIGHT * 0.13,
    left: SCREEN_WIDTH * 0.03,
    right: SCREEN_WIDTH * 0.03,
    zIndex: 1,
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderColor: '#E4DFDF',
    borderWidth: 1,
    maxHeight: SCREEN_HEIGHT * 0.3,
  },
  dropdownItem: {
    paddingVertical: SCREEN_HEIGHT * 0.015,
    paddingHorizontal: SCREEN_WIDTH * 0.04,
    borderBottomColor: '#E4DFDF',
    borderBottomWidth: 1,
  },
  noResultsText: {
    paddingVertical: SCREEN_HEIGHT * 0.015,
    paddingHorizontal: SCREEN_WIDTH * 0.04,
    color: '#A9A9A9',
    fontFamily: 'Montserrat-Regular',
    fontSize: SCREEN_WIDTH * 0.035,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SCREEN_HEIGHT * 0.02,
  },
  title: {
    fontSize: SCREEN_WIDTH * 0.045,
    fontFamily: 'Montserrat-Bold',
  },
  inviteFriendsButton: {
    backgroundColor: '#3FC032',
    paddingVertical: SCREEN_HEIGHT * 0.01,
    paddingHorizontal: SCREEN_WIDTH * 0.03,
    borderRadius: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  inviteFriendsButtonText: {
    fontSize: SCREEN_WIDTH * 0.035,
    color: '#fff',
    fontWeight: 'bold',
    fontFamily: 'Montserrat-Bold',
  },
  loadingText: {
    textAlign: 'center',
    marginTop: SCREEN_HEIGHT * 0.01,
    color: '#666',
    fontFamily: 'Montserrat-Regular',
    fontSize: SCREEN_WIDTH * 0.035,
  },
  friendCardContainer: {
    width: '100%', // Make the friend card container full width
    marginBottom: SCREEN_HEIGHT * 0.01, // Add some vertical spacing between cards
  },
});