import React, { useState, useEffect } from 'react';
import { View, TextInput, Text, Image, StyleSheet, ScrollView, TouchableOpacity, Alert, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../services/AuthContext';
import { firestore } from '../services/firebaseConfig';
import { doc, updateDoc } from 'firebase/firestore';


const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default EditProfileScreen = ({ navigation }) => {
    const { user2, userData } = useAuth();

    const [displayName, setDisplayName] = useState(userData.displayName);
    const [bio, setBio] = useState(userData.bio);
    const [charity, setCharity] = useState('');
    const [profilePicture, setProfilePicture] = useState(userData.profilePicture);
    const [isChanged, setIsChanged] = useState(false);

    useEffect(() => {
        if (displayName !== userData.displayName || bio !== userData.bio || profilePicture !== userData.profilePicture) {
            setIsChanged(true);
        } else {
            setIsChanged(false);
        }
    }, [displayName, bio, profilePicture]);

    const handleSaveChanges = async () => {
        try {
            const userDocRef = doc(firestore, 'users', userData.uid);
            await updateDoc(userDocRef, {
                displayName: displayName,
                bio: bio,
                profilePicture: profilePicture,
            });
            console.log('User profile updated successfully!');
            navigation.navigate('Profile');
        } catch (error) {
            console.error('Error updating user profile: ', error);
            Alert.alert('Error', 'Failed to update profile details. Please try again.');
        }
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={styles.backButton}>
                <Icon name="arrow-back" size={30} color="#000" />
            </TouchableOpacity>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.profilePicContainer}>
                    <Image
                        source={{ uri: profilePicture }}
                        style={styles.profilePic}
                    />
                    <TouchableOpacity style={styles.iconContainer}>
                        <Icon name="edit" size={24} color="#FFF" />
                    </TouchableOpacity>
                </View>

                <TextInput
                    style={styles.input}
                    onChangeText={setDisplayName}
                    value={displayName}
                    placeholder="Display Name"
                />
                <TextInput
                    style={styles.textArea}
                    onChangeText={setBio}
                    value={bio}
                    placeholder="Bio"
                    multiline={true}
                    numberOfLines={4}
                    maxLength={150}
                />
                <Text style={styles.charCount}>{bio.length}/150</Text>
            </ScrollView>
            <TouchableOpacity
                style={[styles.donateButton, !isChanged && styles.disabledButton]}
                onPress={handleSaveChanges}
                disabled={!isChanged}
            >
                <Text style={styles.donateButtonText}>Save Changes</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        paddingTop: SCREEN_HEIGHT * 0.04,
    },
    scrollContainer: {
    
        alignItems: 'center',
        backgroundColor: "#fff",
        paddingHorizontal: SCREEN_WIDTH * 0.03, // Reduced horizontal padding
    },
    backButton: {
        paddingTop: 10,
        paddingLeft: 20,
    },
    backButtonText: {
        fontSize: 20,
    },
    iconContainer: {
        position: 'absolute',
        right: 0,
        top: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)', // Semi-transparent background
        borderRadius: 24,
        padding: 6,
    },
    profilePicContainer: {
        marginBottom: 20,
        position: 'relative',
    },
    profilePic: {
        width: 100,
        height: 100,
        borderRadius: 10,
        marginBottom: 20,
    },
    input: {
        height: 40,
        width: '100%',
        marginBottom: 12,
        borderWidth: 1,
        padding: 10,
        borderRadius: 10,
    },
    textArea: {
        height: 100,
        width: '100%',
        marginBottom: 12,
        borderWidth: 1,
        padding: 10,
        textAlignVertical: 'top',
        borderRadius: 10,
    },
    charCount: {
        alignSelf: 'flex-end',
        marginBottom: 12,
        color: '#888',
    },
    donateButton: {
        position: 'absolute',
        bottom: 20,
        left: '10%',
        right: '10%',
        backgroundColor: '#3FC032',
        padding: 15,
        alignItems: 'center',
        borderRadius: 10,
        elevation: 5, // Adds shadow for Android
        shadowColor: '#000', // Adds shadow for iOS
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
    },
    donateButtonText: {
        fontSize: 18,
        color: '#fff',
        fontWeight: 'bold',
    },
    disabledButton: {
        backgroundColor: '#cccccc', // Gray color for disabled state
    },
});
