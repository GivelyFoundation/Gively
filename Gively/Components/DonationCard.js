import React, { useState, useEffect, useCallback, memo } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../services/AuthContext';
import { firebaseService } from '../services/firebaseService';
import { cardStyles } from '../styles/cardStyles';
import UserHeader from './UserHeader';
import LikeButton from './LikeButton';


// Memoize child components
const MemoizedUserHeader = memo(UserHeader);
const MemoizedLikeButton = memo(LikeButton);

// Memoize the OthersElement component
const OthersElement = memo(({ otherDonationUsers }) => {
  if (otherDonationUsers.length === 0) return null;

  const firstDonor = otherDonationUsers[0];
  const parts = firstDonor.split(' ');

  if (otherDonationUsers.length === 1) {
    return (
      <View style={styles.row}>
        <Image source={profilePicture} style={styles.profilePicture} />
        <Text style={{ fontFamily: 'Montserrat-Medium' }}>
          <Text style={{ fontFamily: 'Montserrat-Bold' }}>{parts[0]}</Text> {parts.slice(1).join(' ')} Donated too!
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.row}>
      <Image source={profilePicture} style={styles.profilePicture} />
      <Text style={{ fontFamily: 'Montserrat-Medium' }}>
        <Text style={{ fontFamily: 'Montserrat-Bold' }}>{firstDonor}</Text> and {otherDonationUsers.length - 1} others Donated!
      </Text>
    </View>
  );
});

const DonationCard = memo(({ data }) => {
  const { userData } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState((data?.Likers || []).length);

  useEffect(() => {
    const checkIfLiked = async () => {
      if (userData?.uid && data?.id) {
        try {
          const liked = await firebaseService.hasUserLikedPost(data.id, userData.uid);
          setIsLiked(liked);
        } catch (error) {
          console.error('Error checking like status:', error);
          setIsLiked(false);
        }
      }
    };
    checkIfLiked();
  }, [userData?.uid, data?.id]);

  const handleLikeToggle = useCallback(async () => {
    try {
      if (!userData?.uid || !data?.id) {
        console.log("Required data not available");
        return;
      }

      if (isLiked) {
        await firebaseService.unlikePost(data.id, userData.uid);
        await firebaseService.removeNotification(data.uid, data.id + userData.uid);
        setIsLiked(false);
        setLikesCount(prev => Math.max(0, prev - 1));
      } else {
        await firebaseService.likePost(data.id, userData.uid, userData.username, data.uid);
        setIsLiked(true);
        setLikesCount(prev => prev + 1);
      }
    } catch (error) {
      console.error("Failed to like/unlike post: ", error);
      Alert.alert(
        "Error",
        "There was an error updating your like status. Please try again.",
        [{ text: "OK" }]
      );
    }
  }, [isLiked, userData?.uid, userData?.username, data?.id, data?.uid]);

  const user = data.posterData || {
    displayName: 'Deleted User',
    profilePicture: null,
    username: 'deleted_user'
  };

  if (!user) return null;

  return (
    <View style={cardStyles.card}>
      <MemoizedUserHeader 
        user={user} 
        date={data.date} 
        action={`donated to ${data.charityName}`}
      />
      <Text style={cardStyles.postText}>{data.postText}</Text>
      <View style={styles.footer}>
        <OthersElement otherDonationUsers={data.otherDonationUsers || []} />
        <MemoizedLikeButton 
          isLiked={isLiked}
          likesCount={likesCount}
          onPress={handleLikeToggle}
        />
        <TouchableOpacity style={cardStyles.button}>
          <Text style={cardStyles.buttonText}>Donate</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for memo
  return (
    prevProps.data.id === nextProps.data.id &&
    prevProps.data.postText === nextProps.data.postText &&
    prevProps.data.charityName === nextProps.data.charityName &&
    prevProps.data.date === nextProps.data.date &&
    prevProps.data.Likers?.length === nextProps.data.Likers?.length &&
    prevProps.data.posterData?.username === nextProps.data.posterData?.username &&
    prevProps.data.otherDonationUsers?.length === nextProps.data.otherDonationUsers?.length
  );
});

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
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

export default DonationCard;