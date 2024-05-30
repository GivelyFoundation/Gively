import React, {useState, useEffect} from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { LinkPreview } from '@flyerhq/react-native-link-preview'
import { getUserByUsername } from '../services/userService';
import { useAuth } from '../services/AuthContext';
import { firestore } from '../services/firebaseConfig';
import { collection, doc, getDoc, getDocs, query, where, updateDoc, arrayUnion, arrayRemove, serverTimestamp } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';

const likeIcon = require('../assets/Icons/heart.png');

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
    console.log("Checking if user has liked the post:", likers.includes(userId));
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

export const PetitionCard = ({ data = {}}) => {
    const [user, setUser] = useState(null);
    const { userData, loading } = useAuth();
    const [isLiked, setIsLiked] = useState(false);
    const [likesCount, setLikesCount] = useState( data.Likers.length);
    const [postId, setPostId] = useState("");
    const navigation = useNavigation();
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

    const getUserDocumentById = async (userId) => {
        const userRef = doc(firestore, 'users', userId);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
            setUser(userDoc.data());
        } else {
            console.log('No such document!');
        }
    };

   useEffect(() => {
        getPostDocumentIdById(data.id);
        getUserDocumentById(data.uid);
    }, [data.id, data.uid]);

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
    const handleNamePress = () => {
        if (user) {
            navigation.navigate('UserScreen', { user });
        } else {
            console.log('User data is not available.');
        }
    };

    const formattedName = getFirstNameLastInitial(user.displayName);

    return (
        <View style={styles.cardContainer}>
            <View style={styles.card}>
                <View style={styles.header}>
                    <Image source={{ uri: data.originalPosterProfileImage }} style={styles.profileImage} />
                    <View style={styles.posterInfo}>
                        <View style={styles.column}>
                            <Text style={styles.posterName}>
                            <TouchableOpacity onPress={handleNamePress}>
                                <Text style={[styles.boldText, { fontFamily: 'Montserrat-Bold' }]}>{formattedName}</Text>
                                </TouchableOpacity>
                                <Text style={{ fontFamily: 'Montserrat-Medium' }}> shared this Change.org Petiton:</Text>
                            </Text>
                            <Text style={[styles.posterDate, { fontFamily: 'Montserrat-Medium' }]}>{formatDate(data.date)}</Text>
                        </View>
                    </View>
                </View>
                <Text style={[styles.postText, { fontFamily: 'Montserrat-Medium' }]}>{data.postText}</Text>
                <View style={styles.linkView}>
                    <LinkPreview text={data.Link} />
                </View>
                <View style={styles.footer}>
                    <View style={styles.likesContainer}>
                        <TouchableOpacity  style={styles.likesContainer}  onPress={handleLikeToggle}>
                        <Image source={likeIcon} style={[styles.likeIcon, { tintColor: isLiked ? '#EB5757' : '#8484A9' }]} />
                        <Text style={[styles.likes, { fontFamily: 'Montserrat-Medium', color: data.isLiked ? '#EB5757' : '#8484A9' }]}>{likesCount}</Text>
                   
                        </TouchableOpacity>
                         </View>
                    <TouchableOpacity style={styles.button}>
                        <Text style={styles.buttonText}>Share Petition</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    cardContainer: {
        width: '100%',
        marginHorizontal: 10,
        marginBottom: 20,
    },
    card: {
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 15,
        shadowColor: '#5A5A5A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
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
    likesContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    postText: {
        fontSize: 14,
        marginBottom: 10,
        lineHeight: 24,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 20,
    },
    likesContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    likeIcon: {
        width: 16,
        height: 16,
        marginRight: 5,
    },
    likes: {
        color: '#EB5757',
        fontSize: 13,
        fontFamily: 'Montserrat-Medium',
    },
    button: {
        backgroundColor: '#3FC032',
        borderRadius: 7,
        paddingVertical: 10,
        paddingHorizontal: 20,
        width: '50%',
        marginRight:10
    },
    buttonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        alignSelf: 'center'
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
    },
    linkView: {
        paddingRight: 10
    },
    boldText:{
        fontSize: 16 ,
    }
});

