import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { PetitionCard } from '../Components/PetitionCard';
import { petitionData, user } from '../MockData'; // Make sure paths are correct

const PetitionScreen = ({ navigation }) => {
  return (
    <View style={styles.page}>
      <Text style={styles.previewHeader}>Post Preview</Text>
      <PetitionCard data={petitionData} user={user} />
      <Button title="Go Back" onPress={() => navigation.goBack()} />
    </View>
  );
};


const styles = StyleSheet.create({
    page: {
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        paddingTop: 60,
        width: '100%', // Ensures the page fills the width of the screen
        alignItems: 'center', // Centers the content horizontally
        height: '100%'
    },
    previewHeader: {
        fontSize: 16,
        fontWeight: 'bold', // Adjusted for Bold without needing the font file
        marginBottom: 20, // Adds spacing below the header
    }
});

  
export default PetitionScreen;
