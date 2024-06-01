import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { followUser, unfollowUser } from '../services/followService';
import { useAuth } from '../services/AuthContext';
import { collection, query, where, getDocs, addDoc, deleteDoc } from 'firebase/firestore';
import { firestore } from '../services/firebaseConfig';
import { serverTimestamp } from 'firebase/firestore';

const UserCard = ({ user, onUnfollow, isCurrentUser }) => {
    const navigation = useNavigation();
    const { userData } = useAuth();
    const [isFollowing, setIsFollowing] = useState(false);
    const [followedID, setFollowedID] = useState("");

    useEffect(() => {
        setFollowedID(user.id);
    }, [user.id]);

    useEffect(() => {
        const checkIfFollowing = async () => {
            if (userData && followedID) {
                const followingRef = collection(firestore, `users/${userData.uid}/following`);
                const q = query(followingRef, where('followedUserId', '==', followedID));
                const querySnapshot = await getDocs(q);
                setIsFollowing(!querySnapshot.empty);
            }
        };
        checkIfFollowing();
    }, [userData, followedID]);

    const handleFollowPress = async () => {
        if (isFollowing) {
            await unfollowUser(userData.uid, followedID);
            await removeFollowNotification(userData.uid, followedID);
            setIsFollowing(false);
            if (onUnfollow) {
                onUnfollow(followedID);
            }
        } else {
            await followUser(userData.uid, followedID);
            await sendFollowNotification(userData.uid, userData.username, followedID);
            setIsFollowing(true);
        }
    };

    const sendFollowNotification = async (userId, username, followedId) => {
        const notification = {
            message: `${username} followed you!`,
            timestamp: serverTimestamp(),
            user: userId,
            type: "follow",
            notificationId: userId + followedId
        };
        await addDoc(collection(firestore, 'users', followedId, 'notifications'), notification);
    };

    const removeFollowNotification = async (userId, followedId) => {
        try {
            const notificationsRef = collection(firestore, 'users', followedId, 'notifications');
            const q = query(notificationsRef, where("notificationId", "==", userId + followedId));

            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                for (const doc of querySnapshot.docs) {
                    await deleteDoc(doc.ref);
                }
            }
        } catch (error) {
            console.error("Failed to remove follow notification:", error.code, error.message);
        }
    };

    return (
        <View style={styles.card}>
            <TouchableOpacity
                style={styles.userInfo}
                onPress={() => navigation.navigate('UserScreen', { user })}
            >
                <Image source={{ uri: user.profilePicture }} style={styles.profilePicture} />
                <Text style={styles.username}>{user.username}</Text>
            </TouchableOpacity>
            {!isCurrentUser && (
                <TouchableOpacity
                    style={styles.followButton}
                    onPress={handleFollowPress}
                >
                    <Text style={styles.followButtonText}>{isFollowing ? 'Unfollow' : 'Follow'}</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        margin: 10,
        borderRadius: 8,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 0 },
        elevation: 5,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    profilePicture: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 10,
    },
    username: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    followButton: {
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 5,
        backgroundColor: '#3FC032',
    },
    followButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default UserCard;
