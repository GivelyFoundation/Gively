import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, FlatList, TouchableOpacity, Alert, Modal, ScrollView } from 'react-native';
import { firestore } from '../services/firebaseConfig';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { interests as mockInterests } from '../MockData'; // Import mock data
import { useAuth } from '../services/AuthContext'; // Import useAuth to get the user
import { CommonActions } from '@react-navigation/native';

const MIN_INTERESTS = 3;

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

  // Sort interests to display selected interests at the top
  const sortedInterests = [
    ...selectedInterests.map(name => ({ name })),
    ...filteredInterests.filter(interest => !selectedInterests.includes(interest.name))
  ];

  return (
    <View className="flex-2">
      <View className="bg-white rounded-t-3xl px-6 items-center justify-center" style={styles.container}>
        <Text className="text-2xl font-bold mb-2">Areas of Interests</Text>
        <Text className="text-lg mb-4">
          {selectedInterests.length} Selected <Text style={styles.minInterestsText}>(min. {MIN_INTERESTS})</Text>
        </Text>
        <TextInput
          className="bg-gray-200 w-full rounded-full px-4 py-2 mb-4"
          placeholder="Search"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <View style={styles.popularInterestsHeader}>
          <Text className="text-lg mb-2">Popular Interests</Text>
          <Pressable onPress={() => setModalVisible(true)}>
            <Text className="text-blue-600">See All</Text>
          </Pressable>
        </View>
        <View style={styles.interestsContainer}>
          {sortedInterests.slice(0, 10).map((item) => (
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
        </View>
        <Pressable
          className={`bg-green-500 w-full py-3 rounded-full items-center mb-4 ${selectedInterests.length < MIN_INTERESTS ? 'opacity-50' : ''}`}
          onPress={handleDone}
          disabled={selectedInterests.length < MIN_INTERESTS}
        >
          <Text className="text-white text-lg">Done</Text>
        </Pressable>
        <Text className="text-sm underline">Not Interested? <Text onPress={handleDone} className="text-blue-600">Skip</Text></Text>
      </View>

      {/* Modal for showing all interests */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text className="text-2xl font-bold mb-4">All Interests <Text style={styles.minInterestsText}>({selectedInterests.length} selected)</Text></Text>
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
              className="bg-green-500 w-full py-3 rounded-full items-center mt-4"
              onPress={() => setModalVisible(false)}
            >
              <Text className="text-white text-lg">Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: '40%',
    minHeight: '70%',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 30,
    paddingBottom: 30,
  },
  interestBubble: {
    padding: 10,
    borderRadius: 20,
    margin: 5,
  },
  selected: {
    backgroundColor: '#3FC032',
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
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  popularInterestsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 10,
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
  modalInterestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  minInterestsText: {
    fontSize: 14,
    color: '#888',
  },
});

export default InterestsSelectionForm;
