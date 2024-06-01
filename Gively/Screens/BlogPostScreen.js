import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';

const BlogPostScreen = ({ route }) => {
  const { post } = route.params;
  const navigation = useNavigation();
  return (
    <View style={styles.page}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.backButton}>
                <Icon name="arrow-back" size={30} color="#000" />
            </TouchableOpacity>
            <ScrollView style={styles.container}>
      <Text style={styles.title}>{post.title}</Text>
      {post.contents.map((section, index) => (
        <View key={index} style={styles.section}>
          {section.subtitle ? <Text style={styles.subtitle}>{section.subtitle}</Text> : null}
          {Array.isArray(section.text)
            ? section.text.map((paragraph, pIndex) => <Text key={pIndex} style={styles.text}>{paragraph}</Text>)
            : <Text style={styles.text}>{section.text}</Text>}
        </View>
      ))}
    </ScrollView>
    </View>
    
  );
};

const styles = StyleSheet.create({
page:{
    flex: 1,
    paddingTop: 60,
    paddingLeft: 20,
    backgroundColor: '#fff',
},
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  section: {
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  text: {
    fontSize: 16,
    marginBottom: 8,
  },
});

export default BlogPostScreen;
