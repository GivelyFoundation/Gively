import React, { useState, useCallback } from 'react';
import { View, TextInput, Text, StyleSheet, Pressable, Alert, ActivityIndicator } from 'react-native';
import { firestore } from '../services/firebaseConfig';
import { query, collection, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import debounce from 'lodash.debounce';
import { useAuth } from '../services/AuthContext';
import Icon from 'react-native-vector-icons/MaterialIcons';

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
    if (username.trim() === '' || !validateUsername(username)) {
      setUsernameAvailable(false);
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
      Alert.alert('Error', 'The username is already taken or invalid. Please choose another one.');
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
    <View style={styles.container}>
      <Text style={styles.title}>Profile Details</Text>
      <View style={styles.inputWrapper}>
        <View style={styles.inputContainer}>
          <Icon name="person" size={20} color="#A9A9A9" />
          <TextInput
            style={styles.input}
            placeholder="Username"
            value={username}
            onChangeText={handleUsernameChange}
          />
          {checkingAvailability ? (
            <ActivityIndicator size="small" color="#0000ff" style={styles.availabilityIndicator} />
          ) : username.trim() !== '' && (
            <Icon
              name={usernameAvailable && !usernameError ? "check" : "close"}
              size={20}
              color={usernameAvailable && !usernameError ? "green" : "red"}
              style={styles.availabilityIndicator}
            />
          )}
        </View>
        {usernameError && <Text style={styles.errorText}>{usernameError}</Text>}
        {!usernameAvailable && !usernameError && <Text style={styles.errorText}>Username is taken</Text>}
      </View>
      <View style={styles.inputWrapper}>
        <View style={styles.inputContainer}>
          <Icon name="person" size={20} color="#A9A9A9" />
          <TextInput
            style={styles.input}
            placeholder="Display Name"
            value={displayName}
            onChangeText={handleDisplayNameChange}
          />
        </View>
        {displayNameError && <Text style={styles.errorText}>{displayNameError}</Text>}
      </View>
      <View style={styles.inputWrapper}>
        <View style={[styles.inputContainer, styles.textAreaContainer]}>
          <Icon name="info" size={20} color="#A9A9A9" />
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Bio"
            value={bio}
            onChangeText={handleBioChange}
            multiline
            numberOfLines={5}
          />
        </View>
        <Text style={styles.charCount}>{bio.length}/{MAX_BIO_LENGTH}</Text>
        {bioError && <Text style={styles.errorText}>{bioError}</Text>}
      </View>
      <Pressable style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Add Profile Details</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center', // Ensure center alignment to avoid shifting
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 30,
    paddingVertical: 40,
  },
  title: {
    fontSize: 28,
    color: '#000',
    marginBottom: 20,
    alignSelf: 'flex-start',
  },
  inputWrapper: {
    width: '100%',
    marginBottom: 10, // Ensure space for error messages
    minHeight: 100, // Set a minimum height to prevent shifting
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#F8F8F8',
  },
  textAreaContainer: {
    height: 100, // Fixed height for text area container
  },
  input: {
    flex: 1,
    marginLeft: 10,
  },
  textArea: {
    textAlignVertical: 'top',
    paddingVertical: 5,
    height: '100%', // Ensure the TextInput takes the full height of the container
  },
  charCount: {
    alignSelf: 'flex-end',
    marginTop: 5,
    color: '#A9A9A9',
  },
  availabilityIndicator: {
    marginLeft: 10,
  },
  errorText: {
    color: 'red',
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  submitButton: {
    width: '100%',
    paddingVertical: 20,
    borderRadius: 12,
    backgroundColor: '#3FC032',
    alignItems: 'center',
    marginBottom: 20,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
  },
});
