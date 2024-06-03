import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity, ScrollView } from 'react-native';
import axios from 'axios';
import { firestore } from '../services/firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../services/AuthContext';
import VolunteerPreview from '../Components/VolunteerPreview';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import moment from 'moment';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

const GOOGLE_MAPS_API_KEY = 'AIzaSyB3BJsdRyNl8T10Avaaz69YkKV7bkGgqoU'; // Replace with your Google Maps API key

export default function VolunteerScreen({ navigation }) {
    const [description, setDescription] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [address, setAddress] = useState('');
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState({});
    const [isVisible, setIsVisible] = useState(false);
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const [isTimePickerVisible, setTimePickerVisibility] = useState(false);
    const { userData } = useAuth();

    const validateAddress = async (address) => {
        try {
            const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${GOOGLE_MAPS_API_KEY}`);
            const { results } = response.data;
            if (results.length > 0) {
                const location = results[0].geometry.location;
                return location;
            } else {
                return null;
            }
        } catch (error) {
            console.error('Error validating address: ', error);
            return null;
        }
    };

    const handleButtonPress = async () => {
        if (!description || !date || !time || !address) {
            Alert.alert('Error', 'Please fill out all fields.');
            return;
        }

        setLoading(true);
        const location = await validateAddress(address);

        if (!location) {
            Alert.alert('Error', 'Invalid address. Please enter a valid address.');
            setLoading(false);
            return;
        }

        const newData = {
            description,
            date: `${date}T${time}`,
            address,
            location: {
                latitude: location.lat,
                longitude: location.lng,
            },
            timestamp: serverTimestamp(),
            uid: userData.uid,
            id: userData.uid + serverTimestamp(),
            originalDonationPoster: userData.username,
            originalPosterProfileImage: userData.profilePicture,
            PostType: "volunteer",
        };

        setData(newData);
        setIsVisible(true);
        setLoading(false);
    };

    const shareVolunteerOpportunity = async () => {
        try {
            if (Object.keys(data).length === 0) {
                Alert.alert(
                    "No Data to Share",
                    "Please generate a preview before sharing.",
                    [{ text: "OK" }]
                );
                return;
            }

            await addDoc(collection(firestore, 'Posts'), data);
            Alert.alert(
                "Success",
                "Your volunteer opportunity has been shared successfully.",
                [{ text: "OK" }]
            );
            navigation.goBack();
        } catch (error) {
            console.error("Error adding volunteer opportunity to Firestore:", error);
            Alert.alert(
                "Error",
                "There was an error sharing your volunteer opportunity. Please try again.",
                [{ text: "OK" }]
            );
        }
    };

    const showDatePicker = () => {
        setDatePickerVisibility(true);
    };

    const hideDatePicker = () => {
        setDatePickerVisibility(false);
    };

    const handleConfirmDate = (selectedDate) => {
        setDate(moment(selectedDate).format('YYYY-MM-DD'));
        hideDatePicker();
    };

    const showTimePicker = () => {
        setTimePickerVisibility(true);
    };

    const hideTimePicker = () => {
        setTimePickerVisibility(false);
    };

    const handleConfirmTime = (selectedTime) => {
        setTime(moment(selectedTime).format('HH:mm'));
        hideTimePicker();
    };

    return (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <Icon name="arrow-back" size={30} color="#000" />
                    </TouchableOpacity>
                    <Text style={styles.headerText}>Volunteer Opportunity</Text>
                </View>

                <Text style={[styles.label, { fontFamily: 'Montserrat-Medium' }]}>Description:</Text>
                <TextInput
                    style={styles.input}
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Enter description"
                />
                <Text style={[styles.label, { fontFamily: 'Montserrat-Medium' }]}>Date:</Text>
                <TouchableOpacity onPress={showDatePicker} style={styles.input}>
                    <Text>{date ? date : "Select Date"}</Text>
                </TouchableOpacity>
                <DateTimePickerModal
                    isVisible={isDatePickerVisible}
                    mode="date"
                    onConfirm={handleConfirmDate}
                    onCancel={hideDatePicker}
                />
                <Text style={[styles.label, { fontFamily: 'Montserrat-Medium' }]}>Time:</Text>
                <TouchableOpacity onPress={showTimePicker} style={styles.input}>
                    <Text>{time ? time : "Select Time"}</Text>
                </TouchableOpacity>
                <DateTimePickerModal
                    isVisible={isTimePickerVisible}
                    mode="time"
                    onConfirm={handleConfirmTime}
                    onCancel={hideTimePicker}
                />
                <Text style={[styles.label, { fontFamily: 'Montserrat-Medium' }]}>Address:</Text>
                <GooglePlacesAutocomplete
                    placeholder="Enter address"
                    minLength={2}
                    fetchDetails={true}
                    onPress={(data, details = null) => {
                        console.log('Selected address:', data.description);
                        setAddress(data.description);
                    }}
                    query={{
                        key: GOOGLE_MAPS_API_KEY,
                        language: 'en',
                    }}
                    styles={{
                        textInput: styles.input,
                        listView: styles.listView,
                        row: styles.listViewRow,
                        description: styles.listViewRowText,
                    }}
                    enablePoweredByContainer={false}
                    nearbyPlacesAPI='GooglePlacesSearch'
                    debounce={200}
                    renderDescription={(row) => row.description}
                />
                <TouchableOpacity style={styles.button} onPress={handleButtonPress}>
                    <Text style={[styles.buttonText, { fontFamily: 'Montserrat-Medium' }]}>Preview</Text>
                </TouchableOpacity>
                {isVisible && (
                    <>
                        <VolunteerPreview data={data} />
                        <TouchableOpacity style={styles.shareButton} onPress={shareVolunteerOpportunity}>
                            <Text style={[styles.shareButtonText, { fontFamily: 'Montserrat-Medium' }]}>Share Volunteer Opportunity</Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
        padding: 20,
        paddingTop: 60,
        backgroundColor: '#fff',
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    backButton: {
        paddingRight: 10,
    },
    headerText: {
        fontSize: 24,
        fontWeight: 'bold',
        flex: 1,
        textAlign: 'right',
    },
    label: {
        fontSize: 16,
        marginBottom: 5,
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 15,
        paddingLeft: 8,
        borderRadius: 10,
        justifyContent: 'center',
    },
    button: {
        backgroundColor: '#1C5AA3',
        marginVertical: 10,
        borderRadius: 7,
        paddingVertical: 10,
        paddingHorizontal: 20,
        width: '100%',
        marginRight: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        alignSelf: 'center',
    },
    shareButton: {
        backgroundColor: '#3FC032',
        marginVertical: 10,
        borderRadius: 7,
        paddingVertical: 10,
        paddingHorizontal: 20,
        width: '100%',
        marginRight: 10,
    },
    shareButtonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        alignSelf: 'center',
    },
    listView: {
        backgroundColor: 'white',
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 10,
        marginTop: 10,
    },
    listViewRow: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    listViewRowText: {
        fontSize: 16,
    },
});
