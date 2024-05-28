import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
const likeIcon= require('../assets/Icons/heart.png');
const profilePicture = require('../assets/Images/profileDefault.png');


const formatDate = (dateStr) => {
  const date = new Date(dateStr);

  // Options for the date part
  const optionsDate = { weekday: 'short', month: 'short', day: 'numeric' };

  // Format the date part
  const formattedDate = date.toLocaleDateString('en-US', optionsDate);

  // Options for the time part
  const optionsTime = { hour: 'numeric', minute: 'numeric', hour12: true };

  // Format the time part
  const formattedTime = date.toLocaleTimeString('en-US', optionsTime);

  return `${formattedDate} • ${formattedTime}`;
};

const DonationCard = ({ data }) => {

  const renderOthersElement = () => {
    const firstDonor = data.otherDonationUsers[0];
    switch (data.otherDonationUsers.length) {
      case 0:
        return;
      case 1:
        const parts = firstDonor.split(' ');
        return (
        <View style = {styles.row}>
          <Image source={profilePicture} style={styles.profilePicture} />
          <Text style={{ fontFamily: 'Montserrat-Medium' }}>
            <Text style={{ fontFamily: 'Montserrat-Bold' }}>{parts[0]}</Text> {parts.slice(1).join(' ')}Donated too!
          </Text>
          </View>
        );
      default:
        return (
          <View style = {styles.row}>
          <Image source={profilePicture} style={styles.profilePicture} />
          <Text style={{ fontFamily: 'Montserrat-Medium' }}>
            <Text style={{ fontFamily: 'Montserrat-Bold' }}>{firstDonor}</Text> and {data.otherDonationUsers.length - 1} others Donated!
          </Text>
          </View>
        );
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Image source={data.originalPosterProfileImage} style={styles.profileImage} />
        <View style={styles.posterInfo}>
          <View style={styles.column}>
            <Text style={styles.posterName}>
              <Text style={[styles.boldText, { fontFamily: 'Montserrat-Bold' }]}>{data.originalDonationPoster}</Text>
              <Text style={{ fontFamily: 'Montserrat-Medium' }}> donated to </Text>
              <Text style={[styles.boldText, { fontFamily: 'Montserrat-Bold' }]}>{data.charityName}</Text>
            </Text>
            <Text style={[styles.posterDate, { fontFamily: 'Montserrat-Medium' }]}>{formatDate(data.data)}</Text>
          </View>
        </View>
      </View>

      <Text style={[styles.postText, { fontFamily: 'Montserrat-Medium' }]}>{data.postText}</Text>
      <View style={styles.footer}>
        {renderOthersElement()}
        <View style={styles.likesContainer}>
          <Image source={likeIcon} style={[styles.likeIcon, {tintColor: data.isLiked ? '#EB5757' : '#8484A9'}]} />
          <Text style={[styles.likes, { fontFamily: 'Montserrat-Medium' , color: data.isLiked ? '#EB5757' : '#8484A9'}]}>{data.likes}</Text>
        </View>
        <TouchableOpacity style={styles.button}>
          <Text style={[styles.buttonText, { fontFamily: 'Montserrat-Bold' }]}>Donate</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};


const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#5A5A5A',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  profileImage: {
    width: 64,
    height: 64,
    borderRadius: 10,
    marginRight: 10,
  },
  posterInfo: {
    flex: 1,
  },
  posterName: {
    fontSize: 16,
    fontFamily: 'Montserrat-Bold',
  },
  posterDate: {
    fontSize: 13,
    color: '#1C5AA3',
    paddingTop: 5,
  },
  postText: {
    fontSize: 14,
    marginBottom: 10,
    lineHeight: 24
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  likesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeIcon: {
    width: 16,
    height: 16,
    marginRight: 5
  },
  likes :{
    color: '#EB5757',
    fontSize:13
  },
  button: {
    backgroundColor: '#3FC032',
    borderRadius: 7,
    padding: 10,
    paddingHorizontal:20
  },
  buttonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase'
  },
  profilePicture: {
    width: 20,
    height: 20,
    borderRadius: 25,
    marginRight: 4,
},
row:{
  flexDirection: 'row',
  alignItems: 'center'
}
});

export default DonationCard;
