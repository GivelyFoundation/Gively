import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../services/AuthContext';
import { firestore } from '../services/firebaseConfig';
import { collection, query, orderBy, onSnapshot, getDoc, doc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { followUser, unfollowUser } from '../services/followService';

const NotificationsScreen = () => {
    const { userData } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const navigation = useNavigation();
    const [isFollowing, setIsFollowing] = useState(false);

    useEffect(() => {
        if (!userData) return;

        const fetchNotifications = async () => {
            const notificationsRef = collection(firestore, 'users', userData.uid, 'notifications');
            const q = query(notificationsRef, orderBy('timestamp', 'desc'));

            const unsubscribe = onSnapshot(q, async (querySnapshot) => {
                const notificationsList = await Promise.all(
                    querySnapshot.docs.map(async (docSnapshot) => {
                        const data = docSnapshot.data();
                        const userRef = doc(firestore, 'users', data.user);
                        const userDoc = await getDoc(userRef);
                        const userProfile = userDoc.exists() ? userDoc.data() : {};

                        return {
                            id: docSnapshot.id,
                            ...data,
                            profilePicture: userProfile.profilePicture || 'default_profile_picture_url', // Replace with default if needed
                        };
                    })
                );
                setNotifications(notificationsList);
            });

            return () => unsubscribe();
        };

        fetchNotifications();
    }, [userData]);

    const formatDate = (timestamp) => {
        const date = new Date(timestamp.toDate());
        const optionsDate = { weekday: 'short', month: 'short', day: 'numeric' };
        const formattedDate = date.toLocaleDateString('en-US', optionsDate);
        const optionsTime = { hour: 'numeric', minute: 'numeric', hour12: true };
        const formattedTime = date.toLocaleTimeString('en-US', optionsTime);
        return `${formattedDate} • ${formattedTime}`;
    };

    const renderItem = ({ item }) => {
        const handleFollowPress = async () => {
            console.log("userID: " + userData.uid)
            console.log("user " + userData.username)
            console.log("followedID: " + item.user)
            if (isFollowing) {
                await unfollowUser(userData.uid, item.user);
                setIsFollowing(false);
            } else {
                await followUser(userData.uid, item.user);
                setIsFollowing(true);
                sendFollowNotification(userData.uid, userData.username, item.user)
            }
        };
        if (item.type === 'like') {
            return (
                <TouchableOpacity
                    style={styles.notificationItem}
                    onPress={() => navigation.navigate('SinglePostScreen', { postId: item.postId })}
                >
                    <Image source={{ uri: item.profilePicture }} style={styles.profilePicture} />
                    <View style={styles.notificationText}>
                        <Text style={[styles.title, { fontFamily: 'Montserrat-Medium' }]}>{item.message}</Text>
                        <Text style={[styles.timestamp, { fontFamily: 'Montserrat-Medium' }]}>{formatDate(item.timestamp)}</Text>
                    </View>
                </TouchableOpacity>
            );
        } else if (item.type === 'follow') {
            console.log(item)
            return (
                <View style={styles.notificationItem}>
                    <Image source={{ uri: item.profilePicture }} style={styles.profilePicture} />
                    <View style={styles.notificationText}>
                        <Text style={[styles.title, { fontFamily: 'Montserrat-Medium' }]}>{item.message}</Text>
                        <Text style={[styles.timestamp, { fontFamily: 'Montserrat-Medium' }]}>{formatDate(item.timestamp)}</Text>
                    </View>
                    <TouchableOpacity style={styles.followButton} onPress={handleFollowPress}>
                        <Text style={[styles.followButtonText, { fontFamily: 'Montserrat-Medium' }]}>{isFollowing ? 'Unfollow' : 'Follow'}</Text>
                    </TouchableOpacity>
                </View>
            );
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-back" size={30} color="#000" />
                </TouchableOpacity>
                <Text style={[styles.headerText, { fontFamily: 'Montserrat-Medium' }]}>Notifications</Text>
            </View>

            <FlatList
                data={notifications}
                renderItem={renderItem}
                keyExtractor={item => item.id}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 60,
        paddingHorizontal: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    backButton: {
        marginRight: 16,
    },
    headerText: {
        flex: 1,
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'right',
    },
    notificationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    profilePicture: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 16,
    },
    notificationText: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    timestamp: {
        fontSize: 12,
        color: '#999',
        marginTop: 4,
    },
    followButton: {
        backgroundColor: '#3FC032',
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 15,
    },
    followButtonText: {
        color: '#fff',
        fontSize: 14,
    }
});

export default NotificationsScreen;
