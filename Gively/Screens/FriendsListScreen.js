import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity, Alert, Image } from 'react-native';
import * as SMS from 'expo-sms';
import styles from '../Styles.js/Styles';
import { FriendCard } from '../Components/FriendCard';
import { fakeFriends, fakeFriendReccomendations } from '../MockData';
const noFriends = require('../assets/Images/NoFriendsYet.png');
import Icon from 'react-native-vector-icons/MaterialIcons';

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
      <View style={friendStyles.headerContainer}>
        
        <Text style={[friendStyles.headerText, { fontFamily: 'Montserrat-Medium' }]}>Friends</Text>
        <TouchableOpacity  onPress={() => navigation.navigate('Nofications')}>
        <Icon name="notifications" size={30} color='#1C5AA3' />
        </TouchableOpacity>
      </View>
      <TextInput
        style={[friendStyles.searchBox]}
        placeholder="Search..."
        onChangeText={text => setSearchQuery(text)}
        value={searchQuery}
      />

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
        
        <Text style={[friendStyles.title, { fontFamily: 'Montserrat-Bold' }]}>Following</Text>
        {/* <ScrollView>
          {fakeFriendReccomendations.map(friend => (
            <FriendCard key={friend.id} friend={friend} areFollowing={friend.areFollowing} />
          ))}
        </ScrollView> */}
        <Image source={noFriends} style={friendStyles.noFriends} resizeMode="contain" />

        <Text style={[friendStyles.addFriends, { fontFamily: 'Montserrat-Medium' }]}>Add friends to see them here!</Text>
       
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
  notificationIcon: {
    width: 24,
    height: 24,
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
    paddingHorizontal: 20,
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
    paddingTop: 10,
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
  noFriends:{
      width: 350,
      height: 350,
      alignSelf: 'center'
  },
  spacer:{
    height: 200
  },
  addFriends:{
    alignSelf: 'center',
    fontSize: 18
  }
});
