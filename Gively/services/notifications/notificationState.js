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
    writeBatch,
    serverTimestamp 
} from 'firebase/firestore';
import { firestore } from '../firebaseConfig';
// import createLogger from '../../utils/logger';
import { displayService } from './displayService';

// const logger = createLogger('notificationState');

const NOTIFICATION_LIMIT = 20;

class NotificationState {
    constructor() {
        this.unsubscribeFirestore = null;
        this.listeners = new Set();
        this.lastVisible = null;
        this.hasMore = true;
        this.loading = false;
    }

    async initialize(userId) {
        try {
            if (!userId) {
                throw new Error('userId is required for notification state initialization');
            }

            // Setup real-time listener for new notifications
            this.setupNotificationListener(userId);
            
            // Load initial notifications
            await this.loadNotifications(userId);
            

            console.log('Notification state initialized');
        } catch (error) {
            console.error('Error initializing notification state:', error);
            throw error;
        }
    }

    setupNotificationListener(userId) {
        // Clean up existing listener
        if (this.unsubscribeFirestore) {
            this.unsubscribeFirestore();
        }

        const notificationsRef = collection(firestore, 'notifications');
        const q = query(
            notificationsRef,
            where('recipientId', '==', userId),
            orderBy('timestamp', 'desc'),
            limit(NOTIFICATION_LIMIT)
        );

        this.unsubscribeFirestore = onSnapshot(q, 
            (snapshot) => {
                snapshot.docChanges().forEach(change => {
                    const notification = {
                        id: change.doc.id,
                        ...change.doc.data()
                    };

                    if (change.type === 'added') {
                        this.handleNewNotification(notification);
                    } else if (change.type === 'modified') {
                        this.handleUpdatedNotification(notification);
                    } else if (change.type === 'removed') {
                        this.handleRemovedNotification(notification.id);
                    }
                });
            },
            (error) => {
                console.error('Error in notification listener:', error);
                this.notifyListeners('error', error);
            }
        );
    }

    async loadNotifications(userId, refresh = false) {
        try {
            if (this.loading) return;
            this.loading = true;
            
            const notificationsRef = collection(firestore, 'notifications');
            console.log('notifref', notificationsRef)
            let q = query(
                notificationsRef,
                where('recipientId', '==', userId),
                orderBy('timestamp', 'desc'),
                limit(NOTIFICATION_LIMIT)
            );
            console.log('q', q)
            if (!refresh && this.lastVisible) {
                q = query(q, startAfter(this.lastVisible));
            }

            const querySnapshot = await getDocs(q);
            const notifications = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            console.log('notifications', notifications)

            this.lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
            this.hasMore = notifications.length === NOTIFICATION_LIMIT;

            if (refresh) {
                this.notifyListeners('refresh', notifications);
            } else {
                this.notifyListeners('load', notifications);
            }

            await this.updateUnreadCount(notifications, userId);

            return {
                notifications,
                hasMore: this.hasMore
            };

        } catch (error) {
            console.error('Error loading notifications:', error);
            this.notifyListeners('error', error);
            throw error;
        } finally {
            this.loading = false;
        }
    }

    async markAsRead(notificationIds, userId) {
        try {
            const batch = writeBatch(firestore);
            
            notificationIds.forEach(id => {
                const notificationRef = doc(firestore, 'notifications', id);
                batch.update(notificationRef, {
                    read: true,
                    readAt: serverTimestamp()
                });
            });

            const userRef = doc(firestore, 'users', userId);
            batch.update(userRef, {
                lastNotificationRead: serverTimestamp()
            });

            await batch.commit();
            
            // Update local state
            this.notifyListeners('markRead', notificationIds);
            
            // Update badge count
            // await this.updateUnreadCount();

            console.log('Notifications marked as read', { count: notificationIds.length });
        } catch (error) {
            console.error('Error marking notifications as read:', error);
            throw error;
        }
    }

    async updateUnreadCount(notifications = null, userId) {
        // try {
        //     let unreadCount;
        //     if (notifications) {
        //         unreadCount = notifications.filter(n => !n.read).length;
        //     } else {
        //         // Get count from Firestore if notifications not provided
        //         const notificationsRef = collection(firestore, 'notifications');
               
        //         const q = query(
        //             notificationsRef,
        //             where('recipientId', '==', userId),
        //             where('read', '==', false)
        //         );
        //         const snapshot = await getDocs(q);
        //         unreadCount = snapshot.size;
        //     }

        //     await displayService.setBadgeCount(unreadCount);
        //     this.notifyListeners('unreadCount', unreadCount);

        //     return unreadCount;
        // } catch (error) {
        //     console.error('Error updating unread count:', error);
        // }
    }

    addListener(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    notifyListeners(type, data) {
        this.listeners.forEach(listener => {
            try {
                listener(type, data);
            } catch (error) {
                console.error('Error in notification listener:', error);
            }
        });
    }

    handleNewNotification(notification) {
        this.notifyListeners('new', notification);
        this.updateUnreadCount();
    }

    handleUpdatedNotification(notification) {
        this.notifyListeners('update', notification);
    }

    handleRemovedNotification(notificationId) {
        this.notifyListeners('remove', notificationId);
    }

    cleanup() {
        if (this.unsubscribeFirestore) {
            this.unsubscribeFirestore();
        }
        this.listeners.clear();
        this.lastVisible = null;
        this.hasMore = true;
        this.loading = false;
        console.log('Notification state cleaned up');
    }
}

export const notificationState = new NotificationState();