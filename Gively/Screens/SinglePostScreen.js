import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { firestore } from '../services/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import DonationCard from '../Components/DonationCard'; // Assuming you have a DonationCard component
import PetitionCard from '../Components/PetitionCard'; // Assuming you have a PetitionCard component
import GoFundMeCard from '../Components/GoFundMeCard'; // Assuming you have a GoFundMeCard component
import FirstTimeDonationCard from '../Components/FirstTimeDonationCard'; // Assuming you have a FirstTimeDonationCard component
import VolunteerCard from '../Components/VolunteerCard'; // Import the VolunteerCard component
import Icon from 'react-native-vector-icons/MaterialIcons';

const SinglePostScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { postId } = route.params;
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const postRef = doc(firestore, 'Posts', postId);
        const postDoc = await getDoc(postRef);
        if (postDoc.exists()) {
          setPost(postDoc.data());
        } else {
          console.log('No such post!');
        }
      } catch (error) {
        console.error('Error fetching post:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

  const renderCard = (item) => {
    if (!item) {
      return null;
    }
    switch (item.PostType) {
      case 'donation':
        return <DonationCard key={item.id} data={item} />;
      case 'petition':
        return <PetitionCard key={item.id} data={item} />;
      case 'gofundme':
        return <GoFundMeCard key={item.id} data={item} />;
      case 'firstTime':
        return <FirstTimeDonationCard key={item.id} data={item} />;
      case 'volunteer': // Add case for volunteer
        return <VolunteerCard key={item.id} data={item} />;
      default:
        return <View key={item.id}><Text>Unknown Post Type</Text></View>;
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!post) {
    return (
      <View style={styles.loaderContainer}>
        <Text>No post found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Icon name="arrow-back" size={30} color="#000" />
      </TouchableOpacity>
      <View style={styles.cardContainer}>
        {renderCard(post)}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    padding: 10,
    borderRadius: 5,
  },
  cardContainer: {
    width: '90%',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});

export default SinglePostScreen;
