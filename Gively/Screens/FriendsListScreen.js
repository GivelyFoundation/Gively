
import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import styles from '../Styles.js/Styles';
import { FriendCard } from '../Components/FriendCard';
import { fakeFriends, fakeFriendReccomendations } from '../MockData';

export default function FriendsListScreen({ navigation }) {
  return (
    <View style={[styles.page, friendStyles.container]}>
       <ScrollView>
     


      <Text style={[friendStyles.title, { fontFamily: 'Montserrat-Bold' }]}>Following</Text>
      <View style={friendStyles.horizontalLine} />
      <ScrollView>
        {fakeFriendReccomendations.map(friend => (

          <FriendCard key={friend.id} friend={friend} areFollowing={friend.areFollowing} />
        ))}
      </ScrollView>
      <Text style={[friendStyles.title, { fontFamily: 'Montserrat-Bold' }]}>People You May Know</Text>
      <View style={friendStyles.horizontalLine} />
      <ScrollView>
        {fakeFriends.map(friend => (
          <FriendCard key={friend.id} friend={friend} areFollow={friend.areFollowing} />
        ))}
      </ScrollView>
      </ScrollView>
    </View>
  );
}

const friendStyles = StyleSheet.create({
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
    paddingTop: 10
  }
})