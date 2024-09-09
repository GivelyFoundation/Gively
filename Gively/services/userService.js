import { firestore } from './firebaseConfig'; // Adjust the path according to your project structure
import { collection, query, where, getDocs } from 'firebase/firestore';

export const getUserByUsername = async (username) => {
  try {
    const usersCollection = collection(firestore, 'users');
    const q = query(usersCollection, where('username', '==', username));
    const userSnapshot = await getDocs(q);
    if (!userSnapshot.empty) {
      return userSnapshot.docs[0].data();
    } else {
      throw new Error('User not found');
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
};