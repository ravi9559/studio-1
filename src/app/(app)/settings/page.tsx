'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Moon, Sun, Trash2, User as UserIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

type User = {
  id: string;
  name: string;
  email: string;
  role: 'Super Admin' | 'Transaction Manager' | 'Viewer';
  status: 'Active' | 'Inactive';
  avatarUrl?: string;
};

export default function SettingsPage() {
    const { toast } = useToast();
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
    
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');

    // Sync form fields when currentUser changes
    useEffect(() => {
        if (currentUser) {
            setName(currentUser.name);
            setEmail(currentUser.email);
            setAvatarUrl(currentUser.avatarUrl || '');
        }
    }, [currentUser]);

    // Effect to load data from localStorage and listen for changes
    useEffect(() => {
        const loadData = () => {
            // Load theme
            if (typeof window !== 'undefined') {
                const savedTheme = localStorage.getItem('theme');
                setIsDarkMode(savedTheme === 'dark');
            }

            // Load current user (assuming the first user is the logged-in user)
            try {
                const savedUsers = localStorage.getItem('users');
                if (savedUsers) {
                    const users: User[] = JSON.parse(savedUsers);
                    if (users.length > 0) {
                        setCurrentUser(users[0]);
                    }
                }
            } catch (e) {
                console.error("Failed to load user data", e);
            }
        };

        loadData();

        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'users' || e.key === 'theme') {
                loadData();
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    // Effect to apply theme class
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

    const handleProfileUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) return;

        try {
            const savedUsers = localStorage.getItem('users');
            if (savedUsers) {
                let users: User[] = JSON.parse(savedUsers);
                const updatedUsers = users.map(user => 
                    user.id === currentUser.id ? { ...user, name, email, avatarUrl } : user
                );
                localStorage.setItem('users', JSON.stringify(updatedUsers));
                
                const updatedCurrentUser = updatedUsers.find(u => u.id === currentUser.id);
                if (updatedCurrentUser) {
                    setCurrentUser(updatedCurrentUser);
                }
                
                toast({
                    title: "Success",
                    description: "Your profile has been updated.",
                });
                setIsProfileDialogOpen(false);
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Could not update your profile.",
            });
            console.error("Failed to update profile", error);
        }
    };


    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">Manage your account and application settings.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><UserIcon /> User Profile</CardTitle>
                    <CardDescription>This is your profile information. You can edit it here.</CardDescription>
                </CardHeader>
                <CardContent>
                     <div className="flex items-center gap-4">
                        <Avatar className="h-20 w-20">
                            <AvatarImage src={currentUser?.avatarUrl} alt={currentUser?.name} data-ai-hint="profile person" />
                            <AvatarFallback>{currentUser?.name?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                        </Avatar>
                        <div className="grid gap-1.5">
                            <h2 className="text-2xl font-semibold">{currentUser?.name || 'Loading...'}</h2>
                            <p className="text-sm text-muted-foreground">{currentUser?.email || 'Loading...'}</p>
                            <p className="text-sm text-muted-foreground">Role: {currentUser?.role || 'Loading...'}</p>
                        </div>
                    </div>
                </CardContent>
                 <CardFooter>
                    <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
                        <DialogTrigger asChild>
                           <Button variant="outline">Edit Profile</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <form onSubmit={handleProfileUpdate}>
                                <DialogHeader>
                                    <DialogTitle>Edit Profile</DialogTitle>
                                    <DialogDescription>
                                        Make changes to your profile here. Click save when you're done.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="name" className="text-right">Name</Label>
                                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" required />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="email" className="text-right">Email</Label>
                                        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="col-span-3" required />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="avatarUrl" className="text-right">Avatar URL</Label>
                                        <Input id="avatarUrl" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} className="col-span-3" placeholder="https://..." />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="submit">Save Changes</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                 </CardFooter>
            </Card>

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
                        <Switch id="dark-mode" checked={isDarkMode} onCheckedChange={setIsDarkMode} />
                    </div>
                </CardContent>
            </Card>

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
