import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { cardStyles } from '../styles/cardStyles';
import { formatDate } from '../utilities/dateFormatter';

const UserHeader = ({ user, date, action, isFirstTimeDonation }) => {
    const navigation = useNavigation();

    const handleNamePress = () => {
        if (user) {
            navigation.navigate('UserScreen', { user });
        } else {
            console.log('User data is not available.');
        }
    };

    const getFirstNameLastInitial = (displayName) => {
        if (!displayName) return '';
        const [firstName, lastName] = displayName.split(' ');
        const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : '';
        return lastName ? `${firstName} ${lastInitial}` : `${firstName}`;
    };

    const formattedName = getFirstNameLastInitial(user.displayName);

    return (
        <View style={cardStyles.header}>
            <TouchableOpacity onPress={handleNamePress}>
                <Image source={{ uri: user.profilePicture }} style={cardStyles.profileImage} />
            </TouchableOpacity>
            <View style={styles.contentContainer}>
                <View style={styles.nameActionContainer}>
                    <TouchableOpacity onPress={handleNamePress}>
                        <Text style={[cardStyles.posterName, { fontFamily: 'Montserrat-Bold' }]}>
                            {formattedName}{isFirstTimeDonation ? "'s" : "."}
                        </Text>
                    </TouchableOpacity>
                    <Text style={styles.actionText}>{action}</Text>
                </View>
                <Text style={[cardStyles.posterDate, styles.datePosition]}>{formatDate(date)}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    contentContainer: {
        flex: 1,
        justifyContent: 'center',
        height: 64,  // Match height of profile image
    },
    nameActionContainer: {
        justifyContent: 'center',
    },
    actionText: {
        fontFamily: 'Montserrat-Medium',
        fontSize: 14,
        color: '#4A4A4A',
        marginTop: 2,
    },
    datePosition: {
        position: 'absolute',
        top: 0,
        right: 0,
    },
});

export default UserHeader;