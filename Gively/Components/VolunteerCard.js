import React, { useState, useEffect, useCallback, memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useAuth } from '../services/AuthContext';
import { firebaseService } from '../services/firebaseService';
import { cardStyles } from '../styles/cardStyles';
import UserHeader from './UserHeader';
import LikeButton from './LikeButton';
import { formatDate } from '../utilities/dateFormatter';

// Memoize child components
const MemoizedUserHeader = memo(UserHeader);
const MemoizedLikeButton = memo(LikeButton);

// Memoize the MapView component
const MemoizedMap = memo(({ location, address }) => (
    <View style={styles.mapView}>
        <MapView
            style={styles.map}
            initialRegion={{
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
            }}
        >
            <Marker
                coordinate={{ 
                    latitude: location.latitude, 
                    longitude: location.longitude 
                }}
                title={address}
            />
        </MapView>
    </View>
), (prevProps, nextProps) => {
    // Custom comparison for location data
    return (
        prevProps.location.latitude === nextProps.location.latitude &&
        prevProps.location.longitude === nextProps.location.longitude &&
        prevProps.address === nextProps.address
    );
});

// Memoize the event details component
const EventDetails = memo(({ description, eventDate, address }) => (
    <>
        <Text style={cardStyles.postText}>{description}</Text>
        <Text style={styles.dateTimeText}>Date and Time: {formatDate(eventDate)}</Text>
        <Text style={styles.addressText}>Address: {address}</Text>
    </>
));

const VolunteerCard = memo(({ data = {} }) => {
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
                action="shared this volunteer opportunity:"
            />
            <EventDetails 
                description={data.description}
                eventDate={data.eventDate}
                address={data.address}
            />
            <MemoizedMap 
                location={data.location}
                address={data.address}
            />
            <View style={styles.footer}>
                <MemoizedLikeButton 
                    isLiked={isLiked}
                    likesCount={likesCount}
                    onPress={handleLikeToggle}
                />
                <TouchableOpacity style={styles.shareButton}>
                    <Text style={styles.shareButtonText}>Share</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}, (prevProps, nextProps) => {
    // Custom comparison function for main component
    return (
        prevProps.data.id === nextProps.data.id &&
        prevProps.data.description === nextProps.data.description &&
        prevProps.data.eventDate === nextProps.data.eventDate &&
        prevProps.data.address === nextProps.data.address &&
        prevProps.data.date === nextProps.data.date &&
        prevProps.data.likers?.length === nextProps.data.likers?.length &&
        prevProps.data.posterData?.username === nextProps.data.posterData?.username &&
        prevProps.data.location?.latitude === nextProps.data.location?.latitude &&
        prevProps.data.location?.longitude === nextProps.data.location?.longitude
    );
});

const styles = StyleSheet.create({
    dateTimeText: {
        fontSize: 14,
        marginBottom: 10,
        lineHeight: 24,
        fontFamily: 'Montserrat-Medium',
    },
    addressText: {
        fontSize: 14,
        marginBottom: 10,
        lineHeight: 24,
        fontFamily: 'Montserrat-Medium',
    },
    mapView: {
        width: '100%',
        height: 150,
        marginBottom: 10,
    },
    map: {
        width: '100%',
        height: '100%',
        borderRadius: 10,
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

export default VolunteerCard;