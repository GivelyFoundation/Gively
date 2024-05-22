import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from './firebaseConfig'; // make sure this path is correct

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSigningUp, setIsSigningUp] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
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
            await firebaseSignOut(auth);
            console.log('User signed out');
            setUser(null); // Optionally reset user state
        } catch (error) {
            console.error("Failed to sign out: ", error);
        }
    };

    const startSignUp = () => {
        console.log('Starting sign up process');
        setIsSigningUp(true);
    };
    
    const endSignUp = () => {
        console.log('Ending sign up process');
        setIsSigningUp(false);
    };

    return (
        <AuthContext.Provider value={{ user, loading, isSigningUp, startSignUp, endSignUp, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
