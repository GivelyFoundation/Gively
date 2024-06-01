import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { firestore } from './firebaseConfig';

// Function to follow a user
const followUser = async (userId, followedUserId) => {
  if (!userId || !followedUserId) {
    console.error("Invalid userId or followedUserId");
    return;
  }
  
  // References to the following and followers documents in Firestore
  const followingDocRef = doc(firestore, `users/${userId}/following/${followedUserId}`);
  const followersDocRef = doc(firestore, `users/${followedUserId}/followers/${userId}`);
  
  try {
    // Set documents for following and followers
    await setDoc(followingDocRef, { followedUserId });
    await setDoc(followersDocRef, { followerUserId: userId });
    console.log(`User ${userId} is now following ${followedUserId}`);
  } catch (error) {
    console.error("Error following user: ", error);
  }
};

// Function to unfollow a user
const unfollowUser = async (userId, followedUserId) => {
  if (!userId || !followedUserId) {
    console.error("Invalid userId or followedUserId");
    return;
  }
  
  // References to the following and followers documents in Firestore
  const followingDocRef = doc(firestore, `users/${userId}/following/${followedUserId}`);
  const followersDocRef = doc(firestore, `users/${followedUserId}/followers/${userId}`);
  
  try {
    // Delete documents for following and followers
    await deleteDoc(followingDocRef);
    await deleteDoc(followersDocRef);
    console.log(`User ${userId} has unfollowed ${followedUserId}`);
  } catch (error) {
    console.error("Error unfollowing user: ", error);
  }
};

export { followUser, unfollowUser };