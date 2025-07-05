
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';
import { LandPlot, Loader2 } from 'lucide-react';
import type { User } from '@/types';
import { initialUsers, initialRoles } from '@/lib/initial-data';

const USERS_STORAGE_KEY = 'users';
const ROLES_STORAGE_KEY = 'user-roles';

export default function LoginPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    useEffect(() => {
        // If user is already logged in, redirect to dashboard
        if (localStorage.getItem('loggedInUser')) {
            router.replace('/dashboard');
        } else {
            setIsCheckingAuth(false);
        }
    }, [router]);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // This is the key change: ensure users exist before trying to log in.
            let users: User[];
            const savedUsers = localStorage.getItem(USERS_STORAGE_KEY);
            
            if (savedUsers) {
                users = JSON.parse(savedUsers);
            } else {
                // If no users exist, create the initial set and save them.
                users = initialUsers;
                localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
                // Also initialize roles if they're missing, as they are related.
                if (!localStorage.getItem(ROLES_STORAGE_KEY)) {
                     localStorage.setItem(ROLES_STORAGE_KEY, JSON.stringify(initialRoles));
                }
            }

            const matchingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());

            if (matchingUser && matchingUser.password === password) {
                localStorage.setItem('loggedInUser', JSON.stringify(matchingUser));
                toast({ title: 'Login Successful', description: `Welcome back, ${matchingUser.name}!` });
                // Using window.location.href to ensure a full page refresh which correctly updates the app's state.
                window.location.href = '/dashboard';
            } else {
                 throw new Error("Invalid email or password.");
            }
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Login Failed',
                description: error.message || 'Please check your credentials and try again.',
            });
            setIsLoading(false);
        }
    };
    
    if (isCheckingAuth) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex h-screen w-screen items-center justify-center bg-muted/40 p-4">
            <Card className="w-full max-w-sm">
                <form onSubmit={handleLogin}>
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                            <LandPlot className="h-8 w-8 text-primary" />
                        </div>
                        <CardTitle>TitleLine</CardTitle>
                        <CardDescription>Trace the Origin</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="admin@o2o.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Log In
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
