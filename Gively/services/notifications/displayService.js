import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
// import createLogger from '../../utils/logger';

// const logger = createLogger('displayService');

class DisplayService {
    constructor() {
        this.channels = {
            POST_INTERACTIONS: {
                id: 'post_interactions',
                name: 'Post Interactions',
                description: 'Notifications for likes and comments',
                importance: Notifications.AndroidImportance.HIGH,
                sound: true,
                vibration: true
            },
            SOCIAL_UPDATES: {
                id: 'social_updates',
                name: 'Social Updates',
                description: 'Notifications for follows and mentions',
                importance: Notifications.AndroidImportance.DEFAULT,
                sound: true,
                vibration: true
            }
        };
    }

    async initialize() {
        try {
            if (Platform.OS === 'android') {
                await this.createChannels();
            }

            await this.configureNotifications();
            console.log('Display service initialized');
        } catch (error) {
            console.error('Error initializing display service:', error);
            throw error;
        }
    }

    async configureNotifications() {
        await Notifications.setNotificationHandler({
            handleNotification: async () => ({
                shouldShowAlert: true,
                shouldPlaySound: true,
                shouldSetBadge: true,
                priority: Notifications.AndroidImportance.HIGH
            })
        });
    }

    async createChannels() {
        try {
            for (const channel of Object.values(this.channels)) {
                await Notifications.setNotificationChannelAsync(channel.id, {
                    name: channel.name,
                    description: channel.description,
                    importance: channel.importance,
                    vibrationPattern: [0, 250, 250, 250],
                    lightColor: '#FF231F7C',
                    sound: channel.sound,
                    enableVibrate: channel.vibration
                });
            }
            console.log('Notification channels created successfully');
        } catch (error) {
            console.error('Error creating notification channels:', error);
            throw error;
        }
    }

    async displayNotification(notification) {
        try {
            const { type, title, body, data } = this.formatNotification(notification);
            
            await Notifications.scheduleNotificationAsync({
                content: {
                    title,
                    body,
                    data,
                    sound: true,
                    badge: 1,
                    ...Platform.select({
                        android: {
                            channelId: this.getChannelId(type),
                            color: '#3FC032',
                            vibrate: [0, 250, 250, 250],
                            priority: Notifications.AndroidNotificationPriority.HIGH,
                        },
                        ios: {
                            threadId: type,
                        },
                    }),
                },
                trigger: null // Immediate display
            });

            console.log('Notification displayed successfully', { type });
        } catch (error) {
            console.error('Error displaying notification:', error);
            throw error;
        }
    }

    formatNotification(notification) {
        const { type, actors, postPreview } = notification;
        const mainActor = actors[0];
        const otherActorsCount = actors.length - 1;

        let title, body;

        switch (type) {
            case 'like':
                title = 'New Like';
                body = otherActorsCount > 0
                    ? `${mainActor.username} and ${otherActorsCount} others liked your post`
                    : `${mainActor.username} liked your post`;
                break;

            case 'follow':
                title = 'New Follower';
                body = otherActorsCount > 0
                    ? `${mainActor.username} and ${otherActorsCount} others followed you`
                    : `${mainActor.username} followed you`;
                break;

            default:
                title = 'New Notification';
                body = 'You have a new notification';
        }

        return {
            type,
            title,
            body,
            data: {
                ...notification,
                mainActor,
                otherActorsCount,
                postPreview
            }
        };
    }

    getChannelId(type) {
        switch (type) {
            case 'like':
            case 'comment':
                return this.channels.POST_INTERACTIONS.id;
            case 'follow':
            case 'mention':
                return this.channels.SOCIAL_UPDATES.id;
            default:
                return this.channels.POST_INTERACTIONS.id;
        }
    }

    async getBadgeCount() {
        return await Notifications.getBadgeCountAsync();
    }

    async setBadgeCount(count) {
        await Notifications.setBadgeCountAsync(count);
    }

    async clearBadgeCount() {
        await Notifications.setBadgeCountAsync(0);
    }

    // Helper method to handle notification actions
    parseNotificationAction(notification) {
        const { type, postId, userId } = notification.data;
        
        return {
            type,
            screen: this.getDestinationScreen(type),
            params: this.getNavigationParams(type, { postId, userId })
        };
    }

    getDestinationScreen(type) {
        switch (type) {
            case 'like':
                return 'SinglePostScreen';
            case 'follow':
                return 'UserScreen';
            default:
                return 'NotificationsScreen';
        }
    }

    getNavigationParams(type, data) {
        switch (type) {
            case 'like':
                return { postId: data.postId };
            case 'follow':
                return { userId: data.userId };
            default:
                return {};
        }
    }
}

export const displayService = new DisplayService();