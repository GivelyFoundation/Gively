import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Picker } from '@react-native-picker/picker';
import { LinkPreview } from '@flyerhq/react-native-link-preview';
import { firebaseService } from '../services/firebaseService';
import { useAuth } from '../services/AuthContext';

const PostCreationModal = ({ visible, onClose, onPostCreated }) => {
  const { userData } = useAuth();
  const [formData, setFormData] = useState({
    postType: '',
    caption: '',
    link: '',
    description: '',
    date: '',
    time: '',
    address: '',
  });
  const [errors, setErrors] = useState({});
  const [showPreview, setShowPreview] = useState(false);

  // Reset form when modal closes
  useEffect(() => {
    if (!visible) {
      resetForm();
    }
  }, [visible]);

  const resetForm = () => {
    setFormData({
      postType: '',
      caption: '',
      link: '',
      description: '',
      date: '',
      time: '',
      address: '',
    });
    setErrors({});
    setShowPreview(false);
  };

  const validateUrl = useCallback((type, url) => {
    const patterns = {
      gofundme: /^https?:\/\/(www\.)?gofundme\.com/,
      petition: /^https?:\/\/(www\.)?change\.org/,
    };
    return patterns[type]?.test(url) ?? true;
  }, []);

  const validateForm = useCallback(() => {
    const newErrors = {};
    
    if (!formData.postType) {
      newErrors.postType = 'Please select a post type';
    }

    if (['gofundme', 'petition'].includes(formData.postType)) {
      if (!formData.link) {
        newErrors.link = 'Please enter a URL';
      } else if (!validateUrl(formData.postType, formData.link)) {
        newErrors.link = `Please enter a valid ${formData.postType === 'gofundme' ? 'GoFundMe' : 'Change.org'} URL`;
      }
    }

    if (formData.postType === 'volunteer') {
      if (!formData.description) newErrors.description = 'Please enter a description';
      if (!formData.date) newErrors.date = 'Please select a date';
      if (!formData.time) newErrors.time = 'Please select a time';
      if (!formData.address) newErrors.address = 'Please enter an address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, validateUrl]);

  const handleSubmit = async () => {
    if (!validateForm()) return;
  
    try {
      const postData = {
        PostType: formData.postType,
        uid: userData.uid,
        Likers: [],
        ...(formData.postType === 'volunteer' 
          ? {
              description: formData.description,
              eventDate: `${formData.date}T${formData.time}`,
              address: formData.address,
            }
          : {
              Link: formData.link,
              postText: formData.caption,
            }
        ),
      };
  
      await firebaseService.createPost(postData);
      onPostCreated?.(); // Call the callback if provided
    } catch (error) {
      console.error('Error creating post:', error);
      setErrors(prev => ({ ...prev, submit: 'Failed to create post. Please try again.' }));
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.modalContainer}
            >
              <View style={styles.content}>
                <View style={styles.header}>
                  <Text style={styles.title}>Create Post</Text>
                  <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                    <Icon name="times" size={24} color="#000" />
                  </TouchableOpacity>
                </View>

                <Picker
                  selectedValue={formData.postType}
                  onValueChange={(value) => {
                    setFormData(prev => ({ ...prev, postType: value }));
                    setShowPreview(false);
                  }}
                  style={styles.picker}
                >
                  <Picker.Item label="Select post type" value="" />
                  <Picker.Item label="GoFundMe" value="gofundme" />
                  <Picker.Item label="Petition" value="petition" />
                  <Picker.Item label="Volunteer Opportunity" value="volunteer" />
                </Picker>
                {errors.postType && <Text style={styles.errorText}>{errors.postType}</Text>}

                {['gofundme', 'petition'].includes(formData.postType) && (
                  <>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter caption"
                      value={formData.caption}
                      onChangeText={(text) => setFormData(prev => ({ ...prev, caption: text }))}
                    />

                    <TextInput
                      style={styles.input}
                      placeholder={`Enter ${formData.postType === 'gofundme' ? 'GoFundMe' : 'Change.org'} URL`}
                      value={formData.link}
                      onChangeText={(text) => {
                        setFormData(prev => ({ ...prev, link: text }));
                        setShowPreview(validateUrl(formData.postType, text));
                      }}
                    />
                    {errors.link && <Text style={styles.errorText}>{errors.link}</Text>}

                    {showPreview && (
                      <View style={styles.previewContainer}>
                        <LinkPreview
                          text={formData.link}
                          renderText={() => null}
                          containerStyle={styles.linkPreview}
                          metadataContainerStyle={styles.metadataContainer}
                          titleStyle={styles.previewTitle}
                          descriptionStyle={styles.previewDescription}
                        />
                      </View>
                    )}
                  </>
                )}

                {formData.postType === 'volunteer' && (
                  <>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter description"
                      value={formData.description}
                      onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                      multiline
                    />
                    {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}

                    {/* Date and Time inputs would go here */}
                    {/* Address input would go here */}
                  </>
                )}

                {errors.submit && <Text style={styles.errorText}>{errors.submit}</Text>}

                <TouchableOpacity 
                  style={styles.submitButton}
                  onPress={handleSubmit}
                >
                  <Text style={styles.submitButtonText}>Create Post</Text>
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxHeight: '80%',
  },
  content: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    maxHeight: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Montserrat-Bold',
  },
  closeButton: {
    padding: 5,
  },
  picker: {
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    fontFamily: 'Montserrat-Regular',
  },
  previewContainer: {
    maxHeight: 150,
    marginBottom: 15,
  },
  linkPreview: {
    backgroundColor: '#F8F9FA',
    padding: 10,
    borderRadius: 8,
  },
  metadataContainer: {
    marginTop: 0,
  },
  previewTitle: {
    fontFamily: 'Montserrat-Medium',
    fontSize: 14,
  },
  previewDescription: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 12,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 10,
    fontFamily: 'Montserrat-Regular',
  },
  submitButton: {
    backgroundColor: '#3FC032',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontFamily: 'Montserrat-Bold',
    fontSize: 16,
  },
});

export default PostCreationModal;