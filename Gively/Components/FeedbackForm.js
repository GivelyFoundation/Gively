import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Modal, FlatList, TouchableWithoutFeedback } from 'react-native';
import { useAuth } from '../services/AuthContext';

const subjects = [
  { label: "Select a subject", value: "" },
  { label: "Bug Report", value: "Bug Report" },
  { label: "Feature Request", value: "Feature Request" },
  { label: "General Feedback", value: "General Feedback" },
];

const MAX_MESSAGE_LENGTH = 500; // Set the maximum character limit

const FeedbackForm = () => {
  const { userData } = useAuth();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [dropdownLayout, setDropdownLayout] = useState({x: 0, y: 0, width: 0, height: 0});
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (modalVisible && dropdownRef.current) {
      dropdownRef.current.measure((fx, fy, width, height, px, py) => {
        setDropdownLayout({x: px, y: py + height, width, height});
      });
    }
  }, [modalVisible]);

  const handleSubmit = () => {
    if (!subject || !message) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // Console log the feedback for testing purposes
    console.log('Feedback submitted:', { 
      userId: userData?.uid,
      userEmail: userData?.email,
      subject, 
      message 
    });

    Alert.alert('Success', 'Feedback submitted successfully');
    setSubject('');
    setMessage('');

    // TODO: Implement Firestore integration
    // TODO: Implement email automation using Firebase Functions
    // TODO: Implement file attachment
  };

  const renderSubjectItem = ({ item }) => (
    <TouchableOpacity
      style={styles.subjectItem}
      onPress={() => {
        setSubject(item.value);
        setModalVisible(false);
      }}
    >
      <Text style={styles.subjectItemText}>{item.label}</Text>
    </TouchableOpacity>
  );

  const isSubmitDisabled = subject === '' || subject === 'Select a subject' || message.length === 0;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        ref={dropdownRef}
        style={styles.dropdownButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.dropdownButtonText}>
          {subject || "Select a subject"}
        </Text>
      </TouchableOpacity>

      <Modal
        animationType="none"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={[styles.modalView, {
                position: 'absolute',
                left: dropdownLayout.x,
                top: dropdownLayout.y,
                width: dropdownLayout.width,
              }]}>
                <FlatList
                  data={subjects}
                  renderItem={renderSubjectItem}
                  keyExtractor={(item) => item.value}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <TextInput
        style={styles.input}
        multiline
        numberOfLines={4}
        onChangeText={(text) => setMessage(text.slice(0, MAX_MESSAGE_LENGTH))}
        value={message}
        placeholder="Your feedback"
        textAlignVertical="top"
        maxLength={MAX_MESSAGE_LENGTH}
      />
      <Text style={styles.characterCount}>
        {message.length}/{MAX_MESSAGE_LENGTH}
      </Text>

      <TouchableOpacity 
        style={[styles.submitButton, isSubmitDisabled && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={isSubmitDisabled}
      >
        <Text style={styles.buttonText}>Submit Feedback</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  dropdownButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 5,
    minHeight: 100,
    fontFamily: 'Montserrat-Regular',
  },
  characterCount: {
    alignSelf: 'flex-end',
    marginBottom: 15,
    color: '#666',
    fontSize: 12,
  },
  submitButton: {
    backgroundColor: '#3FC032',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#A0A0A0',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Montserrat-Medium',
  },
  modalOverlay: {
    flex: 1,
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    maxHeight: 200,
  },
  subjectItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  subjectItemText: {
    fontSize: 16,
  },
});

export default FeedbackForm;