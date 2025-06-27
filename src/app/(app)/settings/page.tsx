'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Moon, Sun, Trash2, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function SettingsPage() {
    const { toast } = useToast();
    const [isDarkMode, setIsDarkMode] = useState(false);

    // Effect to set the theme class on the document element
    useEffect(() => {
        const root = window.document.documentElement;
        if (isDarkMode) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    }, [isDarkMode]);

    // Effect to load the theme from localStorage on initial render
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            setIsDarkMode(true);
        }
    }, []);

    const handleClearData = () => {
        try {
            localStorage.clear();
            // After clearing, we need to restore the theme setting
            localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
            toast({
                title: "Success",
                description: "All local application data has been cleared.",
            });
            // Optional: reload the page to see the effect immediately
            window.location.reload();
        } catch (e) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Could not clear local data.",
            });
            console.error("Failed to clear local storage", e);
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">Manage your account and application settings.</p>
            </div>

            {/* Profile Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><User /> User Profile</CardTitle>
                    <CardDescription>This is your profile information.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-1">
                        <Label>Name</Label>
                        <p className="text-sm text-muted-foreground">Transaction Manager</p>
                    </div>
                    <div className="space-y-1">
                        <Label>Role</Label>
                        <p className="text-sm text-muted-foreground">Super Admin</p>
                    </div>
                </CardContent>
                 <CardFooter>
                    <Button variant="outline" disabled>Edit Profile (Not available)</Button>
                 </CardFooter>
            </Card>

            {/* Appearance Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">{isDarkMode ? <Moon /> : <Sun />} Appearance</CardTitle>
                    <CardDescription>Customize the look and feel of the application.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <div>
                            <Label htmlFor="dark-mode" className="font-medium">Dark Mode</Label>
                            <p className="text-xs text-muted-foreground">Toggle between light and dark themes.</p>
                        </div>
                        <Switch
                            id="dark-mode"
                            checked={isDarkMode}
                            onCheckedChange={setIsDarkMode}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Data Management Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Trash2 /> Data Management</CardTitle>
                    <CardDescription>Manage your locally stored application data.</CardDescription>
                </CardHeader>
                <CardContent>
                     <div>
                        <Label className="font-medium">Clear Local Data</Label>
                        <p className="text-xs text-muted-foreground">
                           This will permanently delete all projects, users, and other data saved in your browser. This action cannot be undone.
                        </p>
                    </div>
                </CardContent>
                <CardFooter className="border-t pt-6">
                     <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive">Clear All Data</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will permanently delete all application data (projects, users, lineage, etc.) stored in this browser. This action cannot be undone and the page will reload.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={handleClearData}>
                                    Yes, delete everything
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </CardFooter>
            </Card>
        </div>
    );
}