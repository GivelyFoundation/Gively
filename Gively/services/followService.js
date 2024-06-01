import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { firestore } from './firebaseConfig';

const followUser = async (userId, followedUserId) => {
  const followingDocRef = doc(firestore, `users/${userId}/following/${followedUserId}`);
  const followersDocRef = doc(firestore, `users/${followedUserId}/followers/${userId}`);
  
  try {
    await setDoc(followingDocRef, { followedUserId });
    await setDoc(followersDocRef, { followerUserId: userId });
  } catch (error) {
    console.error("Error following user: ", error);
  }
};

const unfollowUser = async (userId, followedUserId) => {
  const followingDocRef = doc(firestore, `users/${userId}/following/${followedUserId}`);
  const followersDocRef = doc(firestore, `users/${followedUserId}/followers/${userId}`);
  
  try {
    await deleteDoc(followingDocRef);
    await deleteDoc(followersDocRef);
  } catch (error) {
    console.error("Error unfollowing user: ", error);
  }
};

export { followUser, unfollowUser };


// Usage
// followUser('currentUserId', 'followedUserId');

// Usage
// unfollowUser('currentUserId', 'unfollowedUserId');