import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import SwitchSelector from "react-native-switch-selector";
import { user, charityData } from '../MockData';
import styles from '../Styles.js/Styles';
import PinnedCharityCard from '../Components/PinnedCharityCard';
import DonationCard from '../Components/DonationCard';
import { PetitionCard } from '../Components/PetitionCard';
import { GoFundMeCard } from '../Components/GoFundMeCard';
import { useAuth } from '../services/AuthContext';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { firestore } from '../services/firebaseConfig';

const pieChartPlaceHolder = require('../assets/Images/pieChartPlaceHolder.png');

const CharityInfoComponent = ({ charityName, color, percentage }) => {
  return (
    <View style={profileStyles.charityCardInfoContainer}>
      <Text style={[profileStyles.charityName, { color: color }, { fontFamily: 'Montserrat-Medium' }]}>{charityName}</Text>
      <Text style={[profileStyles.percentage, { fontFamily: 'Montserrat-Medium' }]}>{percentage}%</Text>
    </View>
  );
};

const Portfolio = () => {
  return (
    <View style={[profileStyles.portfolioContainer, styles.page]}>
      <Image source={pieChartPlaceHolder} style={profileStyles.pieChartPlaceHolder} />
      <ScrollView>
        {charityData.map((charity, index) => (
          <CharityInfoComponent key={index} charityName={charity.charityName} color={charity.color} percentage={charity.percentage} />
        ))}
      </ScrollView>
    </View>
  );
};

const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const { userData } = useAuth();

  const fetchPosts = async () => {
    try {
      const postsCollection = collection(firestore, 'Posts');
      const q = query(postsCollection, where('uid', '==', userData.uid));
      const postsSnapshot = await getDocs(q);
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

  useEffect(() => {
    fetchPosts();
  }, [userData.uid]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  };

  const renderCard = (item) => {
    switch (item.PostType) {
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

  const sortedPosts = posts.sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <View style={[profileStyles.contentContainer, styles.page]}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 10 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {sortedPosts.map((item) => renderCard(item))}
        <View style={profileStyles.spacer} />
      </ScrollView>
    </View>
  );
};

const CategoryScroll = () => {
  return (
    <ScrollView
      horizontal={true}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={profileStyles.interestContainer}
    >
      {user.interests.map((category, index) => (
        <TouchableOpacity key={index} style={profileStyles.interestButton}>
          <Text style={[profileStyles.interestButtonText, { fontFamily: 'Montserrat-Medium' }]}>{category}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

export default function ProfileScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('Portfolio');
  const { userData } = useAuth();
  const [followersCount, setFollowersCount] = useState(null);
  const [followingCount, setFollowingCount] = useState(null);

  useEffect(() => {
    const fetchFollowCounts = async () => {
      if (userData && userData.uid) {
        const followersRef = collection(firestore, `users/${userData.uid}/followers`);
        const followingRef = collection(firestore, `users/${userData.uid}/following`);

        const unsubscribeFollowers = onSnapshot(followersRef, (snapshot) => {
          setFollowersCount(snapshot.size);
        });

        const unsubscribeFollowing = onSnapshot(followingRef, (snapshot) => {
          setFollowingCount(snapshot.size);
        });

        return () => {
          unsubscribeFollowers();
          unsubscribeFollowing();
        };
      }
    };

    fetchFollowCounts();
  }, [userData]);

  const handleTabPress = (tab) => {
    setActiveTab(tab);
  };

  const handleFollowersPress = () => {
    navigation.navigate('FollowersList', { userId: userData.uid });
  };

  const handleFollowingPress = () => {
    navigation.navigate('FollowingList', { userId: userData.uid });
  };

  return (
    <View style={styles.page}>
      <View style={[profileStyles.header]}>
        <Text style={[profileStyles.headerText, { fontFamily: 'Montserrat-Medium' }]}>Profile</Text>
        <TouchableOpacity>
          <Text
            style={[profileStyles.editProfile, profileStyles.buttonText, { fontFamily: 'Montserrat-Medium' }]}
            onPress={() => navigation.navigate('EditProfile')}
          >
            Edit Profile
          </Text>
        </TouchableOpacity>
      </View>
      <View style={[profileStyles.row, profileStyles.profileInfo]}>
        <Image source={{ uri: userData.profilePicture }} style={profileStyles.profilePicture} />
        <View style={[profileStyles.column]}>
          <Text style={[profileStyles.userNameText, { fontFamily: 'Montserrat-Medium' }]}> {userData.username}</Text>
          <View style={[profileStyles.followRow]}>
            <View style={[profileStyles.column]}>
              <TouchableOpacity onPress={handleFollowersPress}>
                <Text style={[profileStyles.followText, profileStyles.buttonText, { fontFamily: 'Montserrat-Medium' }]}>
                  {followersCount !== null ? followersCount : 0}
                </Text>
              </TouchableOpacity>
              <Text style={[profileStyles.followText, { fontFamily: 'Montserrat-Medium' }]}>Followers</Text>
            </View>
            <View style={profileStyles.verticalLine} />
            <View style={[profileStyles.column]}>
              <TouchableOpacity onPress={handleFollowingPress}>
                <Text style={[profileStyles.followText, profileStyles.buttonText, { fontFamily: 'Montserrat-Medium' }]}>
                  {followingCount !== null ? followingCount : 0}
                </Text>
              </TouchableOpacity>
              <Text style={[profileStyles.followText, { fontFamily: 'Montserrat-Medium' }]}>Following</Text>
            </View>
          </View>
        </View>
      </View>
      <Text style={[profileStyles.bioHeader, { fontFamily: 'Montserrat-Medium' }]}> {userData.displayName} </Text>
      <Text style={[profileStyles.bioMainText, { fontFamily: 'Montserrat-Medium' }]}> {userData.bio}</Text>
      <CategoryScroll />
      <PinnedCharityCard username={user.username.split(" ")[0]} charity={"NAMI"} reason={"Help me raise money for mental health awareness!"} />
      <SwitchSelector
        initial={0}
        onPress={value => handleTabPress(value)}
        hasPadding
        options={[
          { label: "Portfolio", value: "Portfolio" },
          { label: "Posts", value: "Posts" }
        ]}
        testID="feed-switch-selector"
        accessibilityLabel="feed-switch-selector"
        style={[profileStyles.switchStyle]}
        selectedColor={'#1C5AA3'}
        buttonColor={'#fff'}
        backgroundColor={'#F5F5F5'}
        borderColor={"#AFB1B3"}
        textColor={"#AFB1B3"}
        fontSize={16}
        height={30}
      />
      {activeTab === 'Portfolio' ? <Portfolio /> : <Posts />}
    </View>
  );
}

const profileStyles = StyleSheet.create({
  header: {
    paddingTop: 70,
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'space-between',
    paddingRight: 20
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  followRow: {
    flexDirection: 'row',
    margin: 10,
    alignItems: 'center',
  },
  column: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  followColumn: {
    flexDirection: 'column',
    alignItems: 'center',
    marginRight: 80
  },
  userNameText: {
    fontSize: 24,
  },
  followText: {
    fontSize: 16,
    color: '#747688'
  },
  profileInfo: {
    width: '100%',
    paddingTop: 20,
    paddingLeft: 30,
    paddingRight: 30,
    justifyContent: 'space-between'
  },
  headerText: {
    paddingLeft: 30,
    fontSize: 24
  },
  editProfile: {
    fontSize: 16
  },
  verticalLine: {
    height: '70%',
    width: 1,
    backgroundColor: '#DDDDDD',
    marginHorizontal: 20,
  },
  horizontalLine: {
    height: 1,
    backgroundColor: '#cccccc',
    marginTop: 20,
    marginBottom: 5,
    marginHorizontal: 30,
  },
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: 25,
  },
  pieChartPlaceHolder: {
    width: 150,
    height: 150,
    alignItems: 'center',
    alignSelf: 'center',
  },
  buttonText: {
    color: '#1C5AA3',
    fontFamily: ''
  },
  bioHeader: {
    fontSize: 15,
    padding: 30,
    paddingVertical: 10,
    paddingBottom: 10,
    textTransform: 'uppercase',
    color: '#1E1E1E'
  },
  bioMainText: {
    fontSize: 16,
    paddingHorizontal: 30,
    lineHeight: 25,
    color: '#747688'
  },
  interestContainer: {
    alignItems: 'center',
    padding: 10,
    paddingBottom: 14,
    paddingHorizontal: 30
  },
  interestButton: {
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 20,
    marginRight: 10,
    backgroundColor: 'rgba(28, 90, 163, 0.1)',
  },
  interestButtonText: {
    color: '#1C5AA3',
    fontSize: 16,
    opacity: .9
  },
  switchStyle: {
    paddingTop: 10,
    paddingHorizontal: 30,
  },
  contentContainer: {
    alignContent: 'center',
    paddingTop: 10,
    backgroundColor: '#fff',
    height: 1000
  },
  scrollView: {
    flexGrow: 1,
    flexDirection: 'column',
    paddingVertical: 4,
    paddingHorizontal: 30,
  },
  portfolioContainer: {
    alignContent: 'center',
    paddingTop: 20,
    backgroundColor: '#fff',
    height: 1000
  },
  charityCardInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 30,
    marginTop: 10,
  },
  charityName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  percentage: {
    fontSize: 16,
    fontWeight: '500',
  },
  spacer: {
    height: 700
  },
});
