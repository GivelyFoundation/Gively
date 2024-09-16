import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useAuth } from '../services/AuthContext';
import { firestore } from '../services/firebaseConfig';
import { collection, doc, getDoc, getDocs, query, where, updateDoc, arrayUnion, arrayRemove, serverTimestamp } from 'firebase/firestore';


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
const hasUserLikedPost = async (postId, userId) => {
  const postRef = doc(firestore, 'Posts', postId);
  const docSnapshot = await getDoc(postRef);
  const likers = docSnapshot.data().Likers || [];
  return likers.includes(userId);
};

const unlikePost = async (postId, userId) => {
  const postRef = doc(firestore, 'Posts', postId);
  console.log("Unliking post for user:", userId);
  await updateDoc(postRef, {
      Likers: arrayRemove(userId)
  });
};

const likePost = async (postId, userId, username) => {
  const postRef = doc(firestore, 'Posts', postId);
  console.log("Liking post for user:", userId, "with username:", username);
  await updateDoc(postRef, {
      Likers: arrayUnion(userId)
  });
  console.log("Post liked successfully for user:", userId);
};

const DonationCard = ({ data }) => {
  const { userData, loading } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(data.Likers.length);
  const [postId, setPostId] = useState("");

  const getPostDocumentIdById = async (id) => {
      console.log(id);
      const postsRef = collection(firestore, "Posts");
      const q = query(postsRef, where('id', '==', id));
      const querySnapshot = await getDocs(q);
      console.log(querySnapshot);
      if (!querySnapshot.empty) {
          querySnapshot.forEach(doc => {
              console.log('Document ID:', doc.id);
              setPostId(doc.id);
          });
      } else {
          console.log('No matching documents.');
      }
  };

  useEffect(() => {
      getPostDocumentIdById(data.id);
  }, [data.id]);

  useEffect(() => {
      const checkIfLiked = async () => {
          if (userData && postId) {
              console.log("Checking if user liked the post for user ID:", userData.uid);
              const liked = await hasUserLikedPost(postId, userData.uid);
              setIsLiked(liked);
              console.log("User liked status:", liked);
          }
      };
      if (!loading && postId) {
          checkIfLiked();
      }
  }, [userData, postId, loading]);

  const handleLikeToggle = async () => {
      try {
          if (!userData) {
              console.log("User data is not loaded yet");
              return;
          }

          if (isLiked) {
              console.log("Unlike post initiated");
              await unlikePost(postId, userData.uid);
              setIsLiked(false);
              setLikesCount(likesCount - 1);
              console.log("Post unliked successfully");
          } else {
              console.log("Like post initiated");
              await likePost(postId, userData.uid, userData.username);
              setIsLiked(true);
              setLikesCount(likesCount + 1);
              console.log("Post liked successfully");
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
          <TouchableOpacity  style={styles.likesContainer}  onPress={handleLikeToggle}>
          <Image source={likeIcon} style={[styles.likeIcon, {tintColor: isLiked ? '#EB5757' : '#8484A9'}]} />
          <Text style={[styles.likes, { fontFamily: 'Montserrat-Medium' , color: data.isLiked ? '#EB5757' : '#8484A9'}]}>{likesCount}</Text>
          </TouchableOpacity>
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
    width: 24,
    height: 24,
    marginRight: 5
  },
  likes :{
    color: '#EB5757',
    fontSize:16
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
likesContainer: {
  flexDirection: 'row',
  alignItems: 'center',
},
});

export default DonationCard;
