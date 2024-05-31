import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../services/AuthContext';
import { firestore } from '../services/firebaseConfig';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

const NotificationsScreen = ({ navigation }) => {
  const { userData } = useAuth();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!userData) return;

    const notificationsRef = collection(firestore, 'users', userData.uid, 'notifications');
    const q = query(notificationsRef, orderBy('timestamp', 'desc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const notificationsList = [];
      querySnapshot.forEach((doc) => {
        notificationsList.push({ id: doc.id, ...doc.data() });
      });
      setNotifications(notificationsList);
    });

    return () => unsubscribe();
  }, [userData]);

  const formatDate = (timestamp) => {
    const date = new Date(timestamp.toDate());
    const optionsDate = { weekday: 'short', month: 'short', day: 'numeric' };
    const formattedDate = date.toLocaleDateString('en-US', optionsDate);
    const optionsTime = { hour: 'numeric', minute: 'numeric', hour12: true };
    const formattedTime = date.toLocaleTimeString('en-US', optionsTime);
    return `${formattedDate} • ${formattedTime}`;
  };

  const renderItem = ({ item }) => (
    <View style={styles.notificationItem}>
      <Text style={[styles.title, { fontFamily: 'Montserrat-Medium' }]}>{item.message}</Text>
      <Text style={[styles.timestamp, { fontFamily: 'Montserrat-Medium' }]}>{formatDate(item.timestamp)}</Text>
    </View>
  );

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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
    color: '#555',
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
});

export default NotificationsScreen;
