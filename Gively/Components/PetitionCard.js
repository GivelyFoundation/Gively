import React from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { LinkPreview } from '@flyerhq/react-native-link-preview'

const likeIcon = require('../assets/Icons/heart.png');
const profilePicture = require('../assets/Images/profileDefault.png');

const formatDate = (dateStr) => {
    const date = new Date(dateStr);
  
    // Options for the date part
    const optionsDate = { weekday: 'short', month: 'short', day: 'numeric' };
  
    // Format the date part
    const formattedDate = date.toLocaleDateString('en-US', optionsDate);
  
    // Options for the time part
    const optionsTime = { hour: 'numeric', minute: 'numeric', hour12: true };
  
    // Format the time part
    const formattedTime = date.toLocaleTimeString('en-US', optionsTime);
  
    return `${formattedDate} • ${formattedTime}`;
  };

export const PetitionCard = ({ data = {}, user = {} }) => {
    // Ensure there are default values or checks to handle missing data
    const {
        postDate = '',
        postText = '',
        petitionUrl = '',
        isLiked = false,
        likesCount = 0
    } = data;

    const {
        userName = 'Anonymous'
    } = user;

    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <Image source={profilePicture} style={styles.profileImage} />
                <View style={styles.posterInfo}>
                    <View style={styles.column}>
                        <Text style={styles.posterName}>
                            <Text style={[styles.boldText, { fontFamily: 'Montserrat-Bold' }]}>{user.username}</Text>
                            <Text style={{ fontFamily: 'Montserrat-Medium' }}> shared this Petition:</Text>
                        </Text>
                        <Text style={[styles.posterDate, { fontFamily: 'Montserrat-Medium' }]}>{data.postDate}</Text>
                    </View>
                </View>
            </View>

            <Text style={[styles.postText, { fontFamily: 'Montserrat-Medium' }]}>{data.postText}</Text>
            
                
         
            <LinkPreview text={data.link} />
            <View style={styles.footer}>
            <View style={[styles.row]}>
                <View style={styles.likesContainer}>
                    <Image source={likeIcon} style={[styles.likeIcon, { tintColor: data.isLiked ? '#EB5757' : '#8484A9' }]} />
                    <Text style={[styles.likes, { fontFamily: 'Montserrat-Medium', color: data.isLiked ? '#EB5757' : '#8484A9' }]}>{data.likesCount}</Text>
                </View>
                <TouchableOpacity style={styles.button}>
                    <Text style={styles.buttonText}>Share Petition</Text>
                </TouchableOpacity>
                </View>
            </View>

        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 15,
        marginBottom: 20,
        shadowColor: '#5A5A5A',
        shadowOffset: { width: 0, height: 4 }, // Reduced shadow height for more subtle effect
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 5,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    profileImage: {
        width: 64,
        height: 64,
        borderRadius: 10,
        marginRight: 10,
    },
    posterInfo: {
        flex: 1,
    },
    posterName: {
        fontSize: 16,
        fontFamily: 'Montserrat-Bold',
    },
    posterDate: {
        fontSize: 13,
        color: '#1C5AA3',
        paddingTop: 5,
    },
    postText: {
        fontSize: 14,
        marginBottom: 10,
        lineHeight: 24,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 20,
    },
    likesContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    likeIcon: {
        width: 16,
        height: 16,
        marginRight: 5,
    },
    likes: {
        color: '#EB5757',
        fontSize: 13,
        fontFamily: 'Montserrat-Medium',
    },
    button: {
        backgroundColor: '#3FC032',
        borderRadius: 7,
        paddingVertical: 10,
        paddingHorizontal: 20,
        width: '50%', // Consider adjusting or removing width if dynamic sizing is needed
    },
    buttonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        alignSelf: 'center'
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
    },
});

