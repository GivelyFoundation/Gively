import React, { useState, useCallback } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    Switch, 
    ScrollView, 
    TouchableOpacity,
    ActivityIndicator,
    Alert 
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../services/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { firestore } from '../services/firebaseConfig';

const PreferenceItem = ({ title, description, value, onValueChange, disabled }) => (
    <View style={styles.preferenceItem}>
        <View style={styles.preferenceContent}>
            <Text style={styles.preferenceTitle}>{title}</Text>
            <Text style={styles.preferenceDescription}>{description}</Text>
        </View>
        <Switch
            value={value}
            onValueChange={onValueChange}
            disabled={disabled}
            trackColor={{ false: '#767577', true: '#3FC032' }}
            thumbColor={disabled ? '#f4f3f4' : '#fff'}
        />
    </View>
);

const SettingSection = ({ title, children }) => (
    <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {children}
    </View>
);

export default function SettingsScreen() {
    const { userData } = useAuth();
    const [loading, setLoading] = useState(false);
    const [preferences, setPreferences] = useState(
        userData?.notificationPreferences || {
            likes: true,
            follows: true,
            comments: true,
            systemUpdates: true
        }
    );

    const handlePreferenceChange = useCallback(async (key, value) => {
        try {
            setLoading(true);
            const userRef = doc(firestore, 'users', userData.uid);
            const updatedPreferences = {
                ...preferences,
                [key]: value
            };

            await updateDoc(userRef, {
                notificationPreferences: updatedPreferences
            });

            setPreferences(updatedPreferences);
        } catch (error) {
            console.error('Error updating preferences:', error);
            Alert.alert(
                'Error',
                'Failed to update notification preferences. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    }, [preferences, userData?.uid]);

    return (
        <ScrollView style={styles.container}>
            {loading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#3FC032" />
                </View>
            )}

            <SettingSection title="Notification Preferences">
                <PreferenceItem
                    title="Post Likes"
                    description="Get notified when someone likes your posts"
                    value={preferences.likes}
                    onValueChange={(value) => handlePreferenceChange('likes', value)}
                    disabled={loading}
                />
                <PreferenceItem
                    title="New Followers"
                    description="Get notified when someone follows you"
                    value={preferences.follows}
                    onValueChange={(value) => handlePreferenceChange('follows', value)}
                    disabled={loading}
                />
                <PreferenceItem
                    title="Comments"
                    description="Get notified about comments on your posts"
                    value={preferences.comments}
                    onValueChange={(value) => handlePreferenceChange('comments', value)}
                    disabled={loading}
                />
                <PreferenceItem
                    title="System Updates"
                    description="Get notified about important app updates"
                    value={preferences.systemUpdates}
                    onValueChange={(value) => handlePreferenceChange('systemUpdates', value)}
                    disabled={loading}
                />
            </SettingSection>

            {/* Add other settings sections here */}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    section: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: 'Montserrat-Medium',
        marginBottom: 16,
        color: '#1C5AA3',
    },
    preferenceItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    preferenceContent: {
        flex: 1,
        marginRight: 16,
    },
    preferenceTitle: {
        fontSize: 16,
        fontFamily: 'Montserrat-Medium',
        marginBottom: 4,
    },
    preferenceDescription: {
        fontSize: 14,
        fontFamily: 'Montserrat-Regular',
        color: '#666',
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 999,
    },
});