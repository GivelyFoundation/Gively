import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
    onAuthStateChanged, 
    signInWithEmailAndPassword, 
    signOut as firebaseSignOut 
} from 'firebase/auth';
import { auth, firestore } from './firebaseConfig';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { fcmService } from './notifications/fcmService';
import { displayService } from './notifications/displayService';
import { notificationState } from './notifications/notificationState';
// import createLogger from '../../utils/logger';

// const logger = createLogger('AuthContext');
const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSigningUp, setIsSigningUp] = useState(false);
    const [userData, setUserData] = useState(null);

    const fetchUserDataWithSubcollections = async (userId) => {
        try {
            console.log("Starting to fetch user data for:", userId);
            const userDoc = await getDoc(doc(firestore, 'users', userId));
            if (!userDoc.exists()) {
                console.log("No user document found");
                return null;
            }

            const userDataFromFirestore = userDoc.data();
            console.log(`userdatafromfirestore ${JSON.stringify(userDataFromFirestore)}`)

            // Fetch 'following' subcollection
            const followingSnapshot = await getDocs(collection(firestore, 'users', userId, 'following'));
            const following = followingSnapshot.empty ? [] : followingSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // Fetch 'followers' subcollection
            const followersSnapshot = await getDocs(collection(firestore, 'users', userId, 'followers'));
            const followers = followersSnapshot.empty ? [] : followersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            return {
                uid: userId,
                ...userDataFromFirestore,
                following,
                followers
            };
        } catch (error) {
            console.error("Error fetching user data and subcollections: ", error);
            throw error;
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setLoading(true);
            console.log("Auth state changed. Current user: ", currentUser);
            if (currentUser) {
                try {
                    console.log("Current UID:", currentUser.uid);
                    const fullUserData = await fetchUserDataWithSubcollections(currentUser.uid);

                    console.log("Fetched full user data:", fullUserData);
                    setUser(currentUser);
                    setUserData(fullUserData);
                    
                    await Promise.all([
                        fcmService.init(currentUser.uid),
                        displayService.initialize(),
                        notificationState.initialize(currentUser.uid)
                    ]);

                    console.log("Fetched user data with subcollections: ", fullUserData);
                } catch (error) {
                    console.error("Failed to fetch user data: ", error);
                    setUserData(null);
                    fcmService.cleanup();
                    notificationState.cleanup();
                }
            } else {
                setUserData(null);
            }
            if (!currentUser) {
                setIsSigningUp(false);
            }
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    useEffect(() => {
        console.log("userData updated:", userData);
    }, [userData]);

    const signIn = async (email, password) => {
        setLoading(true);
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            // Initialize FCM after successful sign in
            // await fcmService.init(userCredential.user.uid);
        } catch (error) {
            console.error("Sign in failed", error); 
            throw error;
        } finally {
            setLoading(false);            
        }
    };

    const signOut = async () => {
        try {
            setLoading(true);

            await Promise.all([
                fcmService.cleanup(),
                notificationState.cleanup()
            ]);

            await firebaseSignOut(auth);
            setUser(null);
            setUserData(null);
            setIsSigningUp(false);
            console.log("User signed out successfully");
        } catch (error) {
            console.error("Failed to sign out: ", error);
        } finally {
            setLoading(false);
        }
    };

    const startSignUp = () => setIsSigningUp(true);

    const endSignUp = async () => {
        setIsSigningUp(false);
        if (user) {
            await updateUserData();
        }
    };

    const updateUserData = async () => {
        if (user) {
            try {
                const fullUserData = await fetchUserDataWithSubcollections(user.uid);
                setUserData(fullUserData);
                console.log("Fetched updated user data with subcollections: ", fullUserData);
            } catch (error) {
                console.error("Failed to fetch updated user data: ", error);
            }
        }
    };

    return (
        <AuthContext.Provider value={{ 
            user, 
            loading, 
            isSigningUp, 
            userData, 
            startSignUp, 
            endSignUp, 
            updateUserData, 
            signOut, 
            signIn 
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);