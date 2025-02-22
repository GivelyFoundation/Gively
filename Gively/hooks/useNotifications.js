import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigation } from '@react-navigation/native';
import { fcmService } from '../services/notifications/fcmService';
import { displayService } from '../services/notifications/displayService';
import { notificationState } from '../services/notifications/notificationState';
import { useAuth } from '../services/AuthContext';
// import createLogger from '../utils/logger';

// const logger = createLogger('useNotifications');

export const useNotifications = () => {
    const { userData } = useAuth();
    const navigation = useNavigation();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const hasMore = useRef(true);

    // Initialize services and setup listeners
    useEffect(() => {
        if (!userData?.uid) return;

        const initializeNotifications = async () => {
            try {
                setLoading(true);
                setError(null);

                // Initialize services
                await fcmService.init(userData.uid);
                await displayService.initialize();
                await notificationState.initialize(userData.uid);

                // Setup notification handlers
                fcmService.setNotificationHandlers({
                    onNotificationReceived: handleNotificationReceived,
                    onNotificationResponse: handleNotificationResponse
                });

                // Setup state listener
                const unsubscribe = notificationState.addListener(handleStateUpdate);

                return () => {
                    unsubscribe();
                    cleanup();
                };
            } catch (error) {
                console.error('Error initializing notifications:', error);
                setError('Failed to initialize notifications');
            } finally {
                setLoading(false);
            }
        };

        initializeNotifications();
    }, [userData?.uid]);

    // Handle notifications when app is in foreground
    const handleNotificationReceived = useCallback(async (notification) => {
        try {
            // Display the notification
            await displayService.displayNotification(notification);
        } catch (error) {
            console.error('Error handling received notification:', error);
        }
    }, []);

    // Handle notification taps
    const handleNotificationResponse = useCallback((notification) => {
        try {
            const { screen, params } = displayService.parseNotificationAction(notification);
            if (screen) {
                navigation.navigate(screen, params);
            }
        } catch (error) {
            console.error('Error handling notification response:', error);
        }
    }, [navigation]);

    // Handle state updates from notificationState
    const handleStateUpdate = useCallback((type, data) => {
        switch (type) {
            case 'refresh':
                setNotifications(data);
                setRefreshing(false);
                break;

            case 'load':
                setNotifications(prev => [...prev, ...data]);
                break;

            case 'new':
                setNotifications(prev => [data, ...prev]);
                break;

            case 'update':
                setNotifications(prev => 
                    prev.map(notification => 
                        notification.id === data.id ? data : notification
                    )
                );
                break;

            case 'remove':
                setNotifications(prev => 
                    prev.filter(notification => notification.id !== data)
                );
                break;

            case 'unreadCount':
                setUnreadCount(data);
                break;

            case 'error':
                setError(data.message);
                break;
        }
    }, []);

    // Refresh notifications
    const refresh = async () => {
        if (!userData?.uid || refreshing) return;

        try {
            setRefreshing(true);
            setError(null);
            const { notifications: newNotifications, hasMore: more } = 
                await notificationState.loadNotifications(userData.uid, true);
            hasMore.current = more;
        } catch (error) {
            console.error('Error refreshing notifications:', error);
            setError('Failed to refresh notifications');
        } finally {
            setRefreshing(false);
        }
    };

    // Load more notifications
    const loadMore = async () => {
        if (!userData?.uid || loading || !hasMore.current) return;

        try {
            setLoading(true);
            const { notifications: newNotifications, hasMore: more } = 
                await notificationState.loadNotifications(userData.uid);
            hasMore.current = more;
        } catch (error) {
            console.error('Error loading more notifications:', error);
            setError('Failed to load more notifications');
        } finally {
            setLoading(false);
        }
    };

    // Mark notifications as read
    const markAsRead = async (notificationIds) => {
        if (!userData?.uid || !notificationIds.length) return;

        try {
            await notificationState.markAsRead(notificationIds, userData.uid);
        } catch (error) {
            console.error('Error marking notifications as read:', error);
            setError('Failed to mark notifications as read');
        }
    };

    // Cleanup function
    const cleanup = useCallback(() => {
        fcmService.cleanup();
        notificationState.cleanup();
    }, []);

    return {
        notifications,
        loading,
        refreshing,
        error,
        unreadCount,
        hasMore: hasMore.current,
        refresh,
        loadMore,
        markAsRead
    };
};