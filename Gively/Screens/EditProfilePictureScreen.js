import React, { useState } from 'react';
import { View, Image, StyleSheet, Text, Pressable, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { storage, firestore } from '../services/firebaseConfig';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../services/AuthContext';
import Icon from 'react-native-vector-icons/MaterialIcons';


export default function EditProfilePictureScreen({ navigation }) {
    const { user, setUserData } = useAuth();
    const [image, setImage] = useState(null);
    const [uploading, setUploading] = useState(false);

    const handleImagePick = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1], // Square crop
            quality: 0.7,
        });

        if (!result.canceled) {
            const manipResult = await ImageManipulator.manipulateAsync(
                result.assets[0].uri,
                [{ resize: { width: 300, height: 300 } }],
                { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
            );
            setImage(manipResult);
        }
    };

    const handleUpload = async () => {
        if (!image) {
            Alert.alert('Error', 'No image selected.');
            return;
        }

        setUploading(true);
        const imageRef = ref(storage, `profilePictures/${user.uid}.jpg`);

        try {
            const response = await fetch(image.uri);
            const blob = await response.blob();
            const uploadTask = uploadBytesResumable(imageRef, blob);

            uploadTask.on(
                'state_changed',
                null,
                (error) => {
                    setUploading(false);
                    Alert.alert('Error', 'Upload failed. Try again.');
                },
                async () => {
                    const downloadURL = await getDownloadURL(imageRef);
                    const userDocRef = doc(firestore, 'users', user.uid);
                    await updateDoc(userDocRef, { profilePicture: downloadURL });

                    Alert.alert('Success', 'Profile picture updated!');
                   setUserData(prevUserData => ({
                    ...prevUserData, 
                    profilePicture: downloadURL
                   }))
                    navigation.goBack();
                }
            );
        } catch (error) {
            setUploading(false);
            Alert.alert('Error', 'Image upload failed.');
        }
    };

    return (
        <View style={styles.container}>
             <TouchableOpacity onPress={() => navigation.navigate('EditProfile')} style={styles.backButton}>
                <Icon name="arrow-back" size={30} color="#000" />
            </TouchableOpacity>
             <View style={styles.body}>
        
            <Text style={styles.title}>Change Profile Picture</Text>
            <View style={styles.imageWrapper}>
                {image ? (
                    <Image source={{ uri: image.uri }} style={styles.imagePreview} />
                ) : (
                    <Icon name="person" size={100} color="#A9A9A9" />
                )}
            </View>
            <Pressable style={styles.button} onPress={handleImagePick}>
                <Text style={styles.buttonText}>Choose Image</Text>
            </Pressable>
            <Pressable 
                style={[styles.uploadButton, !image && styles.disabledButton]} 
                onPress={handleUpload} 
                disabled={!image || uploading}
            >
                <Text style={styles.buttonText}>{uploading ? 'Uploading...' : 'Upload Image'}</Text>
            </Pressable>
            {uploading && <ActivityIndicator size="small" color="#0000ff" />}
       
             </View>
            </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff"
    },
    body: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 30,
    },
    backButton: {
        paddingTop: 60,
        paddingLeft: 20,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    imageWrapper: {
        width: 150,
        height: 150,
        borderRadius: 75,
        borderWidth: 1,
        borderColor: '#ccc',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8F8F8',
        marginBottom: 20,
    },
    imagePreview: {
        width: 150,
        height: 150,
        borderRadius: 75,
    },
    button: {
        backgroundColor: '#3FC032',
        padding: 12,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 15,
        width: '80%',
    },
    uploadButton: {
        backgroundColor: '#3FC032',
        padding: 12,
        borderRadius: 10,
        alignItems: 'center',
        width: '80%',
    },
    disabledButton: {
        backgroundColor: '#ccc',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
    },
});
