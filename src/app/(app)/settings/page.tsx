// src/app/(app)/settings/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Moon, Sun, Trash2, User, KeyRound } from 'lucide-react';
import { useToast } from '@/hooks/use-toast'; // Ensure this hook is correctly implemented
import { useAuth } from '@/context/auth-context'; // Ensure this path is correct

export default function SettingsPage() {
    const { toast } = useToast();
    const { user, changePassword } = useAuth(); // 'user' will now correctly be the Firebase User object

    const [isDarkMode, setIsDarkMode] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Theme logic (assuming it's working as expected)
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedTheme = localStorage.getItem('theme');
            setIsDarkMode(savedTheme === 'dark');
        }
    }, []);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const root = window.document.documentElement;
            root.classList.toggle('dark', isDarkMode);
            localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
        }
    }, [isDarkMode]);

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to change your password.' });
            return;
        }

        if (newPassword !== confirmPassword) {
            toast({ variant: 'destructive', title: 'Error', description: 'New passwords do not match.' });
            return;
        }
        if (!currentPassword || !newPassword) {
            toast({ variant: 'destructive', title: 'Error', description: 'Please fill all password fields.' });
            return;
        }

        // Call the changePassword function from the AuthContext
        const success = await changePassword(currentPassword, newPassword);

        if (success) {
            toast({ title: 'Success', description: 'Your password has been changed successfully.' });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } else {
            // The changePassword function in AuthContext already logs Firebase errors.
            // Here, we provide a generic error message or refine based on specific codes if needed.
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to change password. Please check your current password and try again.' });
        }
    };
    
    const handleClearData = () => {
        try {
            // Keep auth and theme data
            const theme = localStorage.getItem('theme');
            // Note: 'admin-auth' was from your old local storage auth.
            // If you still have other local storage data you want to preserve, list them here.
            localStorage.clear();
            if (theme) localStorage.setItem('theme', theme);
            // No need to preserve 'admin-auth' if you're fully on Firebase Auth

            toast({
                title: "Success",
                description: "All project data has been cleared.",
            });
            // This redirect might be problematic if it clears session data.
            // Consider a full page reload or a more controlled state reset if needed.
            window.location.href = '/dashboard';
        } catch (e) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Could not clear local data.",
            });
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">Manage your profile and application settings.</p>
            </div>

             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><User /> User Profile</CardTitle>
                    <CardDescription>Manage your account password.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="flex items-center space-x-4 rounded-md border p-4">
                        <KeyRound className="h-5 w-5" />
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium leading-none">Email</p>
                          {/* Display the logged-in user's email */}
                          <p className="text-sm text-muted-foreground">{user?.email || 'Not logged in'}</p>
                        </div>
                     </div>
                     <form onSubmit={handlePasswordChange} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="current-password">Current Password</Label>
                            <Input id="current-password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="new-password">New Password</Label>
                            <Input id="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="confirm-password">Confirm New Password</Label>
                            <Input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                        </div>
                        <Button type="submit">Change Password</Button>
                     </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">{isDarkMode ? <Moon /> : <Sun />} Appearance</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <div>
                            <Label htmlFor="dark-mode" className="font-medium">Dark Mode</Label>
                            <p className="text-xs text-muted-foreground">Toggle between light and dark themes.</p>
                        </div>
                        <Switch id="dark-mode" checked={isDarkMode} onCheckedChange={setIsDarkMode} />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Trash2 /> Data Management</CardTitle>
                </CardHeader>
                <CardContent>
                     <div>
                        <Label className="font-medium">Clear Project Data</Label>
                        <p className="text-xs text-muted-foreground">
                           This will permanently delete all projects and associated data from your browser. Your login will not be affected.
                        </p>
                    </div>
                </CardContent>
                <CardFooter className="border-t pt-6">
                     <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive">Clear Project Data</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will permanently delete all project data from your browser. This cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={handleClearData}>
                                    Yes, delete project data
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </CardFooter>
            </Card>
        </div>
    );
}