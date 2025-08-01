'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, ArrowRight, Loader2 } from "lucide-react";
import Link from 'next/link';
import type { Project } from '@/types'; // Import Project type

// Firestore imports
import { collection, getDocs, query, orderBy } from 'firebase/firestore'; // Import Firestore functions
import { useAuth } from '@/context/auth-context'; // Import useAuth to get the db instance
import { useToast } from '@/hooks/use-toast'; // Import useToast for error messages

// Removed: const PROJECTS_STORAGE_KEY = 'projects'; // No longer needed for local storage
// Removed: const initialProjects: Project[] = [...]; // No longer needed as data comes from Firestore

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const { db } = useAuth(); // Access the Firestore db instance
  const { toast } = useToast();

  useEffect(() => {
    const fetchProjects = async () => {
      if (!db) {
        setIsLoaded(true); // Stop loading if db is not initialized
        toast({
          title: "Error",
          description: "Firestore database is not initialized. Please ensure you are logged in.",
          variant: "destructive",
        });
        return;
      }

      setIsLoaded(false); // Set to false before fetching to show loader
      try {
        // Create a query to order projects by 'createdAt' in descending order
        // This assumes you added a 'createdAt' field when saving the project in projects/new/page.tsx
        const projectsQuery = query(collection(db, "projects"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(projectsQuery); // Fetch documents from the "projects" collection
        
        const fetchedProjects: Project[] = [];
        querySnapshot.forEach((doc) => {
          // Explicitly cast the data to Project type and include the document ID
          fetchedProjects.push({ id: doc.id, ...doc.data() } as Project); //
        });
        setProjects(fetchedProjects);
      } catch (e) {
        console.error("Error fetching projects from Firestore:", e);
        toast({
          title: "Error",
          description: "Failed to load projects. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoaded(true); // Set to true after fetching (or error)
      }
    };

    fetchProjects();
  }, [db, toast]); // Re-run effect if 'db' or 'toast' instance changes

  if (!isLoaded) {
    return (
        <div className="flex justify-center items-center h-screen">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">Manage your projects and sites.</p>
        </div>
        <Button asChild>
          <Link href="/projects/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Project
          </Link>
        </Button>
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
                {/* You can add more project details here if desired, e.g., project.createdAt */}
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
                Click "Add New Project" to get started.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}