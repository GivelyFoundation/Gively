import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { howTaxesWorkWhenDonatingContent,  goFundMeChangeOrgContent, effectiveAltruismContent, pondAnalogyContent } from '../assets/articles';

const LearningScreen = () => {
  const navigation = useNavigation();

  const blogPosts = [
    goFundMeChangeOrgContent,
    effectiveAltruismContent,
    pondAnalogyContent,
    howTaxesWorkWhenDonatingContent
  ];

  return (
    <ScrollView style={styles.container}>
        <Text style={[styles.read,{fontFamily: 'Montserrat-Medium'}]}>Read the blogs below to learn more about how to be a better giver and maximize the impact of your charitable donations.</Text>
      {blogPosts.map((post, index) => (
        <TouchableOpacity
          key={index}
          style={[styles.card, { backgroundColor: index % 2 === 0 ? '#3FC032' : '#1C5AA3' }]}
          onPress={() =>  navigation.navigate('BlogPostScreen', { post})}
        >
          <Text style={[styles.cardText, {fontFamily: 'Montserrat-Medium'}]}>{post.title}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  card: {
    padding: 20,
    borderRadius: 8,
    marginBottom: 16,
  },
  cardText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  read: {
    paddingBottom: 20
  }
});

export default LearningScreen;
