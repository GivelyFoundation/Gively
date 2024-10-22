import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
    onAuthStateChanged, 
    signInWithEmailAndPassword, 
    signOut as firebaseSignOut 
} from 'firebase/auth';
import { auth, firestore } from './firebaseConfig';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSigningUp, setIsSigningUp] = useState(false);
    const [userData, setUserData] = useState(null);

    const fetchUserDataWithSubcollections = async (userId) => {
        try {
            const userDoc = await getDoc(doc(firestore, 'users', userId));
            
            if (!userDoc.exists()) {
                console.log("No user document found");
                return null;
            }

            const userDataFromFirestore = userDoc.data();

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
                    const fullUserData = await fetchUserDataWithSubcollections(currentUser.uid);
                    setUserData(fullUserData);
                    console.log("Fetched user data with subcollections: ", fullUserData);
                } catch (error) {
                    console.error("Failed to fetch user data: ", error);
                    setUserData(null);
                }
            } else {
                setUserData(null);
            }
            setUser(currentUser);
            if (!currentUser) {
                setIsSigningUp(false);
            }
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const signIn = async (email, password) => {
        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);             
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