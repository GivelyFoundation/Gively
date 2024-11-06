import React, { useState, useEffect, useRef } from 'react';
import { 
  SafeAreaView, 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  ScrollView,
  RefreshControl, 
  Dimensions, 
  Animated 
} from 'react-native';
import SwitchSelector from "react-native-switch-selector";
import { user, charityData } from '../MockData';
import styles from '../styles/Styles';
import PinnedCharityCard from '../Components/PinnedCharityCard';
import DonationCard from '../Components/DonationCard';
import { PetitionCard } from '../Components/PetitionCard';
import { GoFundMeCard } from '../Components/GoFundMeCard';
import { VolunteerCard } from '../Components/VolunteerCard';
import { useAuth } from '../services/AuthContext';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { firestore } from '../services/firebaseConfig';

const pieChartPlaceHolder = require('../assets/Images/pieChartPlaceHolder.png');
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

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
      const postsCollection = collection(firestore, 'posts');
      const q = query(postsCollection, where('uid', '==', userData.uid));
      const postsSnapshot = await getDocs(q);
      const postsList = postsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...serializeData(doc.data())
      }));
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
    const cardComponents = {
      donation: DonationCard,
      petition: PetitionCard,
      gofundme: GoFundMeCard,
      volunteer: VolunteerCard
    };
    
    const CardComponent = cardComponents[item.postType];
    return CardComponent ? <CardComponent key={item.id} data={item} user={user} /> : null;
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
        {sortedPosts.map(renderCard)}
        <View style={profileStyles.spacer} />
      </ScrollView>
    </View>
  );
};

const CategoryScroll = () => (
  <ScrollView
    horizontal={true}
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={profileStyles.interestContainer}
  >
    {user.interests.map((category, index) => (
      <TouchableOpacity key={index} style={profileStyles.interestButton}>
        <Text style={[profileStyles.interestButtonText, { fontFamily: 'Montserrat-Medium' }]}>
          {category}
        </Text>
      </TouchableOpacity>
    ))}
  </ScrollView>
);

export default function ProfileScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('Portfolio');
  const { userData } = useAuth();
  const [followersCount, setFollowersCount] = useState(null);
  const [followingCount, setFollowingCount] = useState(null);
  const scrollY = useRef(new Animated.Value(0)).current;

  // Visibility states
  const [showPinnedCharity, setShowPinnedCharity] = useState(true);
  const [showCategoryScroll, setShowCategoryScroll] = useState(true);
  const [showBio, setShowBio] = useState(true);

  // Animated height values
  const pinnedCharityHeight = useRef(new Animated.Value(100)).current;
  const categoryScrollHeight = useRef(new Animated.Value(60)).current;
  const bioHeight = useRef(new Animated.Value(80)).current;

  // Animation thresholds
  const PINNED_CHARITY_THRESHOLD = 50;
  const CATEGORY_SCROLL_THRESHOLD = 10;
  const BIO_THRESHOLD = 100;

  // Function to animate height and handle visibility
  const animateHeight = (animatedValue, finalHeight, setVisibility) => {
    if (finalHeight === 0) {
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start(() => {
        setVisibility(false);
      });
    } else {
      setVisibility(true);
      Animated.timing(animatedValue, {
        toValue: finalHeight,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  };

  useEffect(() => {
    scrollY.addListener(({ value }) => {
      // PinnedCharity animations
      if (value > PINNED_CHARITY_THRESHOLD && showPinnedCharity) {
        animateHeight(pinnedCharityHeight, 0, setShowPinnedCharity);
      } else if (value <= PINNED_CHARITY_THRESHOLD && !showPinnedCharity) {
        animateHeight(pinnedCharityHeight, 100, setShowPinnedCharity);
      }

      // CategoryScroll animations
      if (value > CATEGORY_SCROLL_THRESHOLD && showCategoryScroll) {
        animateHeight(categoryScrollHeight, 0, setShowCategoryScroll);
      } else if (value <= CATEGORY_SCROLL_THRESHOLD && !showCategoryScroll) {
        animateHeight(categoryScrollHeight, 60, setShowCategoryScroll);
      }

      // Bio animations
      if (value > BIO_THRESHOLD && showBio) {
        animateHeight(bioHeight, 0, setShowBio);
      } else if (value <= BIO_THRESHOLD && !showBio) {
        animateHeight(bioHeight, 80, setShowBio);
      }
    });

    return () => {
      scrollY.removeAllListeners();
    };
  }, [showPinnedCharity, showCategoryScroll, showBio]);

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

  let dynamicPadding;

if (showPinnedCharity) {
  dynamicPadding = 40;
} else if (showCategoryScroll){
  dynamicPadding = 80;
} else if (showBio){
  dynamicPadding = 120
} else {
  dynamicPadding = 160
}

  return (
    <SafeAreaView style={styles.page}>
      <View style={profileStyles.fixedAccountInfo}>
        <View style={profileStyles.container}>
          <View style={profileStyles.header}>
            <Text style={profileStyles.headerText}>Profile</Text>
            <TouchableOpacity onPress={() => navigation.navigate('EditProfile')}>
              <Text style={[profileStyles.editProfile, profileStyles.buttonText]}>
                Edit Profile
              </Text>
            </TouchableOpacity>
          </View>

          <View style={[profileStyles.row, profileStyles.profileInfo]}>
            <Image source={{ uri: userData.profilePicture }} style={profileStyles.profilePicture} />
            <View style={profileStyles.column}>
              <Text style={profileStyles.userNameText}>{userData.username}</Text>
              <View style={profileStyles.followRow}>
                <TouchableOpacity onPress={() => navigation.navigate('FollowersList', { userId: userData.uid })}>
                  <View style={profileStyles.column}>
                    <Text style={[profileStyles.followText, profileStyles.buttonText]}>
                      {followersCount ?? 0}
                    </Text>
                    <Text style={profileStyles.followText}>Followers</Text>
                  </View>
                </TouchableOpacity>
                
                <View style={profileStyles.verticalLine} />
                
                <TouchableOpacity onPress={() => navigation.navigate('FollowingList', { userId: userData.uid })}>
                  <View style={profileStyles.column}>
                    <Text style={[profileStyles.followText, profileStyles.buttonText]}>
                      {followingCount ?? 0}
                    </Text>
                    <Text style={profileStyles.followText}>Following</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <Text style={profileStyles.bioHeader}>{userData.displayName}</Text>

          {showBio && (
            <Animated.View style={[
              profileStyles.bioContainer,
              {
                overflow: 'hidden'
              }
            ]}>
              <Text style={profileStyles.bioMainText}>{userData.bio}</Text>
            </Animated.View>
          )}

          {showCategoryScroll && (
            <Animated.View style={[
              profileStyles.categoryContainer,
              {
                overflow: 'hidden'
              }
            ]}>
              <CategoryScroll />
            </Animated.View>
          )}

          {activeTab === 'Portfolio' && showPinnedCharity && (
            <Animated.View style={[
              profileStyles.pinnedCharityContainer,
              {
                overflow: 'hidden'
              }
            ]}>
              <PinnedCharityCard 
                username={user.username.split(" ")[0]} 
                charity="NAMI" 
                reason="Help me raise money for mental health awareness!" 
              />
            </Animated.View>
          )}

          <SwitchSelector
            initial={0}
            onPress={value => setActiveTab(value)}
            hasPadding
            options={[
              { label: "Portfolio", value: "Portfolio" },
              { label: "Posts", value: "Posts" }
            ]}
            testID="feed-switch-selector"
            accessibilityLabel="feed-switch-selector"
            style={profileStyles.switchStyle}
            selectedColor="#1C5AA3"
            buttonColor="#fff"
            backgroundColor="#F5F5F5"
            borderColor="#AFB1B3"
            textColor="#AFB1B3"
            fontSize={16}
            height={30}
          />

          <Animated.ScrollView
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              { useNativeDriver: false }
            )}
            scrollEventThrottle={16}
          >
            <View style = {[profileStyles.statsAndPostsSection, {paddingTop: dynamicPadding}]}>
            {activeTab === 'Portfolio' ? <Portfolio /> : <Posts />}
            </View>
           
          </Animated.ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}

const profileStyles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SCREEN_HEIGHT * 0.02,
  },
  container: {
    paddingHorizontal: SCREEN_WIDTH * 0.03,
    paddingTop: SCREEN_HEIGHT * 0.02,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  followRow: {
    flexDirection: 'row',
    margin: 10,
    alignItems: 'center',
  },
  column: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  followColumn: {
    flexDirection: 'column',
    alignItems: 'center',
    marginRight: 80
  },
  userNameText: {
    fontSize: 24,
    fontFamily: 'Montserrat-Medium'
  },
  followText: {
    fontSize: 16,
    color: '#747688',
    fontFamily: 'Montserrat-Medium'
  },
  categoryContainer: {
    overflow: 'hidden',
  },
  bioContainer: {
    overflow: 'hidden',
  },
  statsAndPostsSection:{
    height: 1600,
    paddingTop:20
  },
  profileInfo: {
    width: '100%',
    paddingTop: 10,
    justifyContent: 'space-between',
    paddingHorizontal: SCREEN_HEIGHT * 0.02,
  },
  headerText: {
    fontSize: SCREEN_WIDTH * 0.06,
    fontFamily: 'Montserrat-Medium',
  },
  editProfile: {
    fontSize: 16,
    fontFamily: 'Montserrat-Medium'
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
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  pieChartPlaceHolder: {
    width: 150,
    height: 150,
    alignItems: 'center',
    alignSelf: 'center',
  },
  buttonText: {
    color: '#1C5AA3',
    fontFamily: 'Montserrat-Medium',
  },
  bioHeader: {
    fontSize: 15,
    paddingHorizontal: SCREEN_HEIGHT * 0.02,
    paddingVertical: 10,
    paddingBottom: 10,
    textTransform: 'uppercase',
    color: '#1E1E1E',
    fontFamily: 'Montserrat-Medium'
  },
  bioMainText: {
    fontSize: 16,
    lineHeight: 25,
    paddingHorizontal: SCREEN_HEIGHT * 0.02,
    color: '#747688',
    fontFamily: 'Montserrat-Medium'
  },
  interestContainer: {
    alignItems: 'center',
    padding: 10,
    paddingBottom: 14,
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
    opacity: .9,
    fontFamily: 'Montserrat-Medium'
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
  portfolioContainer: {
    alignContent: 'center',
    paddingTop: 20,
    backgroundColor: '#fff',
    height: 1000
  },
  charityCardInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  charityName: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Montserrat-Medium',
  },
  percentage: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Montserrat-Medium'
  },
  spacer: {
    height: 700
  }
});

function serializeData(data) {
  const serializedData = {};
  for (const key in data) {
    if (data[key] && typeof data[key] === 'object' && !Array.isArray(data[key])) {
      if (data[key].seconds) {
        serializedData[key] = new Date(data[key].seconds * 1000).toISOString();
      } else {
        serializedData[key] = serializeData(data[key]);
      }
    } else {
      serializedData[key] = data[key];
    }
  }
  return serializedData;
}
