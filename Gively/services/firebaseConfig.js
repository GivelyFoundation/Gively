// Import the necessary functions and features from the Firebase SDKs
import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore'; // Import this if you need Firestore

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCJ0lvNYPed98Piop1WCIjDaI99YjF8l-4",
  authDomain: "gively-1c014.firebaseapp.com",
  databaseURL: "https://gively-1c014-default-rtdb.firebaseio.com",
  projectId: "gively-1c014",
  storageBucket: "gively-1c014.appspot.com",
  messagingSenderId: "479338294390",
  appId: "1:479338294390:web:233e87af7ab30144184357",
  measurementId: "G-R5LZD333FY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});
const firestore = getFirestore(app);

// Export the Firebase app and services
export { app, auth, firestore };
