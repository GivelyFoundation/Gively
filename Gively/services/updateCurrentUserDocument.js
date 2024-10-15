import { auth, firestore } from './firebaseConfig';
import { 
  doc, 
  updateDoc, 
  collection, 
  addDoc,
  serverTimestamp 
} from 'firebase/firestore';

async function updateCurrentUserStructure() {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    console.error('No user is currently logged in');
    return;
  }

  const userDocRef = doc(firestore, 'users', currentUser.uid);

  try {
    // Update the user document with new fields
    await updateDoc(userDocRef, {
      lastRecommendationRefresh: null,
      dismissedRecommendations: []
    });

    console.log('Updated user document with new fields');

    // Create the recommendations subcollection
    const recommendationsRef = collection(firestore, `users/${currentUser.uid}/recommendations`);
    await addDoc(recommendationsRef, {
      placeholder: true,
      createdAt: serverTimestamp()
    });

    console.log('Created recommendations subcollection');

    console.log('Firestore structure update completed successfully for current user');
  } catch (error) {
    console.error('Error updating Firestore structure for current user:', error);
    // In a real app, you might want to show this error to the user
    // or send it to a logging service
  }
}

export default updateCurrentUserStructure;