
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Moon, Sun, Trash2, User as UserIcon, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { User, Role } from '@/types';
import { initialRoles } from '@/lib/initial-data';

const ROLES_STORAGE_KEY = 'user-roles';
const USERS_STORAGE_KEY = 'users';

export default function SettingsPage() {
    const { toast } = useToast();
    const router = useRouter();
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
    const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
    
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');

    const [roles, setRoles] = useState<Role[]>([]);
    const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
    const [roleToEdit, setRoleToEdit] = useState<Role | null>(null);
    const [isRolesLoaded, setIsRolesLoaded] = useState(false);

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

            // Load current user
            try {
                const savedLoggedInUser = localStorage.getItem('loggedInUser');
                if (savedLoggedInUser) {
                    setCurrentUser(JSON.parse(savedLoggedInUser));
                }
            } catch (e) {
                console.error("Failed to load user data", e);
            }
        };

        loadData();

        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === USERS_STORAGE_KEY || e.key === 'theme' || e.key === 'loggedInUser') {
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

    // Effect to load roles
    useEffect(() => {
        try {
            const savedRoles = localStorage.getItem(ROLES_STORAGE_KEY);
            if (savedRoles) {
                setRoles(JSON.parse(savedRoles));
            } else {
                setRoles(initialRoles);
                localStorage.setItem(ROLES_STORAGE_KEY, JSON.stringify(initialRoles));
            }
        } catch (e) {
            console.error("Failed to load roles data", e);
            setRoles(initialRoles);
        }
        setIsRolesLoaded(true);
    }, []);

    // Effect to save roles
    useEffect(() => {
        if (isRolesLoaded) {
            try {
                localStorage.setItem(ROLES_STORAGE_KEY, JSON.stringify(roles));
            } catch (e) {
                console.error("Could not save roles to local storage", e);
            }
        }
    }, [roles, isRolesLoaded]);

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
            window.location.href = '/login'; // Redirect to login after clearing
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
            const savedUsers = localStorage.getItem(USERS_STORAGE_KEY);
            if (savedUsers) {
                let users: User[] = JSON.parse(savedUsers);
                const updatedUsers = users.map(user => 
                    user.id === currentUser.id ? { ...user, name, email, avatarUrl } : user
                );
                localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));
                
                const updatedCurrentUser = updatedUsers.find(u => u.id === currentUser.id);
                if (updatedCurrentUser) {
                    setCurrentUser(updatedCurrentUser);
                    localStorage.setItem('loggedInUser', JSON.stringify(updatedCurrentUser));
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

    const handlePasswordChange = (newPassword: string) => {
        if (!currentUser) return;
        try {
            const savedUsers = localStorage.getItem(USERS_STORAGE_KEY);
            let users: User[] = savedUsers ? JSON.parse(savedUsers) : [];
            
            const updatedUsers = users.map(user => 
                user.id === currentUser.id ? { ...user, password: newPassword } : user
            );
            localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));

            const updatedCurrentUser = { ...currentUser, password: newPassword };
            setCurrentUser(updatedCurrentUser);
            localStorage.setItem('loggedInUser', JSON.stringify(updatedCurrentUser));

            toast({ title: "Success", description: "Your password has been updated." });

        } catch (e) {
            toast({ variant: "destructive", title: "Error", description: "Could not update your password." });
            console.error(e);
        }
    };

    const handleAddRole = () => {
        setRoleToEdit(null);
        setIsRoleDialogOpen(true);
    };

    const handleEditRole = (role: Role) => {
        setRoleToEdit(role);
        setIsRoleDialogOpen(true);
    };

    const handleSaveRole = (roleData: { name: string }) => {
        if (roleToEdit) {
            const oldRoleName = roleToEdit.name;
            const newRoleName = roleData.name;
            
            if (roles.some(r => r.name === newRoleName && r.id !== roleToEdit.id)) {
                toast({ variant: "destructive", title: "Error", description: "A role with this name already exists." });
                return;
            }
            
            const updatedRoles = roles.map(r => r.id === roleToEdit.id ? { ...r, name: newRoleName } : r);
            setRoles(updatedRoles);

            try {
                const savedUsers = localStorage.getItem(USERS_STORAGE_KEY);
                if (savedUsers) {
                    let users: User[] = JSON.parse(savedUsers);
                    const updatedUsers = users.map(user => 
                        user.role === oldRoleName ? { ...user, role: newRoleName } : user
                    );
                    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));
                }
            } catch (e) {
                console.error("Failed to cascade role update to users", e);
            }

            toast({ title: "Role Updated", description: "The role and associated users have been updated." });
        } else {
             if (roles.some(r => r.name === roleData.name)) {
                toast({ variant: "destructive", title: "Error", description: "A role with this name already exists." });
                return;
            }
            const newRole: Role = {
                id: `role-${Date.now()}`,
                name: roleData.name,
            };
            setRoles([...roles, newRole]);
            toast({ title: "Role Added", description: "The new role has been created." });
        }
        setIsRoleDialogOpen(false);
    };

    const handleDeleteRole = (roleId: string) => {
        const roleToDelete = roles.find(r => r.id === roleId);
        if (!roleToDelete) return;

        try {
            const savedUsers = localStorage.getItem(USERS_STORAGE_KEY);
            let users: User[] = savedUsers ? JSON.parse(savedUsers) : [];
            const isRoleInUse = users.some(u => u.role === roleToDelete.name);

            if (isRoleInUse) {
                toast({
                    variant: "destructive",
                    title: "Cannot Delete Role",
                    description: "This role is currently assigned to one or more users.",
                });
                return;
            }

            setRoles(roles.filter(r => r.id !== roleId));
            toast({ title: "Role Deleted", description: "The role has been successfully removed." });
        } catch (e) {
            console.error("Failed to delete role", e);
            toast({ variant: "destructive", title: "Error", description: "Could not delete the role." });
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
                 <CardFooter className="flex gap-2">
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
                    <Button variant="outline" onClick={() => setIsPasswordDialogOpen(true)}>Change Password</Button>
                 </CardFooter>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">Role Management</CardTitle>
                    <CardDescription>Add, edit, or remove user roles from the system.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Role Name</TableHead>
                                <TableHead className="text-right w-[100px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {roles.map(role => (
                                <TableRow key={role.id}>
                                    <TableCell className="font-medium">{role.name}</TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button variant="ghost" size="icon" onClick={() => handleEditRole(role)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This action cannot be undone. You can only delete roles that are not assigned to any users.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => handleDeleteRole(role.id)}>Delete</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
                <CardFooter>
                     <Button onClick={handleAddRole}>Add New Role</Button>
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

            <RoleFormDialog
                isOpen={isRoleDialogOpen}
                onOpenChange={setIsRoleDialogOpen}
                onSave={handleSaveRole}
                role={roleToEdit}
            />
            <ChangePasswordDialog
                isOpen={isPasswordDialogOpen}
                onOpenChange={setIsPasswordDialogOpen}
                currentUser={currentUser}
                onPasswordChanged={handlePasswordChange}
            />
        </div>
    );
}

interface RoleFormDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onSave: (roleData: { name: string }) => void;
    role: Role | null;
}

function RoleFormDialog({ isOpen, onOpenChange, onSave, role }: RoleFormDialogProps) {
    const [name, setName] = useState('');

    useEffect(() => {
        if (role) {
            setName(role.name);
        } else {
            setName('');
        }
    }, [role, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ name });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{role ? 'Edit Role' : 'Add New Role'}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="role-name" className="text-right">Name</Label>
                            <Input id="role-name" value={name} onChange={e => setName(e.target.value)} className="col-span-3" required />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit">Save</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

interface ChangePasswordDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  currentUser: User | null;
  onPasswordChanged: (newPassword: string) => void;
}

function ChangePasswordDialog({ isOpen, onOpenChange, currentUser, onPasswordChanged }: ChangePasswordDialogProps) {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const { toast } = useToast();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) return;

        if (currentUser.password !== currentPassword) {
            toast({ variant: "destructive", title: "Error", description: "Current password is not correct." });
            return;
        }

        if (newPassword !== confirmPassword) {
            toast({ variant: "destructive", title: "Error", description: "New passwords do not match." });
            return;
        }
        
        if (newPassword.length < 6) {
             toast({ variant: "destructive", title: "Error", description: "Password must be at least 6 characters long." });
            return;
        }

        onPasswordChanged(newPassword);
        onOpenChange(false);
    };

    useEffect(() => {
        if (!isOpen) {
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        }
    }, [isOpen]);

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Change Password</DialogTitle>
                        <DialogDescription>Update your password. Please choose a strong password.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="current-password">Current Password</Label>
                            <Input id="current-password" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="new-password">New Password</Label>
                            <Input id="new-password" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="confirm-password">Confirm New Password</Label>
                            <Input id="confirm-password" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit">Update Password</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

    

    