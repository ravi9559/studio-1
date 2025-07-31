// src/context/auth-context.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  User,
  signOut,
  reauthenticateWithCredential, // Import for re-authentication
  EmailAuthProvider, // Import for creating credentials
  updatePassword // Import for updating password
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  user: User | null; // Changed from currentUser to user for consistency with settings/page.tsx
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  changePassword: (currentPass: string, newPass: string) => Promise<boolean>; // Added changePassword
  isLoadingAuth: boolean;
  db: ReturnType<typeof getFirestore> | null;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null); // Changed from currentUser to user
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [auth, setAuth] = useState<any>(null);
  const [db, setDb] = useState<any>(null);
  const router = useRouter();
  const pathname = usePathname();

  const authStateChecked = useRef(false);

  // Effect for Firebase Initialization and Auth State Listener
  useEffect(() => {
    console.log('AUTH_PROVIDER_INIT: Starting Firebase initialization effect.');
    const initializeFirebase = () => {
      try {
        const firebaseConfig = {
          apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
          authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
          messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
          appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
        };

        const isConfigComplete = Object.values(firebaseConfig).every(val => val !== undefined && val !== null && val !== "");
        if (!isConfigComplete) {
            console.error("AUTH_PROVIDER_INIT: Firebase configuration is incomplete or missing. Check your .env.local file.");
            setIsLoadingAuth(false);
            return;
        }

        const app = initializeApp(firebaseConfig);
        const authInstance = getAuth(app);
        const dbInstance = getFirestore(app);

        setAuth(authInstance);
        setDb(dbInstance);

        console.log('AUTH_PROVIDER_INIT: Setting up onAuthStateChanged listener.');
        const unsubscribe = onAuthStateChanged(authInstance, (firebaseUser) => { // Renamed param to avoid conflict with state 'user'
          console.log('AUTH_PROVIDER_STATE_CHANGE: onAuthStateChanged fired. User:', firebaseUser ? firebaseUser.email : 'null', 'UID:', firebaseUser ? firebaseUser.uid : 'null');
          setUser(firebaseUser); // Set the state 'user'
          if (!authStateChecked.current) {
            authStateChecked.current = true;
            setIsLoadingAuth(false);
            console.log('AUTH_PROVIDER_STATE_CHANGE: Initial auth state determined. isLoadingAuth set to false.');
          }
        });

        return () => {
          console.log('AUTH_PROVIDER_CLEANUP: Cleaning up onAuthStateChanged listener.');
          unsubscribe();
        };
      } catch (error) {
        console.error("AUTH_PROVIDER_INIT_ERROR: Firebase initialization error:", error);
        setIsLoadingAuth(false);
      }
    };

    initializeFirebase();
  }, []);

  // Effect for Automatic Redirection based on Auth State
  useEffect(() => {
    console.log('AUTH_PROVIDER_REDIRECT_EFFECT: Triggered. isLoadingAuth:', isLoadingAuth, 'user:', user ? user.email : 'null', 'pathname:', pathname, 'authStateChecked.current:', authStateChecked.current);

    if (!isLoadingAuth && authStateChecked.current) {
      if (!user && pathname !== '/login') {
        console.log('AUTH_PROVIDER_REDIRECT: Redirecting to /login (no user and not on login page).');
        router.replace('/login');
      } else if (user && (pathname === '/login' || pathname === '/')) {
        console.log('AUTH_PROVIDER_REDIRECT: Redirecting to /dashboard (user logged in and on login/root page).');
        router.replace('/dashboard');
      } else {
        console.log('AUTH_PROVIDER_REDIRECT: No redirection needed based on current state and path.');
      }
    } else {
      console.log('AUTH_PROVIDER_REDIRECT_SKIP: Still loading authentication state or initial check not complete, skipping redirection logic.');
    }
  }, [user, isLoadingAuth, pathname, router]); // Dependencies for this effect

  const login = async (email: string, password: string): Promise<boolean> => {
    console.log('AUTH_PROVIDER_LOGIN_CALL: Login function called for email:', email);
    if (!auth) {
      console.error("AUTH_PROVIDER_LOGIN_ERROR: Firebase Auth not initialized. Cannot perform login.");
      return false;
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log('AUTH_PROVIDER_LOGIN_SUCCESS: signInWithEmailAndPassword successful.');
      return true;
    } catch (error: any) {
      console.error("AUTH_PROVIDER_LOGIN_FAIL: Login error:", error.message);
      // Do not set error state here, let the calling component handle it.
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    console.log('AUTH_PROVIDER_LOGOUT_CALL: Logout function called.');
    if (!auth) {
      console.error("AUTH_PROVIDER_LOGOUT_ERROR: Firebase Auth not initialized. Cannot perform logout.");
      return;
    }
    try {
      await signOut(auth);
      console.log('AUTH_PROVIDER_LOGOUT_SUCCESS: signOut successful.');
    } catch (error: any) {
      console.error("AUTH_PROVIDER_LOGOUT_FAIL: Logout error:", error.message);
    }
  };

  const changePassword = async (currentPass: string, newPass: string): Promise<boolean> => {
    console.log('AUTH_PROVIDER_CHANGE_PASSWORD_CALL: Change password function called.');
    if (!auth || !user || !user.email) {
      console.error("AUTH_PROVIDER_CHANGE_PASSWORD_ERROR: User not authenticated or email missing.");
      return false;
    }

    try {
      // 1. Re-authenticate the user with their current password
      // This is a security measure required by Firebase for sensitive operations
      const credential = EmailAuthProvider.credential(user.email, currentPass);
      await reauthenticateWithCredential(user, credential);
      console.log('AUTH_PROVIDER_CHANGE_PASSWORD_SUCCESS: User re-authenticated successfully.');

      // 2. Update the password
      await updatePassword(user, newPass);
      console.log('AUTH_PROVIDER_CHANGE_PASSWORD_SUCCESS: Password updated successfully.');
      return true;
    } catch (error: any) {
      console.error("AUTH_PROVIDER_CHANGE_PASSWORD_FAIL: Error changing password:", error.message);
      // Specific Firebase error handling examples:
      if (error.code === 'auth/wrong-password') {
        console.error('AUTH_PROVIDER_CHANGE_PASSWORD_FAIL: Incorrect current password.');
      } else if (error.code === 'auth/requires-recent-login') {
        console.error('AUTH_PROVIDER_CHANGE_PASSWORD_FAIL: User needs to log in again.');
      }
      return false;
    }
  };

  const value = {
    user, // Expose 'user'
    login,
    logout,
    changePassword, // Expose changePassword
    isLoadingAuth,
    db,
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