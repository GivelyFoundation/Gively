import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { doc, getDoc, collection, query, orderBy, limit, onSnapshot, getDocs } from "firebase/firestore";
import { firestore } from '../services/firebaseConfig';
import { useAuth } from '../services/AuthContext';

const CustomHeader = () => {
  const navigation = useNavigation();
  const { userData } = useAuth();
  const [hasNewNotifications, setHasNewNotifications] = useState(false);

  useEffect(() => {
    if (userData && userData.uid) {
      // Listener for user document changes
      const userRef = doc(firestore, 'users', userData.uid);
      const unsubscribeUser = onSnapshot(userRef, async (userDoc) => {
        if (userDoc.exists()) {
          const lastCheckedTime = userDoc.data().lastTimeNotificationsChecked;

          // Query the most recent notification and compare timestamps
          const notificationsRef = collection(firestore, 'users', userData.uid, 'notifications');
          const recentNotificationQuery = query(notificationsRef, orderBy('timestamp', 'desc'), limit(1));
          const recentNotificationSnapshot = await getDocs(recentNotificationQuery);

          if (!recentNotificationSnapshot.empty) {
            const mostRecentNotification = recentNotificationSnapshot.docs[0];
            const mostRecentNotificationTimestamp = mostRecentNotification.data().timestamp;

            // Compare timestamps
            setHasNewNotifications(mostRecentNotificationTimestamp.toMillis() > (lastCheckedTime ? lastCheckedTime.toMillis() : 0));
          } else {
            setHasNewNotifications(false);
          }
        }
      });

      // Listener for notifications collection changes
      const notificationsRef = collection(firestore, 'users', userData.uid, 'notifications');
      const unsubscribeNotifications = onSnapshot(notificationsRef, async () => {
        // Re-check for new notifications when the notifications collection changes
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const lastCheckedTime = userDoc.data().lastTimeNotificationsChecked;
          const recentNotificationQuery = query(notificationsRef, orderBy('timestamp', 'desc'), limit(1));
          const recentNotificationSnapshot = await getDocs(recentNotificationQuery);

          if (!recentNotificationSnapshot.empty) {
            const mostRecentNotification = recentNotificationSnapshot.docs[0];
            const mostRecentNotificationTimestamp = mostRecentNotification.data().timestamp;

            // Compare timestamps
            setHasNewNotifications(mostRecentNotificationTimestamp.toMillis() > (lastCheckedTime ? lastCheckedTime.toMillis() : 0));
          } else {
            setHasNewNotifications(false);
          }
        }
      });

      // Cleanup on unmount
      return () => {
        unsubscribeUser();
        unsubscribeNotifications();
      };
    }
  }, [userData]);

  return (
    <View style={styles.headerContainer}>
      <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())} style={styles.menuButton}>
        <Icon name="menu" size={30} color='#1C5AA3' />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Notifications')} style={styles.notificationButton}>
        <Icon name="notifications" size={30} color='#3FC032' />
        {hasNewNotifications && <View style={styles.dot} />}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    paddingTop: 60,
    backgroundColor: '#fff',
  },
  menuButton: {
    paddingLeft: 10,
  },
  notificationButton: {
    paddingRight: 10,
    position: 'relative',
  },
  dot: {
    position: 'absolute',
    right: 10,
    top: 6,
    backgroundColor: '#FF0000',
    borderRadius: 6,
    width: 12,
    height: 12,
  },
});

export default CustomHeader;
