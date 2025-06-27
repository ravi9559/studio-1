'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';

// Define the type for a user
type User = {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: string;
  status: 'Active' | 'Inactive';
  avatarUrl?: string;
};

// Define Role type
type Role = {
    id: string;
    name: string;
}

// Initial mock data
const initialUsers: User[] = [
    { id: 'user-1682600000001', name: 'Super Admin', email: 'admin@o2o.com', password: 'password', role: 'Super Admin', status: 'Active', avatarUrl: 'https://placehold.co/40x40.png' },
    { id: 'user-1682600000002', name: 'Transaction Manager', email: 'manager@o2o.com', password: 'password', role: 'Transaction Manager', status: 'Active' },
    { id: 'user-1682600000003', name: 'Read Only User', email: 'viewer@o2o.com', password: 'password', role: 'Viewer', status: 'Inactive' },
];

const initialRoles: Role[] = [
    { id: 'role-super-admin', name: 'Super Admin' },
    { id: 'role-manager', name: 'Transaction Manager' },
    { id: 'role-viewer', name: 'Viewer' },
];

const USERS_STORAGE_KEY = 'users';
const ROLES_STORAGE_KEY = 'user-roles';

export default function UsersPage() {
    const { toast } = useToast();
    const [users, setUsers] = useState<User[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState<User | null>(null);

    // Load users and roles from localStorage
    useEffect(() => {
        try {
            const savedUsers = localStorage.getItem(USERS_STORAGE_KEY);
            if (savedUsers) {
                setUsers(JSON.parse(savedUsers));
            } else {
                setUsers(initialUsers);
            }

            const savedRoles = localStorage.getItem(ROLES_STORAGE_KEY);
            if(savedRoles) {
                setRoles(JSON.parse(savedRoles));
            } else {
                setRoles(initialRoles);
            }
        } catch (e) {
            console.error("Could not load data from local storage", e);
            setUsers(initialUsers);
            setRoles(initialRoles);
        }
        setIsLoaded(true);
    }, []);

    // Save users to localStorage
    useEffect(() => {
        if (isLoaded) {
            try {
                localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
            } catch (e) {
                console.error("Could not save users to local storage", e);
            }
        }
    }, [users, isLoaded]);

    const handleAddUser = () => {
        setUserToEdit(null);
        setIsDialogOpen(true);
    };

    const handleEditUser = (user: User) => {
        setUserToEdit(user);
        setIsDialogOpen(true);
    };

    const handleDeleteUser = (userId: string) => {
        setUsers(users.filter(user => user.id !== userId));
        toast({ title: "User Deleted", description: "The user has been successfully removed." });
    };

    const handleSaveUser = (userData: Omit<User, 'id'>) => {
        if (userToEdit) {
            // Edit existing user
            const updatedData = { ...userData };
            if (!updatedData.password) {
                // If password field is empty on edit, keep the old one
                updatedData.password = userToEdit.password;
            }
            setUsers(users.map(user => user.id === userToEdit.id ? { ...userToEdit, ...updatedData } : user));
            toast({ title: "User Updated", description: "The user details have been saved." });
        } else {
            // Add new user
            const newUser: User = {
                id: `user-${Date.now()}`,
                ...userData,
            };
            setUsers([...users, newUser]);
            toast({ title: "User Added", description: "The new user has been created." });
        }
        setIsDialogOpen(false);
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>User Management</CardTitle>
                        <CardDescription>Add, edit, or remove users from the system.</CardDescription>
                    </div>
                    <Button onClick={handleAddUser}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add User
                    </Button>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map(user => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium flex items-center gap-2">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="profile person" />
                                            <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        {user.name}
                                    </TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>{user.role}</TableCell>
                                    <TableCell>
                                        <Badge variant={user.status === 'Active' ? 'default' : 'secondary'}>
                                            {user.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button variant="ghost" size="icon" onClick={() => handleEditUser(user)}>
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
                                                        This action cannot be undone. This will permanently delete the user account.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => handleDeleteUser(user.id)}>Delete</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <UserFormDialog
                isOpen={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                onSave={handleSaveUser}
                user={userToEdit}
                roles={roles}
            />
        </div>
    );
}

// User Form Dialog Component
interface UserFormDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onSave: (userData: Omit<User, 'id'>) => void;
    user: User | null;
    roles: Role[];
}

function UserFormDialog({ isOpen, onOpenChange, onSave, user, roles }: UserFormDialogProps) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<string>('');
    const [status, setStatus] = useState<User['status']>('Active');
    const [avatarUrl, setAvatarUrl] = useState('');

    useEffect(() => {
        const defaultRole = roles.length > 0 ? roles[roles.length - 1].name : 'Viewer';

        if (user) {
            setName(user.name);
            setEmail(user.email);
            setRole(user.role);
            setStatus(user.status);
            setAvatarUrl(user.avatarUrl || '');
            setPassword(''); // Don't pre-fill password for editing
        } else {
            // Reset form for new user
            setName('');
            setEmail('');
            setPassword('');
            setRole(defaultRole);
            setStatus('Active');
            setAvatarUrl('');
        }
    }, [user, isOpen, roles]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ name, email, password, role, status, avatarUrl });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{user ? 'Edit User' : 'Add New User'}</DialogTitle>
                        <DialogDescription>
                            {user ? 'Update the user details below.' : 'Enter the details for the new user.'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">Name</Label>
                            <Input id="name" value={name} onChange={e => setName(e.target.value)} className="col-span-3" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="email" className="text-right">Email</Label>
                            <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} className="col-span-3" required />
                        </div>
                         <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="password" className="text-right">Password</Label>
                            <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} className="col-span-3" placeholder={user ? "Leave blank to keep unchanged" : ""} required={!user} />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="avatarUrl" className="text-right">Avatar URL</Label>
                            <Input id="avatarUrl" value={avatarUrl} onChange={e => setAvatarUrl(e.target.value)} className="col-span-3" placeholder="https://..." />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Role</Label>
                            <Select onValueChange={(v: string) => setRole(v)} value={role}>
                                <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {roles.map(r => (
                                        <SelectItem key={r.id} value={r.name}>{r.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Status</Label>
                            <Select onValueChange={(v: User['status']) => setStatus(v)} value={status}>
                                <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Active">Active</SelectItem>
                                    <SelectItem value="Inactive">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
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
