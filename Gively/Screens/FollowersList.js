import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { collection, query, getDocs, doc, getDoc } from 'firebase/firestore';
import { firestore } from '../services/firebaseConfig'; // Adjust the import based on your actual firebase configuration file
import UserCard from '../Components/UserCard'; // Adjust the import based on your actual file structure
import Icon from 'react-native-vector-icons/MaterialIcons';

const FollowersList = ({ navigation, route }) => {
    const { userId } = route.params;
    const [followers, setFollowers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFollowers = async () => {
            try {
                const followersRef = collection(firestore, `users/${userId}/followers`);
                const q = query(followersRef);
                const querySnapshot = await getDocs(q);
                const followersData = await Promise.all(querySnapshot.docs.map(async (docSnapshot) => {
                    const followerUserId = docSnapshot.data().followerUserId;
                    const userDocRef = doc(firestore, 'users', followerUserId);
                    const userDocSnapshot = await getDoc(userDocRef);
                    return { id: userDocSnapshot.id, ...userDocSnapshot.data() };
                }));

                setFollowers(followersData);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching followers:', error);
                setLoading(false);
            }
        };

        fetchFollowers();
    }, [userId]);

    if (loading) {
        return <ActivityIndicator size="large" color="#0000ff" />;
    }

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Icon name="arrow-back" size={30} color="#000" />
            </TouchableOpacity>
            <ScrollView>
                {followers.map((item) => (
                    <UserCard key={item.id} user={item} />
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

export default FollowersList;
