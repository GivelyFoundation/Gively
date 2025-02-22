import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { doc, updateDoc } from 'firebase/firestore';
import { firestore } from '../firebaseConfig';
// import createLogger from '../../utils/logger';

// const logger = createLogger('fcmService');

class FCMService {
    constructor() {
        this.initialized = false;
        this.notificationListener = null;
        this.responseListener = null;
        this.onNotificationReceived = null;
        this.onNotificationResponse = null;
    }

    async init(userId) {
        if (!userId) {
            console.error('userId is required for FCM initialization');
            return;
        }

        try {
            // Configure how notifications are handled
            await this.configureNotifications();

            // Request permissions and get token
            const token = await this.getAndUpdateToken(userId);
            if (token) {
                this.setupNotificationListeners();
                this.initialized = true;
                console.log('FCM Service initialized successfully');
            }

            return token;
        } catch (error) {
            console.error('Error initializing FCM service:', error);
            throw error;
        }
    }

    async configureNotifications() {
        Notifications.setNotificationHandler({
            handleNotification: async () => ({
                shouldShowAlert: true,
                shouldPlaySound: true,
                shouldSetBadge: true,
                priority: Notifications.AndroidNotificationPriority.HIGH
            })
        });
    }

    async getAndUpdateToken(userId) {
        try {
            if (!Device.isDevice) {
                console.warn('Must use physical device for Push Notifications');
                return null;
            }

            // Check permissions
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;
            
            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }

            if (finalStatus !== 'granted') {
                console.warn('Failed to get push notification permissions');
                return null;
            }

            // Get Expo push token
            const { data: token } = await Notifications.getExpoPushTokenAsync({
                projectId: process.env.EXPO_PROJECT_ID
            });

            // Update token in Firestore
            await this.updateUserToken(userId, token);

            return token;
        } catch (error) {
            console.error('Error getting push token:', error);
            throw error;
        }
    }

    async updateUserToken(userId, token) {
        try {
            const userRef = doc(firestore, 'users', userId);
            await updateDoc(userRef, {
                fcmToken: token,
                tokenUpdatedAt: new Date(),
                platform: Platform.OS,
                deviceInfo: {
                    manufacturer: Device.manufacturer,
                    modelName: Device.modelName,
                    osVersion: Device.osVersion
                }
            });

            console.log('FCM token updated successfully', {
                userId,
                tokenPrefix: token.substring(0, 6)
            });
        } catch (error) {
            console.error('Error updating FCM token:', error);
            throw error;
        }
    }

    setupNotificationListeners() {
        // Clean up existing listeners
        this.cleanupListeners();

        // When a notification is received while app is foregrounded
        this.notificationListener = Notifications.addNotificationReceivedListener(
            this.handleForegroundNotification
        );

        // When user interacts with a notification
        this.responseListener = Notifications.addNotificationResponseReceivedListener(
            this.handleNotificationResponse
        );
    }

    handleForegroundNotification = (notification) => {
        console.log('Received foreground notification');
        
        const { data } = notification.request.content;
        
        // Pass to notification handler if registered
        if (this.onNotificationReceived) {
            this.onNotificationReceived(data);
        }
    };

    handleNotificationResponse = (response) => {
        const data = response.notification.request.content.data;
        console.log('Handling notification response', { type: data?.type });

        // Pass to response handler if registered
        if (this.onNotificationResponse) {
            this.onNotificationResponse(data);
        }
    };

    // Register notification handlers
    setNotificationHandlers(handlers) {
        const { onNotificationReceived, onNotificationResponse } = handlers;
        this.onNotificationReceived = onNotificationReceived;
        this.onNotificationResponse = onNotificationResponse;
    }

    cleanupListeners() {
        if (this.notificationListener) {
            this.notificationListener.remove();
        }
        if (this.responseListener) {
            this.responseListener.remove();
        }
    }

    async cleanup() {
        this.cleanupListeners();
        this.initialized = false;
        this.onNotificationReceived = null;
        this.onNotificationResponse = null;
        console.log('FCM service cleaned up');
    }
}

export const fcmService = new FCMService();