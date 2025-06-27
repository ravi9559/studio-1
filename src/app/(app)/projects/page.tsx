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

const USERS_STORAGE_KEY = 'users';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectSiteId, setNewProjectSiteId] = useState('');
  const [newProjectLocation, setNewProjectLocation] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Load projects and current user from localStorage on initial client-side render
  useEffect(() => {
    try {
      // Load current user (assuming first user is the logged-in user)
      const savedUsers = localStorage.getItem(USERS_STORAGE_KEY);
      const users: User[] = savedUsers ? JSON.parse(savedUsers) : [];
      const user = users.length > 0 ? users[0] : null;
      setCurrentUser(user);

      // Load all projects
      const savedProjects = localStorage.getItem('projects');
      const allProjects: Project[] = savedProjects ? JSON.parse(savedProjects) : [];

      // Filter projects based on user role and assignments
      if (user && user.role !== 'Super Admin') {
        const assignedProjects = allProjects.filter(p => user.projectIds?.includes(p.id));
        setProjects(assignedProjects);
      } else {
        // Super Admin sees all projects
        setProjects(allProjects);
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
            // We read all projects and only write back the full list if a new one is added
            // to avoid overwriting the master list with a filtered list.
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

    // When adding a new project, we need to update the master list in localStorage
    try {
        const savedProjects = localStorage.getItem('projects');
        const allProjects: Project[] = savedProjects ? JSON.parse(savedProjects) : [];
        const updatedProjects = [...allProjects, newProject];
        localStorage.setItem('projects', JSON.stringify(updatedProjects));
        
        // Update the component's state as well
        setProjects(prevProjects => [...prevProjects, newProject]);

    } catch (error) {
        console.error("Failed to add project", error);
    }
    
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
