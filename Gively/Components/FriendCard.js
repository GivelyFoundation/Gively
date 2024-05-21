import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

const profilePicture = require('../assets/Images/profileDefault.png');

const Following = () => {
    return (
        <TouchableOpacity style={[styles.alreadyFollowingbutton, { fontFamily: 'Montserrat-Medium' }]}>
            <Text style={[styles.buttonText, { fontFamily: 'Montserrat-Medium' }]}>Following</Text>
        </TouchableOpacity>
    )

}

const PotentialFriend = () => {
    return (
        <TouchableOpacity style={styles.followButton}>
            <Text style={[styles.buttonText, { fontFamily: 'Montserrat-Medium' }]}>Follow</Text>
        </TouchableOpacity>
    )

}

export const FriendCard = ({ friend }) => {
    return (
        <View style={styles.cardContainer}>
            <Image source={profilePicture} style={styles.profilePicture} />
            <View style={styles.friendInfo}>
                <Text style={styles.friendName}>{friend.name}</Text>
                {friend.areFollowing === true ? <PotentialFriend /> : <Following />}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    cardContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        paddingHorizontal: 20,
        shadowColor: '#ccc',
        shadowOpacity: 1,
        shadowRadius: 2,
        shadowOffset: { width: 0, height: 4 },
    },
    profilePicture: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 10,
    },
    friendInfo: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: .5,
        borderBottomColor: '#ccc',
        paddingBottom: 10,
    },
    friendName: {
        fontSize: 16,
    },
    addFriendbutton: {
        backgroundColor: '#3FC032',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 5,
    },
    followButton: {
        backgroundColor: '#3FC032',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 5,
    },
    alreadyFollowingbutton: {
        backgroundColor: '#1C5AA3',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 5,
    },

    buttonText: {
        color: 'white',
        fontSize: 14,
    },
});