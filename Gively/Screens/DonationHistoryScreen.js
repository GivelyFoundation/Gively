import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity} from 'react-native';

// Sample data for donation history
const donations = [
  { id: '1', charityName: 'Global Relief', amount: 50, date: '2024-05-01' },
  { id: '2', charityName: 'Health for All', amount: 75, date: '2024-04-25' },
  { id: '3', charityName: 'Education Bridge', amount: 100, date: '2024-04-10' },
  { id: '4', charityName: 'Wildlife Rescue', amount: 30, date: '2024-03-15' },
  { id: '5', charityName: 'Clean Water Initiative', amount: 45, date: '2024-03-01' },
];

const DonationHistoryScreen = () => {
  // Function to render each item in the FlatList
  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Text style={[styles.charityName, { fontFamily: 'Montserrat-Medium' }]}>{item.charityName}</Text>
      <Text style={[styles.detailText, { fontFamily: 'Montserrat-Medium' }]}>Amount: ${item.amount}</Text>
      <Text style={[styles.detailText, { fontFamily: 'Montserrat-Medium' }]}>Date: {item.date}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={donations}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
      />
<TouchableOpacity style={styles.donateButton}>
          <Text style={[styles.donateButtonText, { fontFamily: 'Montserrat-Medium' }]}>Generate Tax Form</Text>
        </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  listContainer: {
    paddingBottom: 20,
  },
  item: {
    backgroundColor: '#f9f9f9',
    padding: 20,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  charityName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  detailText: {
    fontSize: 16,
    color: '#666',
  },
  donateButton: {
    borderRadius: 12,
    paddingHorizontal: 20,
    marginRight: 10,
    backgroundColor: '#3FC032',
    marginVertical: 10,
    height: 40,
    width: '80%',
    justifyContent: 'center', // Center items horizontally
    alignItems: 'center', // Center items vertically
    alignSelf: 'center'
  },
  donateButtonText: {
    color: '#fff',
    fontSize: 24,
    opacity: .9,
    textTransform:'uppercase'

  },
});

export default DonationHistoryScreen;
