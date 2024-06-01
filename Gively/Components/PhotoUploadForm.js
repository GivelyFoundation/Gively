import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, Image, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { storage, firestore } from '../services/firebaseConfig';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../services/AuthContext';
import Icon from 'react-native-vector-icons/MaterialIcons';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

export default function PhotoUploadForm({ userData, handleChange, nextStep }) {
  const { user } = useAuth();
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false); // State to manage loading indicator

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Sorry, we need camera roll permissions to make this work!');
      }
    })();
  }, []);

  const handleImagePick = async () => {
    setLoading(true); // Show loading indicator
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1], // Aspect ratio 1:1 for square images
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
    } catch (error) {
      console.error('Image picking error:', error);
      Alert.alert('Error', 'Failed to pick image.');
    } finally {
      setLoading(false); // Hide loading indicator
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
        (snapshot) => {
          // Progress indicator can be added here if needed
        },
        (error) => {
          setUploading(false);
          console.error('Upload error:', error);
          Alert.alert('Error', 'Failed to upload image.');
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(imageRef);
            handleChange('profilePicture', downloadURL);

            // Update Firestore user document with the image URL
            const userDocRef = doc(firestore, 'users', user.uid);
            await updateDoc(userDocRef, {
              profilePicture: downloadURL
            });
            nextStep();
          } catch (error) {
            console.error('Error getting download URL or updating document:', error);
            Alert.alert('Error', 'Failed to save profile picture URL.');
          } finally {
            setUploading(false);
          }
        }
      );
    } catch (error) {
      setUploading(false);
      console.error('Image upload error:', error);
      Alert.alert('Error', 'Failed to upload image.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upload Profile Picture</Text>
      <View style={styles.imageWrapper}>
        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <>
            {image ? (
              <View style={styles.imageContainer}>
                <Image source={{ uri: image.uri }} style={styles.imagePreview} />
                <Pressable style={styles.editIcon} onPress={handleImagePick}>
                  <Icon name="edit" size={20} color="#fff" />
                </Pressable>
              </View>
            ) : (
              <View style={styles.placeholderContainer}>
                <Icon name="person" size={80} color="#A9A9A9" />
                <Pressable style={styles.editIcon} onPress={handleImagePick}>
                  <Icon name="edit" size={20} color="#fff" />
                </Pressable>
              </View>
            )}
          </>
        )}
      </View>
      <Pressable
        style={[styles.uploadButton, !image ? styles.disabledButton : null]}
        onPress={handleUpload}
        disabled={uploading || !image}
      >
        <Text style={styles.uploadButtonText}>{uploading ? 'Uploading...' : 'Upload Image'}</Text>
      </Pressable>
      {uploading && <ActivityIndicator size="small" color="#0000ff" />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 30,
    paddingVertical: 40,
  },
  title: {
    fontSize: 28,
    color: '#000',
    marginBottom: 20,
    // alignSelf: 'flex-start',
  },
  imageWrapper: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  imageContainer: {
    position: 'relative',
  },
  imagePreview: {
    width: 150,
    height: 150,
    borderRadius: 10,
    marginBottom: 20,
  },
  placeholderContainer: {
    width: 150,
    height: 150,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    marginBottom: 20,
  },
  editIcon: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#000',
    borderRadius: 10,
    padding: 5,
  },
  uploadButton: {
    width: '100%',
    paddingVertical: 20,
    borderRadius: 12,
    backgroundColor: '#3FC032',
    alignItems: 'center',
    marginBottom: 20,
  },
  uploadButtonText: {
    color: 'white',
    fontSize: 16,
  },
  disabledButton: {
    opacity: 0.5,
  },
});
