import React, { useState, useEffect, useCallback, memo } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { useAuth } from '../services/AuthContext';
import { firebaseService } from '../services/firebaseService';
import { cardStyles } from '../styles/cardStyles';
import UserHeader from './UserHeader';
import LikeButton from './LikeButton';

const screenWidth = Dimensions.get('window').width;
const welcome = require('../assets/Images/Welcome.png');

// Memoize child components
const MemoizedUserHeader = memo(UserHeader);
const MemoizedLikeButton = memo(LikeButton);

// Memoize the name formatter function
const getFirstNameLastInitial = (displayName) => {
    if (!displayName) return '';
    const [firstName, lastName] = displayName.split(' ');
    const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : '';
    return lastName ? `${firstName} ${lastInitial}.` : `${firstName}`;
};

// Memoize the welcome message component
const WelcomeMessage = memo(({ displayName }) => {
    const formattedName = getFirstNameLastInitial(displayName);
    return (
        <>
            <Image source={welcome} style={styles.welcome} resizeMode="contain" />
            <Text style={[cardStyles.postText, styles.welcomeText]}>
                Welcome {formattedName} to Gively!!!
            </Text>
        </>
    );
});

const FirstTimeDonationCard = memo(({ data }) => {
    const { userData } = useAuth();
    const [isLiked, setIsLiked] = useState(false);
    const [likesCount, setLikesCount] = useState((data?.Likers || []).length);

    useEffect(() => {
        const checkIfLiked = async () => {
            if (userData?.uid && data?.id) {
                try {
                    const liked = await firebaseService.hasUserLikedPost(data.id, userData.uid);
                    setIsLiked(liked);
                } catch (error) {
                    console.error('Error checking like status:', error);
                    setIsLiked(false);
                }
            }
        };
        checkIfLiked();
    }, [userData?.uid, data?.id]);

    const handleLikeToggle = useCallback(async () => {
        try {
            if (!userData?.uid || !data?.id) {
                console.log("Required data not available");
                return;
            }

            if (isLiked) {
                await firebaseService.unlikePost(data.id, userData.uid);
                await firebaseService.removeNotification(data.uid, data.id + userData.uid);
                setIsLiked(false);
                setLikesCount(prev => Math.max(0, prev - 1));
            } else {
                await firebaseService.likePost(data.id, userData.uid, userData.username, data.uid);
                setIsLiked(true);
                setLikesCount(prev => prev + 1);
            }
        } catch (error) {
            console.error("Failed to like/unlike post: ", error);
            Alert.alert(
                "Error",
                "There was an error updating your like status. Please try again.",
                [{ text: "OK" }]
            );
        }
    }, [isLiked, userData?.uid, userData?.username, data?.id, data?.uid]);

    const user = data.posterData || {
        displayName: 'Deleted User',
        profilePicture: null,
        username: 'deleted_user'
    };

    if (!user) return null;

    return (
        <View style={cardStyles.card}>
            <MemoizedUserHeader 
                user={user}
                date={data.date}
                action={`first donation is to ${data.charity}!`}
                isFirstTimeDonation={true}
            />
            <WelcomeMessage displayName={user.displayName} />
            <View style={styles.footer}>
                <MemoizedLikeButton 
                    isLiked={isLiked}
                    likesCount={likesCount}
                    onPress={handleLikeToggle}
                />
                <TouchableOpacity style={cardStyles.button}>
                    <Text style={cardStyles.buttonText}>Donate</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}, (prevProps, nextProps) => {
    // Custom comparison function for memo
    return (
        prevProps.data.id === nextProps.data.id &&
        prevProps.data.charity === nextProps.data.charity &&
        prevProps.data.date === nextProps.data.date &&
        prevProps.data.Likers?.length === nextProps.data.Likers?.length &&
        prevProps.data.posterData?.username === nextProps.data.posterData?.username &&
        prevProps.data.posterData?.displayName === nextProps.data.posterData?.displayName
    );
});

const styles = StyleSheet.create({
    welcomeText: {
        alignSelf: 'center',
        marginBottom: 10,
    },
    welcome: {
        width: 300,
        height: 150,
        marginVertical: 10,
        alignSelf: 'center',
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
});

export default FirstTimeDonationCard;