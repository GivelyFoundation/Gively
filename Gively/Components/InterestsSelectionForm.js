import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, TouchableOpacity, Alert, Modal, ScrollView } from 'react-native';
import { firestore } from '../services/firebaseConfig';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { interests as mockInterests } from '../MockData'; // Import mock data
import { useAuth } from '../services/AuthContext'; // Import useAuth to get the user
import { CommonActions } from '@react-navigation/native';

const MIN_INTERESTS = 3;
const MAX_DISPLAY_INTERESTS = 11;
const GREEN_COLOR = '#3FC032';

const InterestsSelectionForm = ({ userData, handleChange, navigation }) => {
  const { user, endSignUp } = useAuth(); // Get the current user and endSignUp function
  const [selectedInterests, setSelectedInterests] = useState(userData.interests || []);
  const [searchQuery, setSearchQuery] = useState('');
  const [interests, setInterests] = useState(mockInterests); // Use mock data as default
  const [modalVisible, setModalVisible] = useState(false);

  // Commented out Firestore query for interests, replace with actual implementation later
  // useEffect(() => {
  //   const fetchInterests = async () => {
  //     try {
  //       const querySnapshot = await getDocs(collection(firestore, 'interests'));
  //       const interestsData = querySnapshot.docs.map(doc => doc.data());
  //       setInterests(interestsData);
  //     } catch (error) {
  //       console.error('Error fetching interests from Firestore:', error);
  //     }
  //   };

  //   fetchInterests();
  // }, []);

  const toggleInterest = (interest) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(item => item !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleDone = async () => {
    if (selectedInterests.length < MIN_INTERESTS) {
      Alert.alert('Error', `Please select at least ${MIN_INTERESTS} interests.`);
    } else {
      handleChange('interests', selectedInterests);

      try {
        // Update the user's document in Firestore with the selected interests
        const userDocRef = doc(firestore, 'users', user.uid);
        await updateDoc(userDocRef, {
          interests: selectedInterests,
        });

        endSignUp(); // Call endSignUp to indicate the end of the signup process

        // Navigate to Home screen
        navigation.dispatch(CommonActions.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        }));
      } catch (error) {
        Alert.alert('Error', 'Failed to update interests. Please try again.');
        console.error('Error updating interests in Firestore:', error);
      }
    }
  };

  const filteredInterests = interests.filter(interest => interest.name.toLowerCase().includes(searchQuery.toLowerCase()));

  // Combine selected interests with popular interests, limiting the total to MAX_DISPLAY_INTERESTS
  const sortedInterests = [
    ...selectedInterests.map(name => ({ name })),
    ...filteredInterests.filter(interest => !selectedInterests.includes(interest.name))
  ].slice(0, Math.max(selectedInterests.length, MAX_DISPLAY_INTERESTS));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Areas of Interests</Text>
        <Text style={styles.subtitle}>
          {selectedInterests.length} Selected <Text style={styles.minInterestsText}>(min. {MIN_INTERESTS})</Text>
        </Text>
      </View>
      <TextInput
        style={styles.searchInput}
        placeholder="Search"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <View style={styles.popularInterestsHeader}>
        <Text style={styles.popularInterestsTitle}>Popular Interests</Text>
        <Pressable onPress={() => setModalVisible(true)}>
          <Text style={styles.seeAllText}>See All</Text>
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.interestsContainer}>
        {sortedInterests.map((item) => (
          <TouchableOpacity
            key={item.name}
            style={[
              styles.interestBubble,
              selectedInterests.includes(item.name) ? styles.selected : styles.unselected
            ]}
            onPress={() => toggleInterest(item.name)}
          >
            <Text style={[
              selectedInterests.includes(item.name) ? styles.selectedText : styles.unselectedText
            ]}>
              {item.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <Pressable
        style={[styles.doneButton, selectedInterests.length < MIN_INTERESTS && styles.disabledButton]}
        onPress={handleDone}
        disabled={selectedInterests.length < MIN_INTERESTS}
      >
        <Text style={styles.doneButtonText}>Done</Text>
      </Pressable>

      {/* Modal for showing all interests */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>All Interests <Text style={styles.minInterestsText}>({selectedInterests.length} selected)</Text></Text>
            <ScrollView contentContainerStyle={styles.modalInterestsContainer}>
              {interests.map((item) => (
                <TouchableOpacity
                  key={item.name}
                  style={[
                    styles.interestBubble,
                    selectedInterests.includes(item.name) ? styles.selected : styles.unselected
                  ]}
                  onPress={() => toggleInterest(item.name)}
                >
                  <Text style={[
                    selectedInterests.includes(item.name) ? styles.selectedText : styles.unselectedText
                  ]}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Pressable
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingTop: 5, 
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 5, 
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#888',
  },
  minInterestsText: {
    fontSize: 14,
    color: '#888',
  },
  searchInput: {
    width: '100%',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#F8F8F8',
    marginBottom: 20,
  },
  popularInterestsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 10,
  },
  popularInterestsTitle: {
    fontSize: 18,
    color: '#000',
  },
  seeAllText: {
    fontSize: 16,
    color: '#1C5AA3',
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
  },
  interestBubble: {
    padding: 10,
    borderRadius: 20,
    margin: 5,
  },
  selected: {
    backgroundColor: GREEN_COLOR,
  },
  unselected: {
    backgroundColor: '#E0E0E0',
  },
  selectedText: {
    color: 'white',
  },
  unselectedText: {
    color: 'black',
  },
  doneButton: {
    width: '100%',
    paddingVertical: 20,
    borderRadius: 12,
    backgroundColor: GREEN_COLOR,
    alignItems: 'center',
  },
  doneButtonText: {
    color: 'white',
    fontSize: 16,
  },
  disabledButton: {
    opacity: 0.5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    height: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalInterestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  closeButton: {
    width: '100%',
    paddingVertical: 20,
    borderRadius: 12,
    backgroundColor: GREEN_COLOR,
    alignItems: 'center',
    marginTop: 20,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default InterestsSelectionForm;
