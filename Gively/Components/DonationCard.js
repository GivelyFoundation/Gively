import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../services/AuthContext';
import { firestore } from '../services/firebaseConfig';
import { collection, doc, getDoc, getDocs, query, where, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { cardStyles } from '../stylesfolder/cardStyles';
import { formatDate } from '../utilities/dateFormatter';

const likeIcon = require('../assets/Icons/heart.png');
const profilePicture = require('../assets/Images/profileDefault.png');

const DonationCard = ({ data }) => {
  const { userData, loading } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(data.Likers.length);
  const [postId, setPostId] = useState("");

  useEffect(() => {
    getPostDocumentIdById(data.id);
  }, [data.id]);

  useEffect(() => {
    const checkIfLiked = async () => {
      if (userData && postId) {
        const liked = await hasUserLikedPost(postId, userData.uid);
        setIsLiked(liked);
      }
    };
    if (!loading && postId) {
      checkIfLiked();
    }
  }, [userData, postId, loading]);

  const getPostDocumentIdById = async (id) => {
    const postsRef = collection(firestore, "Posts");
    const q = query(postsRef, where('id', '==', id));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      querySnapshot.forEach(doc => {
        setPostId(doc.id);
      });
    }
  };

  const handleLikeToggle = async () => {
    try {
      if (!userData) {
        console.log("User data is not loaded yet");
        return;
      }

      if (isLiked) {
        await unlikePost(postId, userData.uid);
        setIsLiked(false);
        setLikesCount(likesCount - 1);
      } else {
        await likePost(postId, userData.uid, userData.username);
        setIsLiked(true);
        setLikesCount(likesCount + 1);
      }
    } catch (error) {
      console.error("Failed to like/unlike post: ", error);
      Alert.alert(
        "Error",
        "There was an error updating your like status. Please try again.",
        [{ text: "OK" }]
      );
    }
  };

  const renderOthersElement = () => {
    const firstDonor = data.otherDonationUsers[0];
    switch (data.otherDonationUsers.length) {
      case 0:
        return null;
      case 1:
        const parts = firstDonor.split(' ');
        return (
          <View style={styles.row}>
            <Image source={profilePicture} style={styles.profilePicture} />
            <Text style={{ fontFamily: 'Montserrat-Medium' }}>
              <Text style={{ fontFamily: 'Montserrat-Bold' }}>{parts[0]}</Text> {parts.slice(1).join(' ')} Donated too!
            </Text>
          </View>
        );
      default:
        return (
          <View style={styles.row}>
            <Image source={profilePicture} style={styles.profilePicture} />
            <Text style={{ fontFamily: 'Montserrat-Medium' }}>
              <Text style={{ fontFamily: 'Montserrat-Bold' }}>{firstDonor}</Text> and {data.otherDonationUsers.length - 1} others Donated!
            </Text>
          </View>
        );
    }
  };

  return (
    <View style={cardStyles.card}>
      <View style={cardStyles.header}>
        <Image source={data.originalPosterProfileImage} style={cardStyles.profileImage} />
        <View style={cardStyles.posterInfo}>
          <Text style={cardStyles.posterName}>
            <Text style={{ fontFamily: 'Montserrat-Bold' }}>{data.originalDonationPoster}</Text>
            <Text style={{ fontFamily: 'Montserrat-Medium' }}> donated to </Text>
            <Text style={{ fontFamily: 'Montserrat-Bold' }}>{data.charityName}</Text>
          </Text>
          <Text style={cardStyles.posterDate}>{formatDate(data.date)}</Text>
        </View>
      </View>

      <Text style={cardStyles.postText}>{data.postText}</Text>
      <View style={cardStyles.footer}>
        {renderOthersElement()}
        <View style={styles.likesContainer}>
          <TouchableOpacity style={styles.likesContainer} onPress={handleLikeToggle}>
            <Image source={likeIcon} style={[styles.likeIcon, { tintColor: isLiked ? '#EB5757' : '#8484A9' }]} />
            <Text style={[styles.likes, { fontFamily: 'Montserrat-Medium', color: isLiked ? '#EB5757' : '#8484A9' }]}>{likesCount}</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={cardStyles.button}>
          <Text style={cardStyles.buttonText}>Donate</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  profilePicture: {
    width: 20,
    height: 20,
    borderRadius: 25,
    marginRight: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  likesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeIcon: {
    width: 24,
    height: 24,
    marginRight: 5
  },
  likes: {
    fontSize: 16
  },
});

export default DonationCard;