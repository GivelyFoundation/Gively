import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { useNotifications } from '../hooks/useNotifications';

const CustomHeader = () => {
    const navigation = useNavigation();
    const { notifications } = useNotifications();
    
    // Check for unread notifications
    const hasUnreadNotifications = notifications.some(notification => !notification.read);

    return (
        <View style={styles.headerContainer}>
            <TouchableOpacity 
                onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())} 
                style={styles.menuButton}
            >
                <Icon name="menu" size={30} color='#1C5AA3' />
            </TouchableOpacity>
            
            <TouchableOpacity 
                onPress={() => navigation.navigate('Notifications')} 
                style={styles.notificationButton}
            >
                <Icon name="notifications" size={30} color='#3FC032' />
                {hasUnreadNotifications && <View style={styles.dot} />}
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