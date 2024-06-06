import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import StepIndicator from 'react-native-step-indicator';
import SignUpForm from '../Components/SignUpForm';
import ProfileDetailsForm from '../Components/ProfileDetailsForm';
import PhotoUploadForm from '../Components/PhotoUploadForm';
import InterestsSelectionForm from '../Components/InterestsSelectionForm';
import MastercardSignupForm from '../Components/MastercardSignupForm';
import { useAuth } from '../services/AuthContext';
import Icon from 'react-native-vector-icons/MaterialIcons';

const labels = ["Sign Up", "Profile Details", "Photo Upload", "Mastercard Signup", "Interests"];

const customStyles = {
  stepIndicatorSize: 25,
  currentStepIndicatorSize: 30,
  separatorStrokeWidth: 2,
  currentStepStrokeWidth: 3,
  stepStrokeCurrentColor: '#3FC032',
  stepStrokeWidth: 3,
  stepStrokeFinishedColor: '#3FC032',
  stepStrokeUnFinishedColor: '#aaaaaa',
  separatorFinishedColor: '#3FC032',
  separatorUnFinishedColor: '#aaaaaa',
  stepIndicatorFinishedColor: '#3FC032',
  stepIndicatorUnFinishedColor: '#ffffff',
  stepIndicatorCurrentColor: '#ffffff',
  stepIndicatorLabelFontSize: 13,
  currentStepIndicatorLabelFontSize: 13,
  stepIndicatorLabelCurrentColor: '#3FC032',
  stepIndicatorLabelFinishedColor: '#ffffff',
  stepIndicatorLabelUnFinishedColor: '#aaaaaa',
  labelColor: '#999999',
  labelSize: 13,
  currentStepLabelColor: '#3FC032'
};

const CreateAccountScreen = ({ navigation }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [accountCreated, setAccountCreated] = useState(false);
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
    bio: '',
    profilePicture: null,
    following: [],
    followers: []
  });

  const { endSignUp } = useAuth();

  const nextStep = () => {
    setCurrentStep((prevStep) => (prevStep < 4 ? prevStep + 1 : prevStep));
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prevStep) => prevStep - 1);
    } else {
      confirmBackToSplash();
    }
  };

  const confirmBackToSplash = () => {
    Alert.alert(
      "Confirm Exit",
      "Are you sure you want to go back to the main menu? Any unsaved changes will be lost.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Confirm", onPress: () => {
          endSignUp()  
          navigation.navigate('Splash')
        } },
      ],
      { cancelable: false }
    );
  };

  const handleChange = (name, value) => {
    setUserData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <SignUpForm setAccountCreated={setAccountCreated} accountCreated={accountCreated} navigation={navigation} userData={userData} handleChange={handleChange} nextStep={nextStep} />;
      case 1:
        return <ProfileDetailsForm userData={userData} handleChange={handleChange} nextStep={nextStep} />;
      case 2:
        return <PhotoUploadForm userData={userData} handleChange={handleChange} nextStep={nextStep} />;
      case 3:
        return <MastercardSignupForm nextStep={nextStep} />;
      case 4:
        return <InterestsSelectionForm userData={userData} navigation={navigation} handleChange={handleChange} nextStep={nextStep} />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <Pressable onPress={() => prevStep()} style={styles.backButton}>
        <Icon name="arrow-back" size={24} color="#000" />
      </Pressable>
      <View style={styles.stepIndicatorContainer}>
        <StepIndicator
          customStyles={customStyles}
          currentPosition={currentStep}
          labels={labels}
          stepCount={5}
        />
      </View>
      <View style={styles.formContainer}>
        {renderStep()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  backButton: {
    position: 'absolute',
    top: '7%',
    left: 20,
    zIndex: 10,
  },
  stepIndicatorContainer: {
    marginTop: 125,
  },
  formContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
    flex: 1,
  },
});

export default CreateAccountScreen;
