import React, { useState, useCallback } from 'react';
import { View, TextInput, Text, StyleSheet, Pressable, Alert, ActivityIndicator } from 'react-native';
import { firestore } from '../services/firebaseConfig';
import { query, collection, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import debounce from 'lodash.debounce';
import { useAuth } from '../services/AuthContext';

const MAX_USERNAME_LENGTH = 15;
const MAX_DISPLAYNAME_LENGTH = 30;
const MAX_BIO_LENGTH = 150;

export default function ProfileDetailsForm({ userData, handleChange, nextStep }) {
  const { user } = useAuth();

  const [username, setUsername] = useState(userData.username || '');
  const [displayName, setDisplayName] = useState(userData.displayName || '');
  const [bio, setBio] = useState(userData.bio || '');
  const [usernameAvailable, setUsernameAvailable] = useState(true);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [displayNameError, setDisplayNameError] = useState('');
  const [bioError, setBioError] = useState('');

  const validateUsername = (username) => {
    const re = /^[a-zA-Z0-9_]+$/;
    return re.test(username) && username.length <= MAX_USERNAME_LENGTH;
  };

  const validateDisplayName = (displayName) => {
    const re = /^[a-zA-Z0-9\s]+$/;
    return re.test(displayName) && displayName.length <= MAX_DISPLAYNAME_LENGTH;
  };

  const validateBio = (bio) => {
    return bio.length <= MAX_BIO_LENGTH;
  };

  const checkUsernameAvailability = async (username) => {
    setCheckingAvailability(true);
    if (username.trim() === '') {
      setUsernameAvailable(true);
      setCheckingAvailability(false);
      return;
    }
    const q = query(collection(firestore, "users"), where("username", "==", username));
    const querySnapshot = await getDocs(q);
    setUsernameAvailable(querySnapshot.empty); // true if no documents are found
    setCheckingAvailability(false);
  };

  const debouncedCheckUsername = useCallback(debounce(checkUsernameAvailability, 500), []);

  const handleUsernameChange = (text) => {
    const normalizedUsername = text.toLowerCase().slice(0, MAX_USERNAME_LENGTH);
    setUsername(normalizedUsername);
    handleChange('username', normalizedUsername);
    debouncedCheckUsername(normalizedUsername);

    if (!validateUsername(normalizedUsername)) {
      setUsernameError(`Invalid username. Use letters, numbers, and underscores. Max length: ${MAX_USERNAME_LENGTH}.`);
    } else {
      setUsernameError('');
    }
  };

  const handleDisplayNameChange = (text) => {
    const normalizedDisplayName = text.slice(0, MAX_DISPLAYNAME_LENGTH);
    setDisplayName(normalizedDisplayName);
    handleChange('displayName', normalizedDisplayName);

    if (!validateDisplayName(normalizedDisplayName)) {
      setDisplayNameError(`Invalid display name. Use letters and numbers only. Max length: ${MAX_DISPLAYNAME_LENGTH}.`);
    } else {
      setDisplayNameError('');
    }
  };

  const handleBioChange = (text) => {
    const normalizedBio = text.slice(0, MAX_BIO_LENGTH);
    setBio(normalizedBio);
    handleChange('bio', normalizedBio);

    if (!validateBio(normalizedBio)) {
      setBioError(`Bio is too long. Max length: ${MAX_BIO_LENGTH}.`);
    } else {
      setBioError('');
    }
  };

  const handleSubmit = async () => {
    if (!usernameAvailable) {
      Alert.alert('Error', 'The username is already taken. Please choose another one.');
      return;
    }

    if (usernameError || displayNameError || bioError) {
      Alert.alert('Error', 'Please correct the errors before submitting.');
      return;
    }

    const userDocRef = doc(firestore, 'users', user.uid);

    try {
      await updateDoc(userDocRef, {
        username,
        displayName,
        bio,
      });
      nextStep();
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile details. Please try again.');
    }
  };

  return (
    <View className="flex-2">
      <View className="flex-1 bg-white rounded-t-3xl px-6 items-center justify-center" style={styles.loginForm}>
        <View className="w-full mb-4 mt-8">
          <TextInput
            className="bg-gray-200 w-full rounded-full px-4 py-2"
            placeholder="Username"
            value={username}
            onChangeText={handleUsernameChange}
          />
          {usernameError ? <Text className="text-red-500">{usernameError}</Text> : null}
          {checkingAvailability ? (
            <ActivityIndicator size="small" color="#0000ff" />
          ) : username.trim() !== '' && (
            <View className="flex-row items-center mt-1">
              <Text className={usernameAvailable ? "text-green-500" : "text-red-500"}>
                {usernameAvailable ? 'Username is available' : 'Username is taken'}
              </Text>
              {usernameAvailable ? (
                <Text className="ml-2 text-green-500">✔</Text>
              ) : (
                <Text className="ml-2 text-red-500">✘</Text>
              )}
            </View>
          )}
        </View>
        <TextInput
          className="bg-gray-200 w-full rounded-full px-4 py-2 mb-4"
          placeholder="Display Name"
          value={displayName}
          onChangeText={handleDisplayNameChange}
        />
        {displayNameError ? <Text className="text-red-500">{displayNameError}</Text> : null}
        <TextInput
          className="bg-gray-200 w-full rounded-full px-4 py-2 mb-8"
          placeholder="Bio"
          value={bio}
          onChangeText={handleBioChange}
          multiline
        />
        {bioError ? <Text className="text-red-500">{bioError}</Text> : null}
        <Pressable className="bg-green-500 w-full py-3 rounded-full items-center mb-4" onPress={handleSubmit}>
          <Text className="text-white text-lg">Add Profile Details</Text>
        </Pressable>
      </View>
    </View>
  );
};

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
});
