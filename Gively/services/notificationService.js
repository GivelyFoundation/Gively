import { firestore } from './firebaseConfig';
import { 
    collection, 
    query, 
    where, 
    orderBy, 
    limit, 
    getDocs,
    doc,
    updateDoc,
    onSnapshot,
    startAfter,
    serverTimestamp
} from 'firebase/firestore';
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';

class NotificationService {
    constructor() {
        this.fcmToken = null;
        this.notificationListeners = new Map();
        this.lastNotificationTime = null;
        this.NOTIFICATION_LIMIT = 20;
    }

    async initialize(userId) {
        try {
            await this.requestPermission();
            await this.setupFCMToken(userId);
            await this.setupNotificationListeners(userId);
        } catch (error) {
            console.error('Error initializing notification service:', error);
            throw error;
        }
    }

    async requestPermission() {
        try {
            const authStatus = await messaging().requestPermission();
            const enabled =
                authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
                authStatus === messaging.AuthorizationStatus.PROVISIONAL;

            if (!enabled) {
                console.log('User notification permissions rejected');
            }
            return enabled;
        } catch (error) {
            console.error('Error requesting notification permission:', error);
            return false;
        }
    }

    async setupFCMToken(userId) {
        try {
            // Check if we have a stored token
            const storedToken = await AsyncStorage.getItem('fcmToken');
            
            // Get the FCM token
            const fcmToken = await messaging().getToken();

            // If token has changed, update it
            if (fcmToken !== storedToken) {
                await AsyncStorage.setItem('fcmToken', fcmToken);
                await this.updateUserFCMToken(userId, fcmToken);
            }

            this.fcmToken = fcmToken;
        } catch (error) {
            console.error('Error setting up FCM token:', error);
            throw error;
        }
    }

    async updateUserFCMToken(userId, token) {
        try {
            const userRef = doc(firestore, 'users', userId);
            await updateDoc(userRef, {
                fcmToken: token
            });
        } catch (error) {
            console.error('Error updating user FCM token:', error);
            throw error;
        }
    }

    async setupNotificationListeners(userId) {
        // Foreground message handling
        this.removeMessageListener = messaging().onMessage(async remoteMessage => {
            this.handleForegroundMessage(remoteMessage);
        });

        // Background/quit state message handling
        messaging().setBackgroundMessageHandler(async remoteMessage => {
            this.handleBackgroundMessage(remoteMessage);
        });

        // Token refresh handling
        messaging().onTokenRefresh(async token => {
            await this.updateUserFCMToken(userId, token);
            await AsyncStorage.setItem('fcmToken', token);
            this.fcmToken = token;
        });

        // Set up Firestore listener for real-time notifications
        this.setupFirestoreListener(userId);
    }

    setupFirestoreListener(userId) {
        const notificationsRef = collection(firestore, 'notifications');
        const q = query(
            notificationsRef,
            where('recipientId', '==', userId),
            orderBy('lastUpdated', 'desc'),
            limit(this.NOTIFICATION_LIMIT)
        );

        this.unsubscribeFirestore = onSnapshot(q, (snapshot) => {
            snapshot.docChanges().forEach(change => {
                if (change.type === 'added' || change.type === 'modified') {
                    this.handleNewNotification(change.doc.data());
                }
            });
        }, error => {
            console.error('Error in Firestore notification listener:', error);
        });
    }

    handleForegroundMessage(remoteMessage) {
        // Handle the notification based on its type
        const { type, postId, groupId } = remoteMessage.data;
        
        switch (type) {
            case 'like':
                // Handle like notification
                break;
            case 'follow':
                // Handle follow notification
                break;
            // Add other notification types as needed
        }

        // Notify any registered listeners
        this.notifyListeners(remoteMessage);
    }

    handleBackgroundMessage(remoteMessage) {
        // Handle background notifications
        return Promise.resolve();
    }

    handleNewNotification(notification) {
        // Process new notifications from Firestore
        this.notifyListeners({
            type: 'notification',
            data: notification
        });
    }

    // Add a listener for notifications
    addListener(listener) {
        const id = Math.random().toString(36).substr(2, 9);
        this.notificationListeners.set(id, listener);
        return id;
    }

    // Remove a listener
    removeListener(id) {
        this.notificationListeners.delete(id);
    }

    // Notify all listeners
    notifyListeners(data) {
        this.notificationListeners.forEach(listener => {
            listener(data);
        });
    }

    // Fetch notifications manually (for pull-to-refresh, etc.)
    async fetchNotifications(userId, lastVisible = null) {
        try {
            const notificationsRef = collection(firestore, 'notifications');
            let q = query(
                notificationsRef,
                where('recipientId', '==', userId),
                orderBy('lastUpdated', 'desc'),
                limit(this.NOTIFICATION_LIMIT)
            );

            if (lastVisible) {
                q = query(q, startAfter(lastVisible));
            }

            const querySnapshot = await getDocs(q);
            const notifications = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            return {
                notifications,
                lastVisible: querySnapshot.docs[querySnapshot.docs.length - 1]
            };
        } catch (error) {
            console.error('Error fetching notifications:', error);
            throw error;
        }
    }

    // Mark notifications as read
    async markAsRead(notificationIds, userId) {
        try {
            const batch = firestore.batch();
            
            notificationIds.forEach(id => {
                const notificationRef = doc(firestore, 'notifications', id);
                batch.update(notificationRef, {
                    read: true,
                    readAt: serverTimestamp()
                });
            });

            await batch.commit();

            // Update user's last read time
            const userRef = doc(firestore, 'users', userId);
            await updateDoc(userRef, {
                lastNotificationRead: serverTimestamp()
            });
        } catch (error) {
            console.error('Error marking notifications as read:', error);
            throw error;
        }
    }

    // Clean up listeners when service is no longer needed
    cleanup() {
        if (this.removeMessageListener) {
            this.removeMessageListener();
        }
        if (this.unsubscribeFirestore) {
            this.unsubscribeFirestore();
        }
        this.notificationListeners.clear();
    }
}

export const notificationService = new NotificationService();