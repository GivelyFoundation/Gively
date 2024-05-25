import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { LinkPreview } from '@flyerhq/react-native-link-preview'

const likeIcon = require('../assets/Icons/heart.png');

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
    return (
        <View style={styles.cardContainer}>
            <View style={styles.card}>
                <View style={styles.header}>
                    <Image source={{ uri: data.originalPosterProfileImage }} style={styles.profileImage} />
                    <View style={styles.posterInfo}>
                        <View style={styles.column}>
                            <Text style={styles.posterName}>
                                <Text style={[styles.boldText, { fontFamily: 'Montserrat-Bold' }]}>{data.originalDonationPoster}</Text>
                                <Text style={{ fontFamily: 'Montserrat-Medium' }}> shared this Change.org Petiton:</Text>
                            </Text>
                            <Text style={[styles.posterDate, { fontFamily: 'Montserrat-Medium' }]}>{formatDate(data.date)}</Text>
                        </View>
                    </View>
                </View>
                <Text style={[styles.postText, { fontFamily: 'Montserrat-Medium' }]}>{data.postText}</Text>
                <View style={styles.linkView}>
                    <LinkPreview text={data.Link} />
                </View>
                <View style={styles.footer}>
                    <View style={styles.likesContainer}>
                        <Image source={likeIcon} style={[styles.likeIcon, { tintColor: data.isLiked ? '#EB5757' : '#8484A9' }]} />
                        <Text style={[styles.likes, { fontFamily: 'Montserrat-Medium', color: data.isLiked ? '#EB5757' : '#8484A9' }]}>{data.Likers}</Text>
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
    cardContainer: {
        width: '100%',
        marginHorizontal: 10,
        marginBottom: 20,
    },
    card: {
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 15,
        shadowColor: '#5A5A5A',
        shadowOffset: { width: 0, height: 4 },
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
        width: '50%',
        marginRight:10
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
    linkView: {
        paddingRight: 10
    }
});

