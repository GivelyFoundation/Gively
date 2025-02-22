import React, { useCallback } from 'react';
import { 
    View, 
    Text, 
    FlatList, 
    StyleSheet, 
    TouchableOpacity, 
    Image,
    RefreshControl,
    ActivityIndicator 
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { useNotifications } from '../hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
// import createLogger from '../utils/logger';

// const logger = createLogger('NotificationsScreen');

const NotificationItem = ({ notification, onPress, onUserPress }) => {
    const mainActor = notification.actors[0];
    const otherActorsCount = notification.count - 1;

    const renderContent = () => {
        switch (notification.type) {
            case 'like':
                return (
                    <TouchableOpacity style={styles.notificationItem} onPress={onPress}>
                        <View style={styles.avatarGroup}>
                            <Image 
                                source={{ uri: mainActor.profilePicture }} 
                                style={styles.mainAvatar} 
                            />
                            {otherActorsCount > 0 && (
                                <View style={styles.countBadge}>
                                    <Text style={styles.countText}>+{otherActorsCount}</Text>
                                </View>
                            )}
                        </View>
                        <View style={styles.contentContainer}>
                            <Text style={styles.notificationText}>
                                <Text 
                                    style={styles.username} 
                                    onPress={(e) => {
                                        e.stopPropagation();
                                        onUserPress(mainActor.userId);
                                    }}
                                >
                                    {mainActor.username}
                                </Text>
                                {otherActorsCount > 0 ? (
                                    <Text> and {otherActorsCount} others liked your post</Text>
                                ) : (
                                    <Text> liked your post</Text>
                                )}
                            </Text>
                            {notification.postPreview && (
                                <Text style={styles.preview} numberOfLines={1}>
                                    {notification.postPreview}
                                </Text>
                            )}
                            <Text style={styles.timestamp}>
                                {formatDistanceToNow(notification.timestamp.toDate(), { addSuffix: true })}
                            </Text>
                        </View>
                    </TouchableOpacity>
                );

            case 'follow':
                return (
                    <TouchableOpacity 
                        style={styles.notificationItem} 
                        onPress={() => onUserPress(mainActor.userId)}
                    >
                        <View style={styles.avatarGroup}>
                            <Image 
                                source={{ uri: mainActor.profilePicture }} 
                                style={styles.mainAvatar} 
                            />
                            {otherActorsCount > 0 && (
                                <View style={styles.countBadge}>
                                    <Text style={styles.countText}>+{otherActorsCount}</Text>
                                </View>
                            )}
                        </View>
                        <View style={styles.contentContainer}>
                            <Text style={styles.notificationText}>
                                <Text style={styles.username}>{mainActor.username}</Text>
                                {otherActorsCount > 0 ? (
                                    <Text> and {otherActorsCount} others followed you</Text>
                                ) : (
                                    <Text> followed you</Text>
                                )}
                            </Text>
                            <Text style={styles.timestamp}>
                                {formatDistanceToNow(notification.timestamp.toDate(), { addSuffix: true })}
                            </Text>
                        </View>
                    </TouchableOpacity>
                );

            default:
                return null;
        }
    };

    return (
        <View style={[
            styles.notificationContainer,
            !notification.read && styles.unreadContainer
        ]}>
            {renderContent()}
        </View>
    );
};

const NotificationsScreen = () => {
    const navigation = useNavigation();
    const { 
        notifications, 
        loading, 
        refreshing, 
        error, 
        hasMore,
        unreadCount,
        refresh, 
        loadMore, 
        markAsRead 
    } = useNotifications();

    const handleNotificationPress = useCallback(async (notification) => {
        try {
            if (!notification.read) {
                await markAsRead([notification.id]);
            }

            switch (notification.type) {
                case 'like':
                    navigation.navigate('SinglePostScreen', { 
                        postId: notification.postId 
                    });
                    break;
                case 'follow':
                    navigation.navigate('UserScreen', { 
                        userId: notification.actors[0].userId 
                    });
                    break;
            }
        } catch (error) {
            console.error('Error handling notification press:', error);
        }
    }, [markAsRead, navigation]);

    const handleUserPress = useCallback((userId) => {
        navigation.navigate('UserScreen', { userId });
    }, [navigation]);

    const handleMarkAllAsRead = useCallback(async () => {
        try {
            const unreadNotifications = notifications.filter(n => !n.read);
            if (unreadNotifications.length > 0) {
                const unreadIds = unreadNotifications.map(n => n.id);
                await markAsRead(unreadIds);
            }
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    }, [notifications, markAsRead]);

    const renderItem = ({ item }) => (
        <NotificationItem
            notification={item}
            onPress={() => handleNotificationPress(item)}
            onUserPress={handleUserPress}
        />
    );

    const renderFooter = () => {
        if (!hasMore) return null;
        return loading ? (
            <View style={styles.loader}>
                <ActivityIndicator size="small" color="#3FC032" />
            </View>
        ) : null;
    };

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Icon name="notifications-none" size={48} color="#666" />
            <Text style={styles.emptyText}>No notifications yet</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity 
                    onPress={() => navigation.goBack()} 
                    style={styles.backButton}
                >
                    <Icon name="arrow-back" size={30} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerText}>
                    Notifications
                    {unreadCount > 0 && ` (${unreadCount})`}
                </Text>
            </View>

            <FlatList
                data={notifications}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={refresh}
                        tintColor="#3FC032"
                        colors={['#3FC032']}
                    />
                }
                onEndReached={loadMore}
                onEndReachedThreshold={0.5}
                ListFooterComponent={renderFooter}
                ListEmptyComponent={renderEmpty}
                contentContainerStyle={notifications.length === 0 && styles.emptyList}
            />

            {unreadCount > 0 && (
                <TouchableOpacity 
                    style={styles.markAllButton}
                    onPress={handleMarkAllAsRead}
                >
                    <Text style={styles.markAllText}>
                        Mark all as read
                    </Text>
                </TouchableOpacity>
            )}

            {error && (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            )}
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
        fontFamily: 'Montserrat-Medium',
        textAlign: 'right',
    },
    notificationContainer: {
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    unreadContainer: {
        backgroundColor: '#f0f9ff',
    },
    notificationItem: {
        flexDirection: 'row',
        padding: 16,
    },
    avatarGroup: {
        width: 40,
        height: 40,
        marginRight: 16,
    },
    mainAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    countBadge: {
        position: 'absolute',
        bottom: -5,
        right: -5,
        backgroundColor: '#3FC032',
        borderRadius: 10,
        paddingHorizontal: 6,
        paddingVertical: 2,
    },
    countText: {
        color: '#fff',
        fontSize: 12,
        fontFamily: 'Montserrat-Medium',
    },
    contentContainer: {
        flex: 1,
    },
    notificationText: {
        fontSize: 14,
        fontFamily: 'Montserrat-Regular',
        color: '#000',
    },
    username: {
        fontFamily: 'Montserrat-Medium',
        color: '#1C5AA3',
    },
    preview: {
        fontSize: 14,
        fontFamily: 'Montserrat-Regular',
        color: '#666',
        marginTop: 4,
    },
    timestamp: {
        fontSize: 12,
        fontFamily: 'Montserrat-Regular',
        color: '#999',
        marginTop: 4,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
        fontFamily: 'Montserrat-Medium',
        color: '#666',
    },
    emptyList: {
        flexGrow: 1,
    },
    loader: {
        paddingVertical: 20,
        alignItems: 'center',
    },
    errorContainer: {
        backgroundColor: '#fee',
        padding: 16,
        margin: 16,
        borderRadius: 8,
    },
    errorText: {
        color: '#c00',
        fontFamily: 'Montserrat-Regular',
        textAlign: 'center',
    },
    markAllButton: {
      padding: 12,
      borderBottomWidth: 1,
      borderBottomColor: '#ddd',
      backgroundColor: '#f8f8f8',
    },
    markAllText: {
        textAlign: 'center',
        color: '#1C5AA3',
        fontFamily: 'Montserrat-Medium',
        fontSize: 14,
    },
});

export default NotificationsScreen;