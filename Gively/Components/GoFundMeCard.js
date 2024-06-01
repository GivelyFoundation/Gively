import 'firebase/firestore';
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, Dimensions } from 'react-native';
import { LinkPreview } from '@flyerhq/react-native-link-preview';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../services/AuthContext';
import { firestore } from '../services/firebaseConfig';
import { collection, doc, getDoc, getDocs, query, where, updateDoc, arrayUnion, arrayRemove, addDoc, serverTimestamp } from 'firebase/firestore';

import { getUserByUsername } from '../services/userService';

const likeIcon = require('../assets/Icons/heart.png');

const screenWidth = Dimensions.get('window').width; // Get screen width

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
    return likers.includes(userId);
};

const unlikePost = async (postId, userId) => {
    const postRef = doc(firestore, 'Posts', postId);
    console.log("Unliking post for user:", userId);
    await updateDoc(postRef, {
        Likers: arrayRemove(userId)
    });
    console.log("Post unliked successfully for user:", userId);
};

const removeNotification = async (postOwnerId, notificationId) => {
    const notificationsRef = collection(firestore, 'users', postOwnerId, 'notifications');
    const q = query(notificationsRef, where("notificationId", "==", notificationId));

    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
        querySnapshot.forEach(async (doc) => {
            console.log("Removing notification with ID:", notificationId);
            await deleteDoc(doc.ref);
            console.log("Notification removed successfully");
        });
    } else {
        console.log("No notification found with ID:", notificationId);
    }
};

const handleUnlikePost = async (postId, userId, notificationId, postOwnerId) => {
    try {
        await unlikePost(postId, userId);
        await removeNotification(postOwnerId, notificationId);
        console.log("Post unliked and notification removed for user:", userId);
    } catch (error) {
        console.error("Failed to unlike post and remove notification:", error);
    }
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
        type: "like",
        notificationId: postId+userId
    }
    await addDoc(collection(firestore, 'users', postOwnerId, 'notifications'), notification);
    console.log("notification sent")

    console.log("Post liked successfully for user:", userId);
};

export const GoFundMeCard = ({ data = {} }) => {
    const [postOwnerId, setPostOwnerId] = useState(null);
    const [user, setUser] = useState(null);
    const { userData, loading } = useAuth();
    const [isLiked, setIsLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(data.Likers.length);
    const [postId, setPostId] = useState("");
    const navigation = useNavigation();

    const getPostDocumentIdById = async (id) => {
        const postsRef = collection(firestore, "Posts");
        const q = query(postsRef, where('id', '==', id));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            querySnapshot.forEach(doc => {
                console.log('Document ID:', doc.id);
                setPostId(doc.id);
                const postData = doc.data();
                console.log("___________________________")
                console.log(postData)
                console.log("___________________________")
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
                const notId = postId+userData.uid
                await handleUnlikePost(postId, userData.uid, notId,postOwnerId )
                setIsLiked(false);
                setLikesCount(likesCount - 1);
                console.log("Post unliked successfully");
            } else {
                console.log("Like post initiated");
                console.log("postId: "+postId )
                console.log("userData.uid: "+userData.uid )
                console.log("userData.username: "+ userData.username )
                console.log("postOwnerId "+postOwnerId)

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
                    <TouchableOpacity onPress={handleNamePress}>
                        <Image source={{ uri: data.originalPosterProfileImage }} style={styles.profileImage} />
                    </TouchableOpacity>
                    <View style={styles.posterInfo}>
                        <View style={styles.column}>
                            <View style={styles.nameContainer}>
                                <TouchableOpacity onPress={handleNamePress}>
                                    <Text style={[styles.boldText, { fontFamily: 'Montserrat-Bold' }]}>{formattedName}</Text>
                                </TouchableOpacity>
                                <Text style={{ fontFamily: 'Montserrat-Medium' }}> shared this GoFundMe:</Text>
                            </View>
                            <Text style={[styles.posterDate, { fontFamily: 'Montserrat-Medium' }]}>{formatDate(data.date)}</Text>
                        </View>
                    </View>
                </View>
                <Text style={[styles.postText, { fontFamily: 'Montserrat-Medium' }]}>{data.postText}</Text>
                <View style={styles.linkView}>
                    <LinkPreview text={data.Link} />
                </View>
                <View style={styles.footer}>
                    <TouchableOpacity style={styles.likesContainer} onPress={handleLikeToggle}>
                        <Image source={likeIcon} style={[styles.likeIcon, { tintColor: isLiked ? '#EB5757' : '#8484A9' }]} />
                        <Text style={[styles.likes, { fontFamily: 'Montserrat-Medium', color: isLiked ? '#EB5757' : '#8484A9' }]}>{likesCount}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button}>
                        <Text style={styles.buttonText}>Share GoFundMe</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    cardContainer: {
        width: screenWidth - 20, // Set width to screen width with some padding
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
        marginRight: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        alignSelf: 'center',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
    },
    linkView: {
        paddingRight: 10,
    },
    boldText: {
        fontSize: 16,
    },
    nameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
});

export default GoFundMeCard;
