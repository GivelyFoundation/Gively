import notifee, { AndroidImportance } from '@notifee/react-native';

class LocalNotificationService {
    async createChannels() {
        await notifee.createChannel({
            id: 'post_interactions',
            name: 'Post Interactions',
            importance: AndroidImportance.HIGH,
        });

        await notifee.createChannel({
            id: 'follow_interactions',
            name: 'Follow Interactions',
            importance: AndroidImportance.DEFAULT,
        });
    }

    async displayNotification({ title, body, data }) {
        try {
            // Get the appropriate channel based on notification type
            const channelId = data?.type === 'follow' ? 
                'follow_interactions' : 'post_interactions';

            await notifee.displayNotification({
                title,
                body,
                data,
                android: {
                    channelId,
                    pressAction: {
                        id: 'default',
                    },
                    importance: AndroidImportance.HIGH,
                    smallIcon: 'ic_notification', // Make sure this icon exists in android/app/src/main/res/
                },
                ios: {
                    foregroundPresentationOptions: {
                        badge: true,
                        sound: true,
                        banner: true,
                        list: true,
                    },
                },
            });
        } catch (error) {
            console.error('Error displaying notification:', error);
        }
    }

    // Handle notification press
    async onNotificationPress(notification) {
        // You'll implement navigation logic here based on notification type
        const { data } = notification;
        
        switch (data?.type) {
            case 'like':
                // Navigate to post
                break;
            case 'follow':
                // Navigate to user profile
                break;
            default:
                break;
        }
    }
}

export const localNotificationService = new LocalNotificationService();