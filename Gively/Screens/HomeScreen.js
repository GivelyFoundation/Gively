import React, { useState, useRef, useEffect, memo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Modal
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import SwitchSelector from "react-native-switch-selector";
import { useAuth } from '../services/AuthContext';
import { usePosts } from '../hooks/usePosts';

import DonationCard from '../Components/DonationCard';
import PetitionCard from '../Components/PetitionCard';
import GoFundMeCard from '../Components/GoFundMeCard';
import VolunteerCard from '../Components/VolunteerCard';
import FirstTimeDonationCard from '../Components/FirstTimeDonationCard';
import PostCreationModal from '../Components/PostCreationModal';

const POSTS_LIMIT = 10;

const PostCard = memo(({ item }) => {
  if (!item) return null;
  
  switch (item.postType) {
    case 'donation':
      return <View style={styles.cardContainer}><DonationCard data={item} /></View>;
    case 'petition':
      return <View style={styles.cardContainer}><PetitionCard data={item} /></View>;
    case 'gofundme':
      return <View style={styles.cardContainer}><GoFundMeCard data={item} /></View>;
    case 'volunteer':
      return <View style={styles.cardContainer}><VolunteerCard data={item} /></View>;
    case 'firstTime':
      return <View style={styles.cardContainer}><FirstTimeDonationCard data={item} /></View>;
    default:
      return <View><Text>Unknown Post Type</Text></View>;
  }
});

const PostList = memo(({ posts, refreshing, onRefresh, onEndReached, loadingMore, listKey }) => {
  const flatListRef = useRef(null);
  const isLoadingRef = useRef(false);

  useEffect(() => {
    if (flatListRef.current) {
      requestAnimationFrame(() => {
        flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
      });
    }
  }, [listKey]);

  const handleLoadMore = async () => {
    if (isLoadingRef.current || loadingMore) return;
    
    isLoadingRef.current = true;
    await onEndReached();
    isLoadingRef.current = false;
  };

  const renderItem = useCallback(({ item }) => (
    <PostCard item={item} />
  ), []);

  const keyExtractor = useCallback(item => item.id, []);

  return (
    <View style={styles.listContainer}>
      <FlatList
        ref={flatListRef}
        style={styles.list}
        contentContainerStyle={[
          styles.listContent,
          posts.length < 4 && styles.shortListContent
        ]}
        data={posts}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#3FC032"
            progressBackgroundColor="#fff"
            colors={["#3FC032"]}
            style={{ backgroundColor: 'transparent' }}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={loadingMore ? (
          <View style={styles.loadingMoreContainer}>
            <ActivityIndicator color="#3FC032" size="large" />
          </View>
        ) : null}
        removeClippedSubviews={false}
        initialNumToRender={7}
        maxToRenderPerBatch={5}
        windowSize={11}
        updateCellsBatchingPeriod={50}
        key={listKey}
      />
    </View>
  );
});

const FriendsPrompt = memo(({ navigation }) => (
  <View style={styles.friendsPromptContainer}>
    <Text style={styles.friendsPromptText}>
      You're not following anyone yet. Start following other users to see their posts here!
    </Text>
    <TouchableOpacity
      style={styles.friendsPromptButton}
      onPress={() => navigation.navigate('Connect')}
    >
      <Text style={styles.friendsPromptButtonText}>Find Users to Follow</Text>
    </TouchableOpacity>
  </View>
));

export default function HomeFeedScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('For You');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { userData } = useAuth();

  const isForYouFeed = activeTab === 'For You';
  const followedUsers = userData?.following?.map(f => f.followedUserId) || [];
  const listKey = `${activeTab}-${isForYouFeed ? 'forYou' : 'friends'}`;
  
  const { 
    posts, 
    loading, 
    refreshing, 
    error, 
    refresh, 
    loadMore, 
    addNewPost
  } = usePosts(isForYouFeed, followedUsers);

  const handleTabPress = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  const toggleModal = useCallback(() => {
    setIsModalVisible(prev => !prev);
  }, []);

  const handleModalClose = useCallback(() => {
    setIsModalVisible(false);
  }, []);

  const handlePostCreated = useCallback((newPost) => {
    addNewPost(newPost);
    handleModalClose();
  }, [addNewPost]);


  const renderContent = useCallback(() => {
    if (!isForYouFeed && followedUsers.length === 0) {
      return <FriendsPrompt navigation={navigation} />;
    }

    return (
      <View style={styles.contentContainer}>
        {error && <Text style={styles.errorText}>{error}</Text>}
        <PostList
          posts={posts}
          refreshing={refreshing}
          onRefresh={refresh}
          onEndReached={loadMore}
          loadingMore={loading}
          listKey={listKey}
        />
      </View>
    );
  }, [
    isForYouFeed,
    followedUsers.length,
    posts,
    refreshing,
    loading,
    error,
    refresh,
    loadMore,
    listKey,
    navigation
  ]);

  return (
    <View style={styles.parent}>
      <SwitchSelector
        initial={0}
        onPress={handleTabPress}
        hasPadding
        options={[
          { label: "For You", value: "For You" },
          { label: "Friends", value: "Friends" }
        ]}
        testID="feed-switch-selector"
        accessibilityLabel="feed-switch-selector"
        style={styles.switchStyle}
        selectedColor={'#1C5AA3'}
        buttonColor={'#fff'}
        backgroundColor={'#F5F5F5'}
        textColor={"#AFB1B3"}
        borderColor={"#AFB1B3"}
        fontSize={16}
        height={30}
      />
      {renderContent()}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={toggleModal}
      >
        <Icon name="plus" size={24} color="#fff" />
      </TouchableOpacity>
      <PostCreationModal
        visible={isModalVisible}
        onClose={handleModalClose}
        onPostCreated={handlePostCreated}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  parent: {
    flex: 1,
    width: '100%',
    backgroundColor: '#fff',
  },
  listContainer: {
    flex: 1,
    width: '100%',
  },
  contentContainer: {
    flex: 1,
    width: '100%',
  },
  cardContainer: {
    width: '100%',
  },
  switchStyle: {
    paddingTop: 10,
    paddingHorizontal: 20,
    paddingBottom: 10
  },
  list: {
    width: '100%',
  },
  listContent: {
    paddingHorizontal: 10,
    paddingBottom: 80,
  },
  shortListContent: {
    flexGrow: 1,
  },
  loadingMoreContainer: {
    paddingVertical: 20,
    marginBottom: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3FC032',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  actionButton: {
    borderRadius: 12,
    borderWidth: 1,
    height: 36,
    width: '94%',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 10,
  },
  petitionButton: {
    borderColor: '#1C5AA3',
  },
  goFundMeButton: {
    borderColor: '#3FC032',
  },
  closeModalButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#3FC032',
    borderRadius: 5,
  },
  actionButtonText: {
    fontSize: 16,
    opacity: 0.9,
    fontFamily: 'Montserrat-Medium',
  },
  petitionButtonText: {
    color: '#1C5AA3',
  },
  goFundMeButtonText: {
    color: '#3FC032',
  },
  closeModalText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginVertical: 10,
  },
  friendsPromptContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  friendsPromptText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'Montserrat-Medium',
    color: '#4A4A4A',
  },
  friendsPromptButton: {
    backgroundColor: '#3FC032',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  friendsPromptButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Montserrat-Bold',
  },
});