import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { getUserByUsername } from '../services/userService';
import { useAuth } from '../services/AuthContext';
import { firestore } from '../services/firebaseConfig';
import { collection, doc, getDoc, getDocs, query, where, updateDoc, arrayUnion, arrayRemove, addDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
const screenWidth = Dimensions.get('window').width; // Get screen width

const likeIcon = require('../assets/Icons/heart.png');
const welcome = require('../assets/Images/Welcome.png');

const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const optionsDate = { weekday: 'short', month: 'short', day: 'numeric' };
    const formattedDate = date.toLocaleDateString('en-US', optionsDate);
    const optionsTime = { hour: 'numeric', minute: 'numeric', hour12: true };
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

const likePost = async (postId, userId, username, postOwnerId) => {
    const postRef = doc(firestore, 'Posts', postId);
    console.log("Liking post for user:", userId);
    await updateDoc(postRef, {
        Likers: arrayUnion(userId)
    });
    const notification = {
        message: `${username} liked your post!`,
        timestamp: serverTimestamp(),
        postId: postId,
        user: userId,
        type: "like"
    }
    await addDoc(collection(firestore, 'users', postOwnerId, 'notifications'), notification);
    console.log("notification sent")

    console.log("Post liked successfully for user:", userId);
};

const FirstTimeDonationCard = ({ data }) => {
    const [postOwnerId, setPostOwnerId] = useState(null);
    const [user, setUser] = useState(null);
    const { userData, loading } = useAuth();
    const [isLiked, setIsLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(data.Likers.length);
    const [postId, setPostId] = useState("");
    const navigation = useNavigation();

    console.log(data.Likers.length)
    const getPostDocumentIdById = async (id) => {
        const postsRef = collection(firestore, "Posts");
        const q = query(postsRef, where('id', '==', id));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            querySnapshot.forEach(doc => {
                console.log('Document ID:', doc.id);
                setPostId(doc.id);
                const postData = doc.data();
                setPostOwnerId(postData.uid);  // Set the post owner ID from the post data
                setLikesCount(postData.Likers.length);
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
    }, [data.id]);

    useEffect(() => {
        if (postOwnerId) {
            getUserDocumentById(postOwnerId);
        }
    }, [postOwnerId]);

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
                await likePost(postId, userData.uid, userData.username, postOwnerId);
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
        <View style={styles.card}>
            <View style={styles.header}>
                <TouchableOpacity onPress={handleNamePress}>
                    <Image source={{ uri: data.originalPosterProfileImage }} style={styles.profileImage} />
                </TouchableOpacity>
                <View style={styles.posterInfo}>
                    <View style={styles.column}>
                        <View style={styles.nameContainer}>
                            <TouchableOpacity onPress={handleNamePress}>
                                <Text style={[styles.boldText, { fontFamily: 'Montserrat-Bold' }]}>{formattedName}</Text>
                            </TouchableOpacity>
                            <Text style={{ fontFamily: 'Montserrat-Medium' }}>'s first donation is to </Text>
                            <Text style={[styles.boldText, { fontFamily: 'Montserrat-Bold' }]}>{data.charity}!</Text>
                        </View>
                        <Text style={[styles.posterDate, { fontFamily: 'Montserrat-Medium' }]}>{formatDate(data.date)}</Text>
                    </View>
                </View>
            </View>
            <Image source={welcome} style={styles.welcome} resizeMode="contain" />
            <Text style={[styles.postText, styles.welcomeText, { fontFamily: 'Montserrat-Medium' }]}>Welcome {formattedName} to Gively!!!</Text>
            <View style={styles.footer}>
                <View style={styles.likesContainer}>
                    <TouchableOpacity style={styles.likesContainer} onPress={handleLikeToggle}>
                        <Image source={likeIcon} style={[styles.likeIcon, { tintColor: isLiked ? '#EB5757' : '#8484A9' }]} />
                        <Text style={[styles.likes, { fontFamily: 'Montserrat-Medium', color: data.isLiked ? '#EB5757' : '#8484A9' }]}>{likesCount}</Text>
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
        width: screenWidth - 20,
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 15,
        marginHorizontal: 10,
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
    likes: {
        color: '#EB5757',
        fontSize: 13
    },
    button: {
        backgroundColor: '#3FC032',
        borderRadius: 7,
        padding: 10,
        paddingHorizontal: 20
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
    row: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    welcomeText: {
        alignSelf: 'center'
    },
    welcome: {
        width: 300,
        height: 150,
        marginVertical:10,
        alignSelf: 'center'
    },
    boldText: {
        fontSize: 16
    },
    nameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
});

export default FirstTimeDonationCard;
