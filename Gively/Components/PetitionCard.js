import React, { useState, useEffect, useCallback, memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { LinkPreview } from '@flyerhq/react-native-link-preview';
import { useAuth } from '../services/AuthContext';
import { firebaseService } from '../services/firebaseService';
import { cardStyles } from '../styles/cardStyles';
import UserHeader from './UserHeader';
import LikeButton from './LikeButton';

// Memoize child components
const MemoizedUserHeader = memo(UserHeader);
const MemoizedLikeButton = memo(LikeButton);

// Memoize the LinkPreview component
const MemoizedLinkPreview = memo(({ url }) => (
    <LinkPreview 
        text={url}
        renderText={() => null}
        containerStyle={{
            backgroundColor: '#F8F9FA',
            paddingBottom: 20,
        }}
        metadataContainerStyle={{
            marginTop: 0,
        }}
        titleStyle={{
            fontFamily: 'Montserrat-Medium',
            fontSize: 14,
        }}
        descriptionStyle={{
            fontFamily: 'Montserrat-Regular',
            fontSize: 12,
        }}
    />
));

const PetitionCard = memo(({ data = {} }) => {
    const { userData } = useAuth();
    const [isLiked, setIsLiked] = useState(false);
    const [likesCount, setLikesCount] = useState((data?.likers || []).length);

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
                action="shared this Change.org Petition:"
            />
            {data.postText && <Text style={cardStyles.postText}>{data.postText}</Text>}
            <View style={styles.linkPreviewContainer}>
                <MemoizedLinkPreview url={data.link} />
            </View>
            <View style={styles.footer}>
                <MemoizedLikeButton 
                    isLiked={isLiked}
                    likesCount={likesCount}
                    onPress={handleLikeToggle}
                />
                <TouchableOpacity style={styles.shareButton}>
                    <Text style={styles.shareButtonText}>Share Petition</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}, (prevProps, nextProps) => {
    // Custom comparison function for memo
    return (
        prevProps.data.id === nextProps.data.id &&
        prevProps.data.postText === nextProps.data.postText &&
        prevProps.data.link === nextProps.data.link &&
        prevProps.data.date === nextProps.data.date &&
        prevProps.data.likers?.length === nextProps.data.likers?.length &&
        prevProps.data.posterData?.username === nextProps.data.posterData?.username
    );
});

const styles = StyleSheet.create({
    linkPreviewContainer: {
        marginBottom: 15,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    shareButton: {
        backgroundColor: '#3FC032',
        borderRadius: 7,
        paddingVertical: 10,
        paddingHorizontal: 20,
    },
    shareButtonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        fontFamily: 'Montserrat-Bold',
    },
});

export default PetitionCard;