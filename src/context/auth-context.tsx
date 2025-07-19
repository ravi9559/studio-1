
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { User } from '@/types';

const AUTH_STORAGE_KEY = 'admin-auth';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, pass: string) => Promise<boolean>;
    logout: () => void;
    changePassword: (oldPass: string, newPass: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    const getAuthData = useCallback(() => {
        try {
            const data = localStorage.getItem(AUTH_STORAGE_KEY);
            if (data) {
                return JSON.parse(data);
            }
        } catch (error) {
            console.error("Failed to parse auth data from localStorage", error);
        }
        // Set default if not exists
        const defaultAuth = { email: 'admin@o2o.com', password: 'password' };
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(defaultAuth));
        return defaultAuth;
    }, []);

    const verifySession = useCallback(() => {
        try {
            const sessionActive = sessionStorage.getItem('sessionActive');
            if (sessionActive === 'true') {
                const authData = getAuthData();
                setUser({ email: authData.email });
            } else {
                setUser(null);
            }
        } catch (e) {
            console.error('Could not verify session', e);
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, [getAuthData]);

    useEffect(() => {
        verifySession();
        
        // This handles cases where user logs out in another tab
        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === 'sessionActive' || event.key === AUTH_STORAGE_KEY) {
                verifySession();
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [verifySession]);
    
    useEffect(() => {
        if (!loading) {
            if (!user && pathname !== '/login') {
                router.replace('/login');
            } else if (user && pathname === '/login') {
                router.replace('/dashboard');
            }
        }
    }, [user, loading, pathname, router]);


    const login = async (email: string, pass: string): Promise<boolean> => {
        const authData = getAuthData();
        if (email === authData.email && pass === authData.password) {
            sessionStorage.setItem('sessionActive', 'true');
            setUser({ email: authData.email });
            return true;
        }
        return false;
    };

    const logout = () => {
        sessionStorage.removeItem('sessionActive');
        setUser(null);
    };

    const changePassword = async (oldPass: string, newPass: string): Promise<boolean> => {
        const authData = getAuthData();
        if (authData.password === oldPass) {
            const newAuthData = { ...authData, password: newPass };
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newAuthData));
            return true;
        }
        return false;
    };


    const value = { user, loading, login, logout, changePassword };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
