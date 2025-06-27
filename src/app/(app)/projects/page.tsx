'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, ArrowRight } from "lucide-react";
import Link from 'next/link';
import type { Project, User } from '@/types';
import { Loader2 } from 'lucide-react';

const DATA_VERSION = "1.3";
const DATA_VERSION_KEY = 'data-version';
const USERS_STORAGE_KEY = 'users';
const PROJECTS_STORAGE_KEY = 'projects';

const initialUsers: User[] = [
    { id: 'user-1682600000001', name: 'O2O Technologies', email: 'admin@o2o.com', password: 'password', role: 'Super Admin', status: 'Active', avatarUrl: 'https://placehold.co/40x40.png' },
    { id: 'user-1682600000002', name: 'SK Associates', email: 'lawyer@sk.com', password: 'password', role: 'Lawyer', status: 'Active', avatarUrl: 'https://placehold.co/40x40.png' },
    { id: 'user-1682600000003', name: 'Greenfield Corp', email: 'client@greenfield.com', password: 'password', role: 'Client', status: 'Active' },
    { id: 'user-1682600000004', name: 'Land Investors Inc.', email: 'investor@land.com', password: 'password', role: 'Investor', status: 'Inactive'},
    { id: 'user-1682600000005', name: 'Property Aggregators', email: 'aggregator@prop.com', password: 'password', role: 'Aggregator', status: 'Active' },
];

const initialProjects: Project[] = [
    {
        id: 'proj-1700000000000',
        name: 'Greenfield Valley',
        siteId: 'GV-001',
        location: 'Coimbatore',
    }
];


export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectSiteId, setNewProjectSiteId] = useState('');
  const [newProjectLocation, setNewProjectLocation] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    try {
      const savedVersion = localStorage.getItem(DATA_VERSION_KEY);
      if (savedVersion !== DATA_VERSION) {
          const theme = localStorage.getItem('theme');
          localStorage.clear();
          if (theme) localStorage.setItem('theme', theme);
          localStorage.setItem(DATA_VERSION_KEY, DATA_VERSION);
      }

      // Initialize users if they don't exist
      let users: User[];
      const savedUsers = localStorage.getItem(USERS_STORAGE_KEY);
      if (!savedUsers) {
        users = initialUsers;
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
      } else {
        users = JSON.parse(savedUsers);
      }
      
      const user = users.length > 0 ? users[0] : null;
      setCurrentUser(user);

      // Initialize projects if they don't exist
      let allProjects: Project[];
      const savedProjects = localStorage.getItem(PROJECTS_STORAGE_KEY);
      if (!savedProjects) {
          allProjects = initialProjects;
          localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(allProjects));
      } else {
        allProjects = JSON.parse(savedProjects);
      }
      
      if (user && user.role !== 'Super Admin') {
        const assignedProjects = allProjects.filter(p => user.projectIds?.includes(p.id));
        setProjects(assignedProjects);
      } else {
        setProjects(allProjects);
      }
    } catch (e) {
      console.error("Could not load data from local storage", e);
    }
    setIsLoaded(true);
  }, []);

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName || !newProjectSiteId || !newProjectLocation) return;
    const newProject: Project = {
      id: `proj-${Date.now()}`,
      name: newProjectName,
      siteId: newProjectSiteId,
      location: newProjectLocation,
    };
    const updatedProjects = [...projects, newProject];
    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(updatedProjects));
    setProjects(updatedProjects);
    setNewProjectName('');
    setNewProjectSiteId('');
    setNewProjectLocation('');
    setIsDialogOpen(false);
  };
  
  if (!isLoaded) {
    return (
        <div className="flex justify-center items-center h-screen">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">Manage your projects and sites.</p>
        </div>
        {currentUser?.role === 'Super Admin' && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add New Project
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                <DialogTitle>Add New Project</DialogTitle>
                <DialogDescription>
                    Enter the details for your new project. Click save when you're done.
                </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddProject}>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">Name</Label>
                    <Input id="name" value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)} className="col-span-3" placeholder="e.g., Greenfield Valley" required />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="siteId" className="text-right">Site ID</Label>
                    <Input id="siteId" value={newProjectSiteId} onChange={(e) => setNewProjectSiteId(e.target.value)} className="col-span-3" placeholder="e.g., GV-001" required />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="location" className="text-right">Location</Label>
                    <Input id="location" value={newProjectLocation} onChange={(e) => setNewProjectLocation(e.target.value)} className="col-span-3" placeholder="e.g., Coimbatore" required />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit">Save Project</Button>
                </DialogFooter>
                </form>
            </DialogContent>
            </Dialog>
        )}
      </header>
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.length > 0 ? (
          projects.map((project) => (
            <Card key={project.id}>
              <CardHeader>
                <CardTitle>{project.name}</CardTitle>
                <CardDescription>{project.siteId} - {project.location}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Click to view details about the lineage and transaction history for this site.</p>
              </CardContent>
              <CardFooter>
                <Button asChild variant="outline" className="w-full">
                  <Link href={`/projects/${project.id}`}>
                    View Project <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <Card className="md:col-span-2 lg:col-span-3">
            <CardContent className="flex h-40 flex-col items-center justify-center p-6 text-center">
              <h3 className="text-lg font-semibold">No Projects Yet</h3>
              <p className="text-muted-foreground mt-1">
                {currentUser?.role === 'Super Admin' ? 'Click "Add New Project" to get started.' : 'You have not been assigned to any projects.'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
