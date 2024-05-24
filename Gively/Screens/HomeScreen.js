import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import SwitchSelector from "react-native-switch-selector";
import styles from '../Styles.js/Styles';
import DonationCard from '../Components/DonationCard';
import { PetitionCard } from '../Components/PetitionCard';
import { GoFundMeCard } from '../Components/GoFundMeCard';
import { postsData, postsData2, user } from '../MockData';
import { collection, getDocs } from 'firebase/firestore';
import { firestore } from '../services/firebaseConfig';

import WelcomeCard from '../Components/WelcomeCard';

let posts2;

const ForYouFeed = () => {
  const renderCard = (item) => {
    switch (item.PostType) {
      case 'donation':
        return <DonationCard key={item.id} data={item} />;
      case 'petition':
        return <PetitionCard key={item.id} data={item} user={user} />;
      case 'gofundme':
        return <GoFundMeCard key={item.id} data={item} />;
      default:
        return <View key={item.id}><Text>Unknown Post Type</Text></View>;
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 10 }}>
        {posts2.map((item) => renderCard(item))}
      </ScrollView>
    </View>
  );
};

const FriendsFeed = () => {
  const renderCard = (item) => {
    switch (item.postType) {
      case 'donation':
        return <DonationCard key={item.id} data={item} />;
      case 'petition':
        return <PetitionCard key={item.id} data={item} user={user} />;
      case 'gofundme':
        return <GoFundMeCard key={item.id} data={item} user={user} />;
      default:
        return <View key={item.id}><Text>Unknown Post Type</Text></View>;
    }
  };

  return (
    <View style={[styles.container, styles.page,  homeStyles.scrollViewContainer]}>
      <ScrollView>
        <View style={{ padding: 10, flex: 1 }}>
          {postsData2.map((item) => renderCard(item))}
        </View>
      </ScrollView>
    </View>
  );
};

export default function HomeFeedScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('For You');
  const [posts, setPosts] = useState([]);

  const handleTabPress = (tab) => {
    setActiveTab(tab);
  };

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const postsCollection = collection(firestore, 'Posts');
        const postsSnapshot = await getDocs(postsCollection);
        const postsList = postsSnapshot.docs.map(doc => {
          const data = doc.data();
          const serializedData = serializeData(data);
          return { id: doc.id, ...serializedData };
        });
        setPosts(postsList);
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };

    fetchPosts();
  }, []);
  
  posts2 = posts;

  return (
    <View style={[styles.container, styles.page]}>
      <WelcomeCard username="Andy" donationAmount={2515} charityCount={25} />
      <SwitchSelector
        initial={0}
        onPress={value => handleTabPress(value)}
        hasPadding
        options={[
          { label: "For You", value: "For You" },
          { label: "Friends", value: "Friends" }
        ]}
        testID="feed-switch-selector"
        accessibilityLabel="feed-switch-selector"
        style={[homeStyles.switchStyle]}
        selectedColor={'#1C5AA3'}
        buttonColor={'#fff'}
        backgroundColor={'#F5F5F5'}
        textColor={"#AFB1B3"}
        borderColor={"#AFB1B3"}
        fontSize={16}
        height={30}
      />
      {activeTab === 'For You' ? <ForYouFeed /> : <FriendsFeed />}
    </View>
  );
}

const homeStyles = StyleSheet.create({
  switchStyle: {
    paddingTop: 10,
    paddingHorizontal: 30,
    paddingBottom: 20
  },
});

// Helper function to serialize Firestore data
function serializeData(data) {
  const serializedData = {};
  for (const key in data) {
    if (data[key] && typeof data[key] === 'object') {
      if (data[key].seconds) {
        // Convert Firestore timestamp to string
        serializedData[key] = new Date(data[key].seconds * 1000).toISOString();
      } else {
        // Recursively serialize nested objects
        serializedData[key] = serializeData(data[key]);
      }
    } else {
      serializedData[key] = data[key];
    }
  }
  return serializedData;
}
