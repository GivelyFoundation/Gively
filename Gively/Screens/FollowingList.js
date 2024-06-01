import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { collection, query, getDocs, doc, getDoc } from 'firebase/firestore';
import { firestore } from '../services/firebaseConfig'; // Adjust the import based on your actual firebase configuration file
import UserCard from '../Components/UserCard'; // Adjust the import based on your actual file structure
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../services/AuthContext';

const FollowingList = ({ navigation, route }) => {
    const { userId } = route.params;
    const [following, setFollowing] = useState([]);
    const [loading, setLoading] = useState(true);
    const { userData } = useAuth();

    useEffect(() => {
        const fetchFollowing = async () => {
            try {
                const followingRef = collection(firestore, `users/${userId}/following`);
                const q = query(followingRef);
                const querySnapshot = await getDocs(q);
                const followingData = await Promise.all(querySnapshot.docs.map(async (docSnapshot) => {
                    const followedUserId = docSnapshot.data().followedUserId;
                    const userDocRef = doc(firestore, 'users', followedUserId);
                    const userDocSnapshot = await getDoc(userDocRef);
                    return { id: userDocSnapshot.id, ...userDocSnapshot.data() };
                }));

                setFollowing(followingData);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching following:', error);
                setLoading(false);
            }
        };

        fetchFollowing();
    }, [userId]);

    const handleUnfollow = (unfollowedId) => {
        setFollowing((prevFollowing) => prevFollowing.filter((user) => user.id !== unfollowedId));
    };

    if (loading) {
        return <ActivityIndicator size="large" color="#0000ff" />;
    }

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Icon name="arrow-back" size={30} color="#000" />
            </TouchableOpacity>
            <ScrollView>
                {following.map((item) => (
                    <UserCard key={item.id} user={item} isCurrentUser={item.id === userData.uid} onUnfollow={handleUnfollow} />
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#fff'
    },
    backButton: {
        paddingTop: 60,
        paddingLeft: 20,
    },
});

export default FollowingList;
