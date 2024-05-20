import React, { useState } from 'react';
import { View, Text, Pressable, Image, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { storage } from '../services/firebaseConfig';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../services/AuthContext';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

export default function PhotoUploadForm({ userData, handleChange, nextStep }) {
  const { user } = useAuth();
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleImagePick = async () => {
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

      if (manipResult.uri.size > MAX_IMAGE_SIZE) {
        Alert.alert('Error', 'Image size exceeds the maximum allowed size of 5MB.');
        return;
      }

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
        (snapshot) => {
          // Progress indicator can be added here if needed
        },
        (error) => {
          setUploading(false);
          console.error(error);
          Alert.alert('Error', 'Failed to upload image.');
        },
        async () => {
          const downloadURL = await getDownloadURL(imageRef);
          handleChange('profilePicture', downloadURL);
          setUploading(false);
          nextStep();
        }
      );
    } catch (error) {
      setUploading(false);
      console.error(error);
      Alert.alert('Error', 'Failed to upload image.');
    }
  };

  return (
    <View className="flex-2">
      <View className="flex-1 bg-white rounded-t-3xl px-6 items-center justify-center" style={styles.loginForm}>
        {image ? (
          <Image source={{ uri: image.uri }} style={styles.imagePreview} />
        ) : (
          <Text>No image selected</Text>
        )}
        <Pressable className="bg-blue-600 w-full py-3 rounded-full items-center mb-4" onPress={handleImagePick}>
          <Text className="text-white text-lg">Pick an Image</Text>
        </Pressable>
        <Pressable
          className="bg-green-500 w-full py-3 rounded-full items-center mb-4"
          onPress={handleUpload}
          disabled={uploading}
        >
          <Text className="text-white text-lg">{uploading ? 'Uploading...' : 'Upload Image'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loginForm: {
    marginTop: '40%',
    minHeight: '70%',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 30,
    paddingBottom: 30,
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
});
