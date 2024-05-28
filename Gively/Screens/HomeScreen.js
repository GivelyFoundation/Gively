import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import SwitchSelector from "react-native-switch-selector";
import styles from '../Styles.js/Styles';
import DonationCard from '../Components/DonationCard';
import { PetitionCard } from '../Components/PetitionCard';
import { GoFundMeCard } from '../Components/GoFundMeCard';
import { collection, getDocs } from 'firebase/firestore';
import { firestore } from '../services/firebaseConfig';
import { useAuth } from '../services/AuthContext';
import WelcomeCard from '../Components/WelcomeCard';
import FirstTimeDonationCard from '../Components/FirstTimeDonationCard';

const ForYouFeed = ({ posts, refreshing, onRefresh }) => {
  const renderCard = (item) => {
    if (!item) {
      return null;
    }
    switch (item.PostType) {
      case 'donation':
        return <DonationCard key={item.id} data={item} />;
      case 'petition':
        return <PetitionCard key={item.id} data={item} />;
      case 'gofundme':
        return <GoFundMeCard key={item.id} data={item} />;
      case 'firstTime':
        return <FirstTimeDonationCard key={item.id} data={item} />;
      default:
        return <View key={item.id}><Text>Unknown Post Type</Text></View>;
    }
  };
  const sortedPosts = posts.sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 10 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {sortedPosts.map((item) => {
          console.log("Rendering item:", item);
          return renderCard(item);
        })}
      </ScrollView>
    </View>
  );
};

const FriendsFeed = ({ posts, refreshing, onRefresh }) => {
  const renderCard = (item) => {
    if (!item) {
      return null;
    }
    switch (item.PostType) {
      case 'donation':
        return <DonationCard key={item.id} data={item} />;
      case 'petition':
        return <PetitionCard key={item.id} data={item} />;
      case 'gofundme':
        return <GoFundMeCard key={item.id} data={item} />;
      case 'firstTime':
        return <FirstTimeDonationCard key={item.id} data={item} />;
      default:
        return <View key={item.id}><Text>Unknown Post Type</Text></View>;
    }
  };
  const sortedPosts = posts.sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 10 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {sortedPosts.map((item) => {
          console.log("Rendering item:", item);
          return renderCard(item);
        })}
      </ScrollView>
    </View>
  );
};


export default function HomeFeedScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('For You');
  const [posts, setPosts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const { userData } = useAuth();

  const handleTabPress = (tab) => {
    setActiveTab(tab);
  };

  const fetchPosts = async () => {
    try {
      const postsCollection = collection(firestore, 'Posts');
      const postsSnapshot = await getDocs(postsCollection);
      const postsList = postsSnapshot.docs.map(doc => {
        const data = doc.data();
        const serializedData = serializeData(data);
        return { id: doc.id, ...serializedData };
      });

      const cleanedPostsList = postsList.map(post => JSON.parse(JSON.stringify(post)));
      const validPosts = cleanedPostsList.filter(post => post !== null);

      if (validPosts.length > 0) {
        setPosts(validPosts);
      } else {
        console.error('No valid posts found');
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  };

  return (
    <View style={[styles.container, styles.page]}>
      {userData && userData.displayName ? (
        <WelcomeCard username={userData.displayName.split(' ')[0]} donationAmount={2515} charityCount={25} />
      ) : (
        <Text>Loading...</Text>
      )}
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
      {activeTab === 'For You' ?
        <ForYouFeed posts={posts} refreshing={refreshing} onRefresh={onRefresh} /> :
        <FriendsFeed posts={posts} refreshing={refreshing} onRefresh={onRefresh} />
      }
    </View>
  );
}

const homeStyles = StyleSheet.create({
  switchStyle: {
    paddingTop: 10,
    paddingHorizontal: 20,
    paddingBottom: 20
  },
});

function serializeData(data) {
  const serializedData = {};
  for (const key in data) {
    if (data[key] && typeof data[key] === 'object' && !Array.isArray(data[key])) {
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
