import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../services/AuthContext';
import { firestore } from '../services/firebaseConfig';
import {  collection, query, where, getDocs, doc, onSnapshot, serverTimestamp ,addDoc, deleteDoc , getDoc,orderBy } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { followUser, unfollowUser } from '../services/followService';


const formatDate = (timestamp) => {
    const date = new Date(timestamp.toDate());
    const optionsDate = { weekday: 'short', month: 'short', day: 'numeric' };
    const formattedDate = date.toLocaleDateString('en-US', optionsDate);
    const optionsTime = { hour: 'numeric', minute: 'numeric', hour12: true };
    const formattedTime = date.toLocaleTimeString('en-US', optionsTime);
    return `${formattedDate} • ${formattedTime}`;
  };

  const removeFollowNotification = async (userId, followedId) => {
    try {
   

        const notificationsRef = collection(firestore, 'users', followedId, 'notifications');
        console.log("Querying notifications for userId:", userId, "with followedId:", followedId);
        const q = query(notificationsRef, where("notificationId", "==", userId + followedId));

        const querySnapshot = await getDocs(q);
        console.log("Query executed, number of documents found:", querySnapshot.size);

        if (!querySnapshot.empty) {
            for (const doc of querySnapshot.docs) {
                console.log("Removing follow notification with ID:", userId + followedId);
                await deleteDoc(doc.ref);
                console.log("Follow notification removed successfully");
            }
        } else {
            console.log("No follow notification found with ID:", userId + followedId);
        }
    } catch (error) {
        console.error("Failed to remove follow notification:", error.code, error.message);
    }
};

const sendFollowNotification = async (userId, username, followedId) => {
    console.log("here")
    const notification = {
        message: `${username} followed you!`,
        timestamp: serverTimestamp(),
        user: userId,
        type: "follow",
        notificationId: userId + followedId
    }
    console.log(notification)
    await addDoc(collection(firestore, 'users', followedId, 'notifications'), notification);
    console.log("notification sent")
};

const NotificationItem = ({ item, navigation, isFollowing, handleFollowPress }) => {
    const handleNamePress = async () => {
        if (item.user) {
          try {
            const userRef = doc(firestore, 'users', item.user);
            const userDoc = await getDoc(userRef);
            if (userDoc.exists()) {
              const userData = userDoc.data();
              navigation.navigate('UserScreen', { user: userData });
            } else {
              console.log('User data is not available.');
            }
          } catch (error) {
            console.error('Error fetching user data:', error);
          }
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
    return (
      <View style={styles.notificationItem}>
        <TouchableOpacity onPress={handleNamePress} style={{ flexDirection: 'row', flex: 1 }}>
          <Image source={{ uri: item.profilePicture }} style={styles.profilePicture} />
          <View style={styles.notificationText}>
            <Text style={[styles.title, { fontFamily: 'Montserrat-Medium' }]}>{item.message}</Text>
            <Text style={[styles.timestamp, { fontFamily: 'Montserrat-Medium' }]}>{formatDate(item.timestamp)}</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity  style={[styles.followButton, isFollowing && styles.followingButton]} onPress={handleFollowPress}>
          <Text style={[styles.followButtonText, { fontFamily: 'Montserrat-Medium' }]}>{isFollowing ? 'Unfollow' : 'Follow'}</Text>
        </TouchableOpacity>
      </View>
    );
  }
};

const NotificationsScreen = () => {
  const { userData } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [followingState, setFollowingState] = useState({});
  const navigation = useNavigation();

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

  useEffect(() => {
    const checkFollowingStatus = async () => {
      const followingStatus = {};
      for (const notification of notifications) {
        if (notification.type === 'follow') {
          const followingRef = doc(firestore, 'users', userData.uid, 'following', notification.user);
          const followingSnapshot = await getDoc(followingRef);
          followingStatus[notification.user] = followingSnapshot.exists();
        }
      }
      setFollowingState(followingStatus);
    };
    if (notifications.length > 0) {
      checkFollowingStatus();
    }
  }, [notifications]);

  const handleFollowPress = async (userId) => {
    const currentStatus = followingState[userId];
    if (currentStatus) {
      await unfollowUser(userData.uid, userId);
      removeFollowNotification(userData.uid, userId)
    } else {
      await followUser(userData.uid, userId);
      sendFollowNotification(userData.uid, userData.username, userId)
    }
    setFollowingState((prev) => ({ ...prev, [userId]: !currentStatus }));
  };

  const renderItem = ({ item }) => {
    return (
      <NotificationItem
        item={item}
        navigation={navigation}
        isFollowing={followingState[item.user] || false}
        handleFollowPress={() => handleFollowPress(item.user)}
      />
    );
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
  followButton: {
    backgroundColor: '#3FC032',
    borderRadius: 10,
    paddingVertical: 5,
    paddingHorizontal: 20,
    width: '50%',
    marginTop: 10,
    alignSelf: 'center'
},
followingButton: {
    backgroundColor: '#1C5AA3',
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
