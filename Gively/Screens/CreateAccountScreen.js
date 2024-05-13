import React, { useState } from 'react';
import { View, SafeAreaView, ImageBackground, Image, Text, StyleSheet, Pressable, Alert } from 'react-native';
import StepIndicator from 'react-native-step-indicator';
import SignUpForm from '../Components/SignUpForm';
import ProfileDetailsForm from '../Components/ProfileDetailsForm';
import PhotoUploadForm from '../Components/PhotoUploadForm';

const labels = ["Sign Up","Profile Details","Photo Upload"];

const customStyles = {
  stepIndicatorSize: 25,
  currentStepIndicatorSize:30,
  separatorStrokeWidth: 2,
  currentStepStrokeWidth: 3,
  stepStrokeCurrentColor: '#fe7013',
  stepStrokeWidth: 3,
  stepStrokeFinishedColor: '#fe7013',
  stepStrokeUnFinishedColor: '#aaaaaa',
  separatorFinishedColor: '#fe7013',
  separatorUnFinishedColor: '#aaaaaa',
  stepIndicatorFinishedColor: '#fe7013',
  stepIndicatorUnFinishedColor: '#ffffff',
  stepIndicatorCurrentColor: '#ffffff',
  stepIndicatorLabelFontSize: 13,
  currentStepIndicatorLabelFontSize: 13,
  stepIndicatorLabelCurrentColor: '#fe7013',
  stepIndicatorLabelFinishedColor: '#ffffff',
  stepIndicatorLabelUnFinishedColor: '#aaaaaa',
  labelColor: '#999999',
  labelSize: 13,
  currentStepLabelColor: '#fe7013'
}

const CreateAccountScreen = ({ navigation }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [pageMessage, setPageMessage] = useState("Create Account\nSign in and start giving!");
  const [image, setImage] = useState(require('../assets/Images/auth-background.png'));
  const [accountCreated, setAccountCreated] = useState(false);
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword:'',
    displayName: '',
    bio: '',
    profilePicture: null,
  });

  const nextStep = () => {
    setCurrentStep((prevStep) => (prevStep < 2 ? prevStep + 1 : prevStep));
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
        { text: "Confirm", onPress: () => navigation.navigate('Splash') },
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
        return <SignUpForm setAccountCreated={setAccountCreated} accountCreated={accountCreated} navigation={navigation} userData={userData} handleChange={handleChange} nextStep={nextStep}/>;
      case 1:
        return <ProfileDetailsForm userData={userData} handleChange={handleChange} nextStep={nextStep}/>;
      case 2:
        return <PhotoUploadForm userData={userData} handleChange={handleChange} />;
      default:
        return null;
    }
  };

  return (
    <View className="flex-1">
      <View style={styles.backgroundContainer}>
        <ImageBackground 
          source={image} 
          resizeMode="contain"
          style={styles.backgroundImage}
        >
          <View style={styles.imageOverlay} />
        </ImageBackground>
      </View>

      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'flex-end' }}>
        <Image 
          source={require('../assets/Images/logo-1.png')} 
          style={styles.logo} 
          resizeMode="contain" 
        />

        <Pressable onPress={() => prevStep()} style={styles.backButton}>
          <Text className="text-white text-lg">Back</Text>
        </Pressable>
      </View>
      <View className="mt-32">
        <StepIndicator
          customStyles={customStyles}
          currentPosition={currentStep}
          labels={labels}
          stepCount={3}
        />
      </View>
      {renderStep()}
    </View>
  );
};

const styles = StyleSheet.create({
  backgroundContainer: {
    position: 'absolute',
    top: -120,
    left: 0,
    right: 0,
    height: '60%',
    flex: 1,
  },
  backgroundImage: {
    height: '100%',
    width: '100%',
  },
  imageOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)', // Semi-transparent black to enhance contrast
  },
  logo: {
    width: 80,
    height: 80,
    position: 'absolute',
    top: 45,
    left: 20,
  },
  backButton: {
    position: 'absolute',
    top: 65,
    right: 20,
    // backgroundColor: 'rgba(0, 0, 0, 0.5)', // Adding background to enhance visibility
    padding: 8, // Slight padding around the text
    borderRadius: 10, // Rounded corners for the button
    zIndex: 20,
  }
});

export default CreateAccountScreen;