import { useState, useEffect, useRef, useCallback } from 'react';
import { firebaseService } from './firebaseService';
import { useAuth } from './AuthContext';

const POSTS_LIMIT = 10;
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
const REFRESH_COOLDOWN = 5000; // 2 seconds between refreshes

export const usePosts = (isForYouFeed) => {
  const [posts, setPosts] = useState([]);
  const [lastVisible, setLastVisible] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const { userData } = useAuth();

  // Cache and loading state refs
  const postsCache = useRef({
    forYou: { posts: [], lastVisible: null, timestamp: null },
    friends: { posts: [], lastVisible: null, timestamp: null }
  });
  
  const isLoadingRef = useRef(false);
  const lastRefreshTimeRef = useRef(0);

  // Helper functions
  const isCacheValid = (timestamp) => {
    if (!timestamp) return false;
    return Date.now() - timestamp < CACHE_DURATION;
  };

  const getCacheKey = () => isForYouFeed ? 'forYou' : 'friends';

  // Main fetch posts function
  const fetchPosts = useCallback(async (lastDoc = null, shouldResetPosts = false) => {
    if (isLoadingRef.current) return;
    
    const cacheKey = getCacheKey();
    isLoadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const followedUsers = isForYouFeed ? null : userData?.following?.map(f => f.followedUserId);
      
      // Handle case where user has no followers for friends feed
      if (!isForYouFeed && (!followedUsers || followedUsers.length === 0)) {
        setPosts([]);
        setLastVisible(null);
        postsCache.current[cacheKey] = {
          posts: [],
          lastVisible: null,
          timestamp: Date.now()
        };
        return;
      }

      const { posts: newPosts, lastVisibleDoc } = await firebaseService.getPosts(
        lastDoc,
        followedUsers,
        POSTS_LIMIT
      );
      // Update posts state based on whether we're resetting or adding more
      setPosts(prevPosts => shouldResetPosts ? newPosts : [...prevPosts, ...newPosts]);
      setLastVisible(lastVisibleDoc);
      
      // Update cache
      if (shouldResetPosts) {
        postsCache.current[cacheKey] = {
          posts: newPosts,
          lastVisible: lastVisibleDoc,
          timestamp: Date.now()
        };
      } else {
        postsCache.current[cacheKey] = {
          posts: [...postsCache.current[cacheKey].posts, ...newPosts],
          lastVisible: lastVisibleDoc,
          timestamp: postsCache.current[cacheKey].timestamp
        };
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, [isForYouFeed, userData]);

  const addNewPost = useCallback((newPost) => {
    newPost = {
        ...newPost,
        posterData: {
            displayName: userData.displayName,
            profilePicture: userData.profilePicture,
            username: userData.username
        }
     }
    setPosts(currentPosts => [newPost, ...currentPosts]);

    // Update cache
    const cacheKey = getCacheKey();
    postsCache.current[cacheKey] = {
      ...postsCache.current[cacheKey],
      posts: [newPost, ...postsCache.current[cacheKey].posts],
      timestamp: Date.now() // Reset cache timestamp
    };
  }, [getCacheKey]);

  // Refresh function with cooldown
  const refresh = useCallback(async (force = false) => {
    const now = Date.now();
    const timeSinceLastRefresh = now - lastRefreshTimeRef.current;

    // Skip cooldown if force is true
    if (!force && timeSinceLastRefresh < REFRESH_COOLDOWN) {
      console.log('Refresh attempted too soon, please wait...');
      return false;
    }

    if (refreshing) {
      console.log('Already refreshing, please wait...');
      return false;
    }

    try {
      setRefreshing(true);
      lastRefreshTimeRef.current = now;
      setLastVisible(null);
      await fetchPosts(null, true);
      return true;
    } finally {
      setRefreshing(false);
    }
  }, [refreshing, fetchPosts]);

  // Load more function
  const loadMore = useCallback(() => {
    if (!loading && lastVisible && !isLoadingRef.current) {
      fetchPosts(lastVisible, false);
    }
  }, [loading, lastVisible, fetchPosts]);

  // Effect to handle initial load and tab switches
  useEffect(() => {
    const cacheKey = getCacheKey();
    const cachedData = postsCache.current[cacheKey];

    if (cachedData.posts.length > 0 && isCacheValid(cachedData.timestamp)) {
      // Use cached data
      setPosts(cachedData.posts);
      setLastVisible(cachedData.lastVisible);
    } else {
      // Fetch fresh data
      fetchPosts(null, true);
    }
  }, [isForYouFeed, userData, fetchPosts]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      isLoadingRef.current = false;
    };
  }, []);

  // Function to update a single post (e.g., after like/unlike)
  const updatePost = useCallback((postId, updates) => {
    setPosts(currentPosts => 
      currentPosts.map(post => 
        post.id === postId ? { ...post, ...updates } : post
      )
    );

    // Update cache
    const cacheKey = getCacheKey();
    const cachedPosts = postsCache.current[cacheKey].posts;
    postsCache.current[cacheKey] = {
      ...postsCache.current[cacheKey],
      posts: cachedPosts.map(post => 
        post.id === postId ? { ...post, ...updates } : post
      )
    };
  }, [getCacheKey]);

  return {
    posts,
    loading,
    refreshing,
    error,
    refresh,
    loadMore,
    updatePost,
    addNewPost,
    hasMore: !!lastVisible && posts.length >= POSTS_LIMIT,
    metadata: {
      lastRefreshed: lastRefreshTimeRef.current,
      cacheAge: postsCache.current[getCacheKey()].timestamp
        ? Date.now() - postsCache.current[getCacheKey()].timestamp
        : null,
      canRefresh: Date.now() - lastRefreshTimeRef.current >= REFRESH_COOLDOWN
    }
  };
};