import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { auth, firestore } from './firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSigningUp, setIsSigningUp] = useState(false);
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setLoading(true); // Ensure loading is set to true while fetching data
            console.log("Auth state changed. Current user: ", currentUser);
            if (currentUser) {
                try {
                    const userDoc = await getDoc(doc(firestore, 'users', currentUser.uid));
                    if (userDoc.exists()) {
                        setUserData({ uid: currentUser.uid, ...userDoc.data() });
                        console.log("Fetched user data: ", userDoc.data());
                    } else {
                        setUserData(null);
                    }
                } catch (error) {
                    console.error("Failed to fetch user data: ", error);
                }
            } else {
                setUserData(null);
            }
            setUser(currentUser);
            if (!currentUser) {
                setIsSigningUp(false); // Reset on user log out
            }
            setLoading(false);
        });
        return unsubscribe; // Cleanup subscription
    }, []);

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
            // Optionally, you can add error handling or user notification here
        } finally {
            setLoading(false);
        }
    };

    const startSignUp = () => setIsSigningUp(true);

    const endSignUp = async () => {
        setIsSigningUp(false);
        if (user) {
            try {
                const userDoc = await getDoc(doc(firestore, 'users', user.uid));
                setUserData(userDoc.data());
                console.log("Fetched updated user data after signup: ", userDoc.data());
            } catch (error) {
                console.error("Failed to fetch updated user data: ", error);
            }
        }
    };

    const updateUserData = async () => {
        if (user) {
            try {
                const userDoc = await getDoc(doc(firestore, 'users', user.uid));
                setUserData(userDoc.data());
                console.log("Fetched updated user data: ", userDoc.data());
            } catch (error) {
                console.error("Failed to fetch updated user data: ", error);
            }
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, isSigningUp, userData, startSignUp, endSignUp, updateUserData, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
