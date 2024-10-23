import React from 'react';
import { TouchableOpacity, Image, Text, StyleSheet } from 'react-native';

const likeIcon = require('../assets/Icons/heart.png');

const LikeButton = ({ isLiked = false, likesCount = 0, onPress }) => {
    return (
        <TouchableOpacity style={styles.container} onPress={onPress}>
            <Image 
                source={likeIcon} 
                style={[styles.icon, { tintColor: isLiked ? '#EB5757' : '#8484A9' }]} 
            />
            <Text style={[styles.count, { color: isLiked ? '#EB5757' : '#8484A9' }]}>
                {/* making sure that the likes are never negative */}
                {Math.max(0, likesCount)} 
            </Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    icon: {
        width: 24,
        height: 24,
        marginRight: 5,
    },
    count: {
        fontSize: 16,
        fontFamily: 'Montserrat-Medium',
    },
});

export default LikeButton;