
'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, ArrowRight } from "lucide-react";
import Link from 'next/link';
import type { Project, User } from '@/types';
import { Loader2 } from 'lucide-react';
import { initializeNewProjectData } from '@/lib/project-template';

const PROJECTS_STORAGE_KEY = 'projects';

const initialProjects: Project[] = [
    {
        id: 'proj-1700000000000',
        name: 'Greenfield Valley',
        siteId: 'GV-001',
        location: 'Coimbatore',
        googleMapsLink: 'https://maps.app.goo.gl/uJ5vG2BvX3Y8Z6aA6'
    }
];


export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    try {
      // Load current user
      const savedUser = localStorage.getItem('loggedInUser');
      const user: User | null = savedUser ? JSON.parse(savedUser) : null;
      setCurrentUser(user);

      // Load projects, creating initial if none exist
      let allProjects: Project[];
      const savedProjects = localStorage.getItem(PROJECTS_STORAGE_KEY);
      if (!savedProjects) {
          allProjects = initialProjects;
          localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(allProjects));
          // Initialize data for the default project
          initializeNewProjectData(initialProjects[0].id);
      } else {
        allProjects = JSON.parse(savedProjects);
      }
      
      // Filter projects based on user role/assignment
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
            <Button asChild>
              <Link href="/projects/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add New Project
              </Link>
            </Button>
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
