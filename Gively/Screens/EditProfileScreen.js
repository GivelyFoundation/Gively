import React, { useState } from 'react';
import { View, TextInput, Text, Image, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Importing Material Icons
import { user } from '../MockData';

const profilePicture = require('../assets/Images/profileDefault.png');
export default EditProfileScreen = ({ navigation }) => {
    const [name, setName] = useState(user.username);
    const [bioHeader, setBioHeader] = useState(user.bioHeader);
    const [bio, setBio] = useState(user.mainBioText);
    const [charity, setCharity] = useState('NAMI');

    const handleEditPicture = () => {
        console.log('Edit Picture');
        // Add your image editing functionality here
    };
    return (
        <View style = {styles.container}>
             <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={styles.backButton}>
                    <Text style={[{ fontFamily: 'Montserrat-Medium' }, styles.backButtonText]}>Back</Text>
                </TouchableOpacity>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.profilePicContainer}>
                    <Image
                        source={profilePicture}
                        style={styles.profilePic}
                    />
                    <TouchableOpacity style={styles.iconContainer} onPress={handleEditPicture} >
                        <Icon name="edit" size={24} color="#FFF" />
                    </TouchableOpacity>
                </View>

                <TextInput
                    style={styles.input}
                    onChangeText={setName}
                    value={name}
                    placeholder="Your Name"
                />
                <TextInput
                    style={styles.input}
                    onChangeText={setBioHeader}
                    value={bioHeader}
                    placeholder="Bio Header"
                />
                <TextInput
                    style={styles.textArea}
                    onChangeText={setBio}
                    value={bio}
                    placeholder="Bio"
                    multiline={true}
                    numberOfLines={4}
                />
                <TextInput
                    style={styles.input}
                    onChangeText={setCharity}
                    value={charity}
                    placeholder="Search and pin your favorite charity"
                />

            </ScrollView>
            <TouchableOpacity
                style={styles.donateButton}
                onPress={() => navigation.navigate('Profile')}
            >
                <Text style={styles.donateButtonText}>Save Changes</Text>
            </TouchableOpacity>
        </View>

    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    scrollContainer: {
        padding: 20,
        alignItems: 'center',
        paddingTop: 80
    },
    backButton: {
        paddingTop: 60,
        paddingLeft: 20
    },
    backButtonText: {
        fontSize: 20
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
        borderRadius: 75,
        marginBottom: 20,
    },
    input: {
        height: 40,
        width: '100%',
        marginBottom: 12,
        borderWidth: 1,
        padding: 10,
        borderRadius: 10
    },
    textArea: {
        height: 100,
        width: '100%',
        marginBottom: 12,
        borderWidth: 1,
        padding: 10,
        textAlignVertical: 'top',
        borderRadius: 10
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
});

