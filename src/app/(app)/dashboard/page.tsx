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

// Copied from users/page.tsx to ensure data can be initialized without login
const initialUsers: User[] = [
    { id: 'user-1682600000001', name: 'O2O Technologies', email: 'admin@o2o.com', password: 'password', role: 'Super Admin', status: 'Active', avatarUrl: 'https://placehold.co/40x40.png' },
    { id: 'user-1682600000002', name: 'SK Associates', email: 'lawyer@sk.com', password: 'password', role: 'Lawyer', status: 'Active', avatarUrl: 'https://placehold.co/40x40.png' },
    { id: 'user-1682600000003', name: 'Greenfield Corp', email: 'client@greenfield.com', password: 'password', role: 'Client', status: 'Active' },
    { id: 'user-1682600000004', name: 'Land Investors Inc.', email: 'investor@land.com', password: 'password', role: 'Investor', status: 'Inactive'},
    { id: 'user-1682600000005', name: 'Property Aggregators', email: 'aggregator@prop.com', password: 'password', role: 'Aggregator', status: 'Active' },
];
const USERS_STORAGE_KEY = 'users';

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectSiteId, setNewProjectSiteId] = useState('');
  const [newProjectLocation, setNewProjectLocation] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load projects from localStorage on initial client-side render
  useEffect(() => {
    // Initialize users if they don't exist, so app can function without login
    try {
        const savedUsers = localStorage.getItem(USERS_STORAGE_KEY);
        if (!savedUsers) {
            localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(initialUsers));
        }
    } catch (e) {
        console.error("Could not initialize users", e);
    }
    
    try {
      const savedProjects = localStorage.getItem('projects');
      if (savedProjects) {
        setProjects(JSON.parse(savedProjects));
      }
    } catch (e) {
      console.error("Could not load projects from local storage", e);
    }
    setIsLoaded(true); // Mark as loaded after attempting to load
  }, []);

  // Save projects to localStorage whenever the projects state changes, but only after initial load.
  useEffect(() => {
    if (isLoaded) {
        try {
            localStorage.setItem('projects', JSON.stringify(projects));
        } catch (e) {
            console.error("Could not save projects to local storage", e);
        }
    }
  }, [projects, isLoaded]);


  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newProjectName || !newProjectSiteId || !newProjectLocation) {
        // Simple validation
        return;
    }

    const newProject: Project = {
      id: `proj-${Date.now()}`, // Simple unique ID for now
      name: newProjectName,
      siteId: newProjectSiteId,
      location: newProjectLocation,
    };

    setProjects(prevProjects => [...prevProjects, newProject]);
    
    // Reset form and close dialog
    setNewProjectName('');
    setNewProjectSiteId('');
    setNewProjectLocation('');
    setIsDialogOpen(false);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">Manage your projects and sites.</p>
        </div>
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
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    className="col-span-3"
                    placeholder="e.g., Greenfield Valley"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="siteId" className="text-right">
                    Site ID
                  </Label>
                  <Input
                    id="siteId"
                    value={newProjectSiteId}
                    onChange={(e) => setNewProjectSiteId(e.target.value)}
                    className="col-span-3"
                    placeholder="e.g., GV-001"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="location" className="text-right">
                    Location
                  </Label>
                  <Input
                    id="location"
                    value={newProjectLocation}
                    onChange={(e) => setNewProjectLocation(e.target.value)}
                    className="col-span-3"
                    placeholder="e.g., Coimbatore"
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Save Project</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
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
              <p className="text-muted-foreground mt-1">Click "Add New Project" to get started.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
