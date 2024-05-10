
import Reacts, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput } from 'react-native';
import styles from '../Styles.js/Styles';
import { FriendCard } from '../Components/FriendCard';
import { fakeFriends, fakeFriendReccomendations } from '../MockData';

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
  return (
    <View style={[styles.page, friendStyles.container]}>
      <Text style={[friendStyles.headerText, { fontFamily: 'Montserrat-Medium' }]}>Friends</Text>
      <TextInput
        style={[friendStyles.searchBox]}
        placeholder="Search..."
        onChangeText={text => setSearchQuery(text)}
        value={searchQuery}
      />

      <ScrollView>



        <Text style={[friendStyles.title, { fontFamily: 'Montserrat-Medium' }]}>Following</Text>
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
  headerText: {
    paddingLeft: 20,
    fontSize: 24
  },
  searchBox: {
    height: 40,
    borderColor: '#E4DFDF',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginVertical:10,
    backgroundColor: '#FFF',
    marginHorizontal:30
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
  paddingTop: 10
}
})