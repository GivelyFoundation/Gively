import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import SwitchSelector from "react-native-switch-selector";
import styles from '../Styles.js/Styles';
import DonationCard from '../Components/DonationCard';
import { PetitionCard } from '../Components/PetitionCard';
import { GoFundMeCard } from '../Components/GoFundMeCard';
import { collection, query, getDocs, limit, startAfter } from 'firebase/firestore';
import { firestore } from '../services/firebaseConfig';
import { useAuth } from '../services/AuthContext';
import WelcomeCard from '../Components/WelcomeCard';
import FirstTimeDonationCard from '../Components/FirstTimeDonationCard';

const POSTS_LIMIT = 10;

const ForYouFeed = ({ posts, refreshing, onRefresh, fetchMorePosts }) => {
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
        onScroll={({ nativeEvent }) => {
          if (isCloseToBottom(nativeEvent)) {
            fetchMorePosts();
          }
        }}
        scrollEventThrottle={400}
      >
        {sortedPosts.map((item) => renderCard(item))}
      </ScrollView>
    </View>
  );
};

const FriendsFeed = ({ posts, refreshing, onRefresh, fetchMorePosts }) => {
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
        onScroll={({ nativeEvent }) => {
          if (isCloseToBottom(nativeEvent)) {
            fetchMorePosts();
          }
        }}
        scrollEventThrottle={400}
      >
        {sortedPosts.map((item) => renderCard(item))}
      </ScrollView>
    </View>
  );
};

export default function HomeFeedScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('For You');
  const [posts, setPosts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [lastVisible, setLastVisible] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const { userData } = useAuth();

  const handleTabPress = (tab) => {
    setActiveTab(tab);
  };

  const fetchPosts = async () => {
    try {
      const postsCollection = collection(firestore, 'Posts');
      const q = query(postsCollection, limit(POSTS_LIMIT));
      const postsSnapshot = await getDocs(q);
      const lastVisibleDoc = postsSnapshot.docs[postsSnapshot.docs.length - 1];
      setLastVisible(lastVisibleDoc);

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

  const fetchMorePosts = async () => {
    if (loadingMore || !lastVisible) return;
    setLoadingMore(true);

    try {
      const postsCollection = collection(firestore, 'Posts');
      const q = query(postsCollection, startAfter(lastVisible), limit(POSTS_LIMIT));
      const postsSnapshot = await getDocs(q);
      const lastVisibleDoc = postsSnapshot.docs[postsSnapshot.docs.length - 1];
      setLastVisible(lastVisibleDoc);

      const postsList = postsSnapshot.docs.map(doc => {
        const data = doc.data();
        const serializedData = serializeData(data);
        return { id: doc.id, ...serializedData };
      });

      const cleanedPostsList = postsList.map(post => JSON.parse(JSON.stringify(post)));
      const validPosts = cleanedPostsList.filter(post => post !== null);

      if (validPosts.length > 0) {
        setPosts(prevPosts => [...prevPosts, ...validPosts]);
      } else {
        console.error('No valid posts found');
      }
    } catch (error) {
      console.error('Error fetching more posts:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    setLastVisible(null);
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
        <ForYouFeed posts={posts} refreshing={refreshing} onRefresh={onRefresh} fetchMorePosts={fetchMorePosts} /> :
        <FriendsFeed posts={posts} refreshing={refreshing} onRefresh={onRefresh} fetchMorePosts={fetchMorePosts} />
      }
      {loadingMore && <ActivityIndicator size="large" color="#0000ff" />}
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

function isCloseToBottom({ layoutMeasurement, contentOffset, contentSize }) {
  const paddingToBottom = 20;
  return layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
}
