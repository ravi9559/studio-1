'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  User,
  signOut,
  reauthenticateWithCredential,
  EmailAuthProvider,
  updatePassword,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { useRouter, usePathname } from 'next/navigation';

// Define the type for the context value
interface AuthContextType {
    currentUser: User | null;
    isLoadingAuth: boolean;
    login: (email: string, pass: string) => Promise<boolean>;
    logout: () => Promise<void>;
    changePassword: (currentPass: string, newPass: string) => Promise<boolean>;
    auth: any; // Exposing the auth instance
    db: any; // Exposing the db instance
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isLoadingAuth, setIsLoadingAuth] = useState(true);
    const [auth, setAuth] = useState<any>(null);
    const [db, setDb] = useState<any>(null);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const initializeFirebase = async () => {
            try {
                // Get Firebase config from Next.js environment variables.
                const firebaseConfig = {
                    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
                    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
                    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
                    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
                    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
                    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
                };
            
                // Check if the configuration is complete before initializing
                const isConfigComplete = Object.values(firebaseConfig).every(val => val !== undefined && val !== null && val !== "");
                if (!isConfigComplete) {
                    console.error("AUTH_PROVIDER_INIT: Firebase configuration is incomplete or missing. Check your .env.local file.");
                    setIsLoadingAuth(false);
                    return;
                }
            
                // Initialize Firebase app
                const app = initializeApp(firebaseConfig as any);
                const authInstance = getAuth(app);
                const dbInstance = getFirestore(app);

                setAuth(authInstance);
                setDb(dbInstance);

                // Set up the auth state change listener.
                // This listener will be the primary way to determine the user's logged-in state.
                const unsubscribe = onAuthStateChanged(authInstance, (user) => {
                    setCurrentUser(user);
                    setIsLoadingAuth(false);
                });

                // Cleanup the listener when the component unmounts
                return () => unsubscribe();

            } catch (error) {
                console.error("Firebase initialization error:", error);
                setIsLoadingAuth(false); // Stop loading even if there's an error
            }
        };

        initializeFirebase();
    }, []); // Empty dependency array ensures this runs only once on mount

    // Handle redirection based on auth state
    useEffect(() => {
        if (!isLoadingAuth) {
            if (currentUser && (pathname === '/login' || pathname === '/')) {
                router.replace('/dashboard');
            } else if (!currentUser && pathname !== '/login') {
                router.replace('/login');
            }
        }
    }, [currentUser, isLoadingAuth, pathname, router]);

    // Login function using Firebase Email/Password authentication
    const login = async (email: string, password: string): Promise<boolean> => {
        if (!auth) {
            console.error("Firebase Auth not initialized. Cannot perform login.");
            return false;
        }
        try {
            await signInWithEmailAndPassword(auth, email, password);
            // The onAuthStateChanged listener will automatically update `currentUser`
            return true;
        } catch (error: any) {
            console.error("Login error:", error.message);
            return false;
        }
    };

    // Logout function
    const logout = async (): Promise<void> => {
        if (!auth) {
            console.error("Firebase Auth not initialized. Cannot perform logout.");
            return;
        }
        try {
            await signOut(auth);
            router.replace('/login');
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    // Change password function
    const changePassword = async (currentPass: string, newPass: string): Promise<boolean> => {
        if (!auth || !currentUser) {
            console.error("Firebase Auth not initialized or no user logged in.");
            return false;
        }
        try {
            // 1. Re-authenticate the user with their current password
            const credential = EmailAuthProvider.credential(currentUser.email!, currentPass);
            await reauthenticateWithCredential(currentUser, credential);
            
            // 2. Update the password
            await updatePassword(currentUser, newPass);
            return true;
        } catch (error: any) {
            console.error("Error changing password:", error.message);
            return false;
        }
    };
 
    // The value provided to consumers of this context
    const value = {
        currentUser,
        isLoadingAuth,
        login,
        logout,
        changePassword,
        auth,
        db
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
