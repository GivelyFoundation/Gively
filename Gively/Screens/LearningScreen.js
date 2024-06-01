import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { earningToGiveContent,  goFundMeChangeOrgContent, effectiveAltruismContent, pondAnalogyContent } from '../assets/articles';
const LearningScreen = () => {
  const navigation = useNavigation();

  const blogPosts = [
    earningToGiveContent,
    goFundMeChangeOrgContent,
    effectiveAltruismContent,
    pondAnalogyContent
  ];

  return (
    <ScrollView style={styles.container}>
      {blogPosts.map((post, index) => (
        <TouchableOpacity
          key={index}
          style={[styles.card, { backgroundColor: index % 2 === 0 ? '#3FC032' : '#1C5AA3' }]}
          onPress={() =>  navigation.navigate('BlogPostScreen', { post})}
        >
          <Text style={styles.cardText}>{post.title}</Text>
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
});

export default LearningScreen;
