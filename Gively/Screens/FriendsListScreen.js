import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import * as SMS from 'expo-sms';
import styles from '../Styles.js/Styles';
import { FriendCard } from '../Components/FriendCard';
import { fakeFriends, fakeFriendReccomendations } from '../MockData';

const GoFundMeLogo = require('../assets/Images/GoFundMeLogo.jpg');

export default function FriendsListScreen({ navigation }) {
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

  const handleInviteFriends = async () => {
    console.log("Invite Friends Button Pressed");

    const isAvailable = await SMS.isAvailableAsync();
    if (isAvailable) {
      const { result } = await SMS.sendSMSAsync(
        [], // You can pre-fill recipients or leave it empty for the user to choose
        'Join me and download Gively! New users get $5 to the charity of their choice!'
      );

      if (result === 'sent') {
        Alert.alert('Success', 'Invitation sent successfully.');
        console.log("SMS Sent Successfully");
      } else if (result === 'cancelled') {
        Alert.alert('Cancelled', 'Invitation was cancelled.');
        console.log("SMS Sending Cancelled");
      } else {
        Alert.alert('Error', 'An error occurred.');
        console.log("Error Sending SMS");
      }
    } else {
      Alert.alert('Error', 'SMS is not available on this device.');
      console.log("SMS is not available on this device");
    }
  };
  return (
    <View style={[styles.page, friendStyles.container]}>
      <Text style={[friendStyles.headerText, { fontFamily: 'Montserrat-Medium' }]}>Friends</Text>
      <TextInput
        style={[friendStyles.searchBox]}
        placeholder="Search..."
        onChangeText={text => setSearchQuery(text)}
        value={searchQuery}
      />
      <TouchableOpacity style={friendStyles.inviteFriendsButton} onPress={handleInviteFriends}>
        <Text style={[friendStyles.inviteFriendsButtonText, { fontFamily: 'Montserrat-Bold' }]}>
          Invite Friends From Contacts
        </Text>
      </TouchableOpacity>
      <ScrollView>
        <Text style={[friendStyles.title, { fontFamily: 'Montserrat-Medium' }]}>People You May Know</Text>
        <ScrollView>
          {fakeFriends.map(friend => (
            <FriendCard key={friend.id} friend={friend} areFollow={friend.areFollowing} />
          ))}
        </ScrollView>
        <Text style={[friendStyles.title, { fontFamily: 'Montserrat-Medium' }]}>Following</Text>
        <ScrollView>
          {fakeFriendReccomendations.map(friend => (
            <FriendCard key={friend.id} friend={friend} areFollowing={friend.areFollowing} />
          ))}
        </ScrollView>
      </ScrollView>
    </View>
  );
}

const friendStyles = StyleSheet.create({
  headerText: {
    paddingLeft: 20,
    fontSize: 24
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
    marginTop: 40
  },
  title: {
    fontSize: 16,
    paddingLeft: 20,
    paddingTop: 10,
    paddingBottom: 20
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
});
