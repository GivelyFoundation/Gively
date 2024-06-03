import React from 'react';
import { View, StyleSheet } from 'react-native';
import { VolunteerCard } from '../Components/VolunteerCard';
import { useAuth } from '../services/AuthContext';

const VolunteerPreview = ({ data }) => {
    const { userData } = useAuth();
    const dataWithProfilePicture = { ...data, originalPosterProfileImage: userData.profilePicture };
    return (
        <View style={styles.card}>
            <VolunteerCard data={dataWithProfilePicture} />
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        marginVertical: 20,
    },
});

export default VolunteerPreview;
