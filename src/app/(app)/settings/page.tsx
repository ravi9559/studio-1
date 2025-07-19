
'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Moon, Sun, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function SettingsPage() {
    const { toast } = useToast();
    const [isDarkMode, setIsDarkMode] = useState(false);

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

    const handleClearData = () => {
        try {
            localStorage.clear();
            if (typeof window !== 'undefined') {
                localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
            }
            toast({
                title: "Success",
                description: "All local application data has been cleared.",
            });
            window.location.href = '/';
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
                <p className="text-muted-foreground">Manage application settings.</p>
            </div>

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
                        <Label className="font-medium">Clear Local Data</Label>
                        <p className="text-xs text-muted-foreground">
                           This will permanently delete all projects and data saved in your browser.
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
                                    This will permanently delete all application data from your browser.
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
