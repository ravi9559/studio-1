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
import type { User, Role, Project } from '@/types';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { initialUsers, initialRoles } from '@/lib/initial-data';

const USERS_STORAGE_KEY = 'users';
const ROLES_STORAGE_KEY = 'user-roles';
const PROJECTS_STORAGE_KEY = 'projects';

export default function UsersPage() {
    const { toast } = useToast();
    const [users, setUsers] = useState<User[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState<User | null>(null);

    // Load users, roles, and projects from localStorage
    useEffect(() => {
        try {
            const savedUsers = localStorage.getItem(USERS_STORAGE_KEY);
            setUsers(savedUsers ? JSON.parse(savedUsers) : initialUsers);

            const savedRoles = localStorage.getItem(ROLES_STORAGE_KEY);
            setRoles(savedRoles ? JSON.parse(savedRoles) : initialRoles);

            const savedProjects = localStorage.getItem(PROJECTS_STORAGE_KEY);
            if(savedProjects) {
                setProjects(JSON.parse(savedProjects));
            }

        } catch (e) {
            console.error("Could not load data from local storage", e);
            setUsers(initialUsers);
            setRoles(initialRoles);
            setProjects([]);
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
        toast({ title: "User Deleted", description: "The selected user has been removed." });
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
                        <CardDescription>Add, edit, or remove user accounts.</CardDescription>
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
                                    <TableCell className={`font-medium flex items-center gap-2`}>
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
                projects={projects}
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
    projects: Project[];
}

function UserFormDialog({ isOpen, onOpenChange, onSave, user, roles, projects }: UserFormDialogProps) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<string>('');
    const [status, setStatus] = useState<User['status']>('Active');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [assignedProjectIds, setAssignedProjectIds] = useState<string[]>([]);
    
    useEffect(() => {
        const defaultRole = roles.find(r => r.name === 'Client')?.name || (roles.length > 0 ? roles[0].name : '');

        if (user) {
            setName(user.name);
            setEmail(user.email);
            setRole(user.role);
            setStatus(user.status);
            setAvatarUrl(user.avatarUrl || '');
            setPassword(''); // Don't pre-fill password for editing
            setAssignedProjectIds(user.projectIds || []);
        } else {
            // Reset form for new user
            setName('');
            setEmail('');
            setPassword('');
            setRole(defaultRole);
            setStatus('Active');
            setAvatarUrl('');
            setAssignedProjectIds([]);
        }
    }, [user, isOpen, roles]);

    const handleProjectAssignment = (projectId: string) => {
        setAssignedProjectIds(prev =>
            prev.includes(projectId)
                ? prev.filter(id => id !== projectId)
                : [...prev, projectId]
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ 
            name, 
            email, 
            password, 
            role, 
            status, 
            avatarUrl, 
            projectIds: assignedProjectIds, 
        });
    };

    const isSuperAdmin = role === 'Super Admin';


    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-xl">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{user ? 'Edit User' : 'Add New User'}</DialogTitle>
                        <DialogDescription>
                            {user ? 'Update the user details below.' : 'Enter the details for the new user.'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
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
                        
                        <div className="grid grid-cols-4 items-start gap-4 pt-2">
                            <Label className="text-right pt-2">Project Access</Label>
                            <div className="col-span-3">
                                {isSuperAdmin ? (
                                    <p className="text-sm text-muted-foreground p-2 bg-muted rounded-md">Super Admins have access to all projects automatically.</p>
                                ) : (
                                    <Card>
                                        <CardContent className="p-2">
                                             <ScrollArea className="h-40">
                                                <div className="space-y-2 p-2">
                                                    {projects.length > 0 ? projects.map(p => (
                                                        <div key={p.id} className="flex items-center space-x-2">
                                                            <Checkbox
                                                                id={`project-${p.id}`}
                                                                checked={assignedProjectIds.includes(p.id)}
                                                                onCheckedChange={() => handleProjectAssignment(p.id)}
                                                            />
                                                            <label
                                                                htmlFor={`project-${p.id}`}
                                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                            >
                                                                {p.name}
                                                            </label>
                                                        </div>
                                                    )) : (
                                                        <p className="text-sm text-muted-foreground text-center p-4">No projects available to assign.</p>
                                                    )}
                                                </div>
                                            </ScrollArea>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        </div>

                    </div>
                    <DialogFooter className="border-t pt-4 mt-4">
                        <Button type="submit">Save</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
