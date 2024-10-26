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
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import DropDownPicker from 'react-native-dropdown-picker';
import { LinkPreview } from '@flyerhq/react-native-link-preview';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import moment from 'moment';
import axios from 'axios';
import { firebaseService } from '../services/firebaseService';
import { useAuth } from '../services/AuthContext';
import { GOOGLE_MAPS_API_KEY } from '@env';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const POST_TYPES = [
  { label: 'GoFundMe', value: 'gofundme' },
  { label: 'Petition', value: 'petition' },
  { label: 'Volunteer Opportunity', value: 'volunteer' },
];

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
        location: null,
    });
    const [errors, setErrors] = useState({});
    const [showPreview, setShowPreview] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [items] = useState(POST_TYPES);
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const [isTimePickerVisible, setTimePickerVisibility] = useState(false);

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
        location: null,
        });
        setErrors({});
        setShowPreview(false);
        setOpen(false);
    };

    const handleClose = useCallback(() => {
        const hasUnsavedChanges = Object.values(formData).some(value => value !== '');
        
        if (hasUnsavedChanges) {
        Alert.alert(
            'Discard Changes',
            'Are you sure you want to discard your changes?',
            [
            { text: 'Cancel', style: 'cancel' },
            { 
                text: 'Discard',
                style: 'destructive',
                onPress: () => {
                resetForm();
                onClose();
                }
            }
            ]
        );
        } else {
        onClose();
        }
    }, [formData, onClose]);

    const validateUrl = useCallback((type, url) => {
    const patterns = {
        gofundme: /^https?:\/\/(www\.)?gofundme\.com/,
        petition: /^https?:\/\/(www\.)?change\.org/,
    };
    return patterns[type]?.test(url) ?? true;
    }, []);

    const validateAddress = async (address) => {
        try {
        const response = await axios.get(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${GOOGLE_MAPS_API_KEY}`
        );
        const { results } = response.data;
        if (results.length > 0) {
            return results[0].geometry.location;
        }
        return null;
        } catch (error) {
        console.error('Error validating address: ', error);
        return null;
        }
    };

    const showDatePicker = () => setDatePickerVisibility(true);
    const hideDatePicker = () => setDatePickerVisibility(false);
    const handleConfirmDate = (selectedDate) => {
        setFormData(prev => ({
        ...prev,
        date: moment(selectedDate).format('YYYY-MM-DD')
        }));
        hideDatePicker();
    };

    // Time picker handlers
    const showTimePicker = () => setTimePickerVisibility(true);
    const hideTimePicker = () => setTimePickerVisibility(false);
    const handleConfirmTime = (selectedTime) => {
        setFormData(prev => ({
        ...prev,
        time: moment(selectedTime).format('HH:mm')
        }));
        hideTimePicker();
    };


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
          if (!formData.caption) {
            newErrors.caption = 'Please enter a caption';
          }
        }
    
        if (formData.postType === 'volunteer') {
          if (!formData.description) {
            newErrors.description = 'Please enter a description';
          }
          if (!formData.date) newErrors.date = 'Please select a date';
          if (!formData.time) newErrors.time = 'Please select a time';
          if (!formData.address) newErrors.address = 'Please enter an address';
        }
    
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
      }, [formData, validateUrl]);
    
      const handleSubmit = async () => {
        if (isLoading || !validateForm()) return;
    
        try {
          setIsLoading(true);
          setErrors({});
    
          let location = null;
          if (formData.postType === 'volunteer') {
            location = await validateAddress(formData.address);
            if (!location) {
              setErrors(prev => ({
                ...prev,
                address: 'Invalid address. Please enter a valid address.',
              }));
              return;
            }
          }
    
          const postData = {
            PostType: formData.postType,
            uid: userData.uid,
            Likers: [],
            ...(formData.postType === 'volunteer' 
              ? {
                  description: formData.description,
                  eventDate: `${formData.date}T${formData.time}`,
                  address: formData.address,
                  location: {
                    latitude: location.lat,
                    longitude: location.lng,
                  },
                }
              : {
                  Link: formData.link,
                  postText: formData.caption,
                }
            ),
          };
    
          const createdPost = await firebaseService.createPost(postData);
          onPostCreated?.(createdPost);
          resetForm();
        } catch (error) {
          console.error('Error creating post:', error);
          setErrors(prev => ({ 
            ...prev, 
            submit: 'Failed to create post. Please try again.' 
          }));
        } finally {
          setIsLoading(false);
        }
      };
    
      const isFormValid = useCallback(() => {
        if (!formData.postType) return false;
      
        if (['gofundme', 'petition'].includes(formData.postType)) {
          return formData.link && validateUrl(formData.postType, formData.link);
        }
      
        if (formData.postType === 'volunteer') {
          return formData.description && formData.date && formData.time && formData.address;
        }
      
        return false;
      }, [formData, validateUrl]);
    
      return (
        <Modal
          visible={visible}
          transparent
          animationType="slide"
          onRequestClose={handleClose}
        >
          <TouchableWithoutFeedback onPress={handleClose}>
            <View style={styles.overlay}>
              <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <KeyboardAvoidingView
                  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                  style={styles.modalContainer}
                >
                  <View style={styles.content}>
                    <View style={styles.header}>
                      <Text style={styles.title}>Create Post</Text>
                      <TouchableOpacity 
                        onPress={handleClose} 
                        style={styles.closeButton}
                      >
                        <Icon name="times" size={24} color="#000" />
                      </TouchableOpacity>
                    </View>
    
                    <View style={styles.formContainer}>
                      <DropDownPicker
                        open={open}
                        value={formData.postType}
                        items={items}
                        setOpen={setOpen}
                        setValue={(callback) => {
                          const newValue = callback(formData.postType);
                          setFormData(prev => ({ ...prev, postType: newValue }));
                          setShowPreview(false);
                          setErrors({});
                        }}
                        style={[
                          styles.dropdown,
                          errors.postType && styles.inputError
                        ]}
                        textStyle={styles.dropdownText}
                        dropDownContainerStyle={styles.dropdownContainer}
                        placeholder="Select post type"
                        listMode="SCROLLVIEW"
                        scrollViewProps={{
                          nestedScrollEnabled: true,
                        }}
                        zIndex={3000}
                        zIndexInverse={1000}
                        disabled={isLoading}
                      />
                      {errors.postType && <Text style={styles.errorText}>{errors.postType}</Text>}
    
                      <View style={styles.fieldsContainer}>
                        {['gofundme', 'petition'].includes(formData.postType) && (
                          <>
                            <TextInput
                              style={[
                                styles.input,
                                errors.caption && styles.inputError
                              ]}
                              placeholder="Enter caption"
                              value={formData.caption}
                              onChangeText={(text) => setFormData(prev => ({ ...prev, caption: text }))}
                              editable={!isLoading}
                            />
                            {errors.caption && <Text style={styles.errorText}>{errors.caption}</Text>}
    
                            <TextInput
                              style={[
                                styles.input,
                                errors.link && styles.inputError
                              ]}
                              placeholder={`Enter ${formData.postType === 'gofundme' ? 'GoFundMe' : 'Change.org'} URL`}
                              value={formData.link}
                              onChangeText={(text) => {
                                setFormData(prev => ({ ...prev, link: text }));
                                setShowPreview(validateUrl(formData.postType, text));
                              }}
                              editable={!isLoading}
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
                                  touchableWithoutFeedback={false}
                                />
                              </View>
                            )}
                          </>
                        )}
    
                        {formData.postType === 'volunteer' && (
                          <>
                            <TextInput
                              style={[
                                styles.input,
                                styles.multilineInput,
                                errors.description && styles.inputError
                              ]}
                              placeholder="Enter description"
                              value={formData.description}
                              onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                              multiline
                              numberOfLines={4}
                              editable={!isLoading}
                            />
                            {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
    
                            <TouchableOpacity 
                              style={[styles.input, errors.date && styles.inputError]}
                              onPress={showDatePicker}
                              disabled={isLoading}
                            >
                              <Text style={styles.pickerText}>
                                {formData.date || "Select Date"}
                              </Text>
                            </TouchableOpacity>
                            {errors.date && <Text style={styles.errorText}>{errors.date}</Text>}
    
                            <TouchableOpacity 
                              style={[styles.input, errors.time && styles.inputError]}
                              onPress={showTimePicker}
                              disabled={isLoading}
                            >
                              <Text style={styles.pickerText}>
                                {formData.time || "Select Time"}
                              </Text>
                            </TouchableOpacity>
                            {errors.time && <Text style={styles.errorText}>{errors.time}</Text>}
    
                            <GooglePlacesAutocomplete
                                placeholder="Enter address"
                                minLength={2}
                                fetchDetails={true}
                                onPress={(data, details = null) => {
                                    setFormData(prev => ({ 
                                    ...prev, 
                                    address: data.description 
                                    }));
                                }}
                                query={{
                                    key: GOOGLE_MAPS_API_KEY,
                                    language: 'en',
                                }}
                                styles={{
                                    container: {
                                    flex: 0, // This is important
                                    },
                                    textInput: [
                                    styles.input,
                                    errors.address && styles.inputError,
                                    { height: 40 }
                                    ],
                                    listView: {
                                    maxHeight: 150, // Limit the height of suggestions
                                    backgroundColor: 'white',
                                    borderRadius: 8,
                                    borderWidth: 1,
                                    borderColor: '#ddd',
                                    marginTop: 4,
                                    overflow: 'scroll', // Allow scrolling within limited height
                                    },
                                    row: {
                                    padding: 13,
                                    height: 44,
                                    fontSize: 14,
                                    },
                                    description: {
                                    fontSize: 14,
                                    }
                                }}
                                enablePoweredByContainer={false}
                                nearbyPlacesAPI='GooglePlacesSearch'
                                debounce={200}
                                disabled={isLoading}
                                />


                            {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}
    
                            <DateTimePickerModal
                              isVisible={isDatePickerVisible}
                              mode="date"
                              onConfirm={handleConfirmDate}
                              onCancel={hideDatePicker}
                              minimumDate={new Date()}
                            />
    
                            <DateTimePickerModal
                              isVisible={isTimePickerVisible}
                              mode="time"
                              onConfirm={handleConfirmTime}
                              onCancel={hideTimePicker}
                            />
                          </>
                        )}
                      </View>
    
                      {errors.submit && <Text style={styles.errorText}>{errors.submit}</Text>}
    
                      <TouchableOpacity 
                        style={[
                          styles.submitButton,
                          (!isFormValid() || isLoading) && styles.submitButtonDisabled
                        ]}
                        onPress={handleSubmit}
                        disabled={!isFormValid() || isLoading}
                      >
                        {isLoading ? (
                          <ActivityIndicator color="#fff" />
                        ) : (
                          <Text style={styles.submitButtonText}>Create Post</Text>
                        )}
                      </TouchableOpacity>
                    </View>
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
        maxHeight: SCREEN_HEIGHT * 0.8,
        minHeight: SCREEN_HEIGHT * 0.4,
      },
      content: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        height: '100%',
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
      formContainer: {
        flex: 1,
      },
      fieldsContainer: {
        marginTop: 15,
      },
      dropdown: {
        borderColor: '#ddd',
        borderRadius: 8,
      },
      dropdownContainer: {
        borderColor: '#ddd',
        borderRadius: 8,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      dropdownText: {
        fontFamily: 'Montserrat-Regular',
        fontSize: 16,
      },
      input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        marginBottom: 15,
        fontFamily: 'Montserrat-Regular',
        fontSize: 16,
      },
      multilineInput: {
        height: 100,
        textAlignVertical: 'top',
      },
      previewContainer: {
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
        marginTop: 'auto',
      },
      submitButtonDisabled: {
        opacity: 0.7,
      },
      submitButtonText: {
        color: '#fff',
        fontFamily: 'Montserrat-Bold',
        fontSize: 16,
      },
      inputError: {
        borderColor: 'red',
      },
      addressListView: {
        backgroundColor: 'white',
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 8,
        marginTop: 4,
      },
      addressRow: {
        padding: 13,
        height: 44,
        fontSize: 14,
      },
      addressDescription: {
        fontSize: 14,
      },
      pickerText: {
        fontFamily: 'Montserrat-Regular',
        fontSize: 16,
        color: '#333',
      },
    });
    
    export default PostCreationModal;