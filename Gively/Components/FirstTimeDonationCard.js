import React, {useState, useEffect} from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { getUserByUsername } from '../services/userService';
const likeIcon= require('../assets/Icons/heart.png');
const welcome = require ('../assets/Images/Welcome.png')

const FirstTimeDonationCard = ({ data }) => {
    const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await getUserByUsername(data.originalDonationPoster);
      setUser(userData);
    };

    fetchUser();
  }, [data.originalDonationPoster]);

  const getFirstNameLastInitial = (displayName) => {
    if (!displayName) return '';
    const [firstName, lastName] = displayName.split(' ');
    const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : '';
    return `${firstName} ${lastInitial}`;
  };

  if (!user) {
    console.log(user)
    return null; // or a loading indicator
  }

  const formattedName = getFirstNameLastInitial(user.displayName);
  

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Image source={{uri: data.originalPosterProfileImage}} style={styles.profileImage} />
        <View style={styles.posterInfo}>
          <View style={styles.column}>
            <Text style={styles.posterName}>
              <Text style={[styles.boldText, { fontFamily: 'Montserrat-Bold' }]}>{formattedName}</Text>
              <Text style={{ fontFamily: 'Montserrat-Medium' }}>'s first donation is to </Text>
              <Text style={[styles.boldText, { fontFamily: 'Montserrat-Bold' }]}>{data.charity}!</Text>
            </Text>
            <Text style={[styles.posterDate, { fontFamily: 'Montserrat-Medium' }]}>{data.date}</Text>
          </View>
        </View>
      </View>
      <Image source={welcome} style={styles.welcome} resizeMode="contain" />
        
      <Text style={[styles.postText, styles.welcomeText, { fontFamily: 'Montserrat-Medium' }]}>Welcome {formattedName} to Gively!!!</Text>
      <View style={styles.footer}>
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
},
welcomeText: {
    alignSelf: 'center'
},
welcome:{
    width: 200,
    height: 150,
    alignSelf: 'center'
}
});

export default FirstTimeDonationCard;
