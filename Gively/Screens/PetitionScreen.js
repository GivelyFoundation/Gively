import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, TextInput, ScrollView, Alert, TouchableOpacity, Image } from 'react-native';
import {  PetitionCard } from '../Components/PetitionCard';
import { useAuth } from '../services/AuthContext';
import { v4 as uuidv4 } from 'uuid';
import { collection, addDoc } from 'firebase/firestore';
import { firestore } from '../services/firebaseConfig';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Importing Material Icons

const ChangeOrgLogo = require('../assets/Images/ChangeOrgLogo.png');

const  PetitionCardPreview = ({ data }) => {
    const { userData } = useAuth();
    const dataWithProfilePicture = { ...data, originalPosterProfileImage: userData.profilePicture };
    return (
        <View style={styles.card}>
            < PetitionCard data={dataWithProfilePicture} />
        </View>
    );
};

const  PetitionScreen = ({ navigation }) => {
    const [petitionLink, setPetitionLink] = useState('https://www.change.org/');
    const [userText, setUserText] = useState('');
    const [data, setData] = useState({});
    const { userData } = useAuth();
    const [isVisible, setIsVisible] = useState(false); // State to manage visibility

    // Toggle visibility handler
    const toggleVisibility = () => {
        setIsVisible(!isVisible);
    };

    // Handlers for text change
    const handleUserTextChange = (text) => {
        setUserText(text);
    };

    const handlePetitionLinkChange = (text) => {
        setPetitionLink(text);
        if (!containsPetition(text)) {
            setIsVisible(false);
        }
    };

    const containsPetition = (text) => {
        return text.toLowerCase().includes('www.change.org');
    };

    const handleButtonPress = () => {
        if (petitionLink !== '' && containsPetition(petitionLink)) {
            const uniqueId = uuidv4();
            const newData = {
                Likers: [],
                Link: petitionLink,
                PostType: 'petition',
                date: new Date().toISOString(),
                id: uniqueId,
                originalDonationPoster: userData.username,
                originalPosterProfileImage: userData.profilePicture,
                postText: userText,
                uid: userData.uid
            };
            setData(newData);
            setIsVisible(true);
            console.log("Data object set:", newData);
        } else {
            setIsVisible(false);
            Alert.alert(
                "Invalid Input",
                "There's an error with your inputs. Please remember that the Change.org link input cannot be empty and must contain 'change.org'.",
                [{ text: "OK" }]
            );
        }
    };

    const sharePetitionPress = async () => {
        try {
            if (Object.keys(data).length === 0) {
                Alert.alert(
                    "No Data to Share",
                    "Please generate a preview before sharing.",
                    [{ text: "OK" }]
                );
                return;
            }

            await addDoc(collection(firestore, 'Posts'), data);
            console.log("Post added to Firestore with ID:", data.id);
            Alert.alert(
                "Success",
                "Your Change.org link has been shared successfully.",
                [{ text: "OK" }]
            );
            navigation.goBack();
        } catch (error) {
            console.error("Error adding post to Firestore:", error);
            Alert.alert(
                "Error",
                "There was an error sharing your Petition link. Please try again.",
                [{ text: "OK" }]
            );
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView>
                
                <View style = {styles.row}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Icon name="arrow-back" size={30} color="#000" />
                </TouchableOpacity>

                <Image
                        source={ChangeOrgLogo }
                        style={styles.changeOrgLogo}
                        resizeMode="contain"
                    />
                </View>
              
                <Text style={[styles.label, { fontFamily: 'Montserrat-Medium' }]}>Caption:</Text>
                <TextInput
                    style={styles.input}
                    value={userText}
                    onChangeText={handleUserTextChange}
                    placeholder="Enter your text"
                />
                <Text style={[styles.label, { fontFamily: 'Montserrat-Medium' }]}>Change.org Link:</Text>
                <TextInput
                    style={styles.input}
                    value={petitionLink}
                    onChangeText={handlePetitionLinkChange}
                    placeholder="change.org"
                />
                {containsPetition(petitionLink) && (
                    <>
                        <TouchableOpacity style={styles.button} onPress={handleButtonPress}>
                            <Text style={[styles.buttonText, { fontFamily: 'Montserrat-Medium' }]}>Preview</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.shareButton} onPress={sharePetitionPress}>
                            <Text style={[styles.shareButtonText, { fontFamily: 'Montserrat-Medium' }]}>Share Change.org Link</Text>
                        </TouchableOpacity>
                    </>
                )}
                {isVisible && (
                    <PetitionCardPreview data={data} />
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    page: {
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        paddingTop: 60,
        width: '100%', // Ensures the page fills the width of the screen
        alignItems: 'center', // Centers the content horizontally
        height: '100%',
    },
    previewHeader: {
        fontSize: 16,
        fontWeight: 'bold', // Adjusted for Bold without needing the font file
        marginBottom: 20, // Adds spacing below the header
    },
    container: {
        flex: 1,
        padding: 20,
        paddingTop: 100,
        justifyContent: 'center',
        backgroundColor: '#fff',
    },
    label: {
        fontSize: 16,
        marginBottom: 5,
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 15,
        paddingLeft: 8,
        borderRadius: 10,
    },
    button: {
        backgroundColor: '#1C5AA3',
        marginVertical: 10,
        borderRadius: 7,
        paddingVertical: 10,
        paddingHorizontal: 20,
        width: '100%',
        marginRight: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        alignSelf: 'center',
    },
    shareButton: {
        backgroundColor: '#3FC032',
        marginVertical: 10,
        borderRadius: 7,
        paddingVertical: 10,
        paddingHorizontal: 20,
        width: '100%',
        marginRight: 10,
    },
    shareButtonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        alignSelf: 'center',
    },
    card: {
        marginVertical: 50,
    },
    backButtonText: {
        fontSize: 20
    },
    backButton: {
        fpaddingTop: 60,
        paddingLeft: 20
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: 40
    },
    changeOrgLogo:{
    width: 150,
    height: 50
    }
});

export default  PetitionScreen;
