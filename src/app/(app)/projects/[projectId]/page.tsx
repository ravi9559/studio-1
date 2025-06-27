'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineageView } from "@/components/lineage/lineage-view";
import { TransactionHistory } from "@/components/transactions/transaction-history";
import { FileManager } from "@/components/files/file-manager";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// Define the type for a project
type Project = {
  id: string;
  name: string;
  siteId: string;
  location: string;
};

export default function ProjectDetailsPage({ params }: { params: { projectId: string } }) {
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedProjects = localStorage.getItem('projects');
        if (savedProjects) {
            const projects: Project[] = JSON.parse(savedProjects);
            const currentProject = projects.find(p => p.id === params.projectId);
            if (currentProject) {
                setProject(currentProject);
            }
        }
        setLoading(false);
    }, [params.projectId]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    if (!project) {
        return (
            <div className="p-4 sm:p-6 lg:p-8 text-center">
                <Button variant="ghost" asChild className="mb-4">
                    <Link href="/dashboard">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Dashboard
                    </Link>
                </Button>
                <h1 className="text-2xl font-bold">Project not found</h1>
                <p className="text-muted-foreground">The project you are looking for does not exist or has been deleted.</p>
            </div>
        )
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <header className="mb-6">
                <Button variant="ghost" asChild className="mb-4 -ml-4">
                    <Link href="/dashboard">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Dashboard
                    </Link>
                </Button>
                <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
                <p className="text-muted-foreground">{project.siteId} - {project.location}</p>
            </header>
            <Tabs defaultValue="lineage" className="w-full">
                <TabsList className="grid w-full grid-cols-3 md:w-auto md:inline-flex">
                    <TabsTrigger value="lineage">Family Lineage</TabsTrigger>
                    <TabsTrigger value="transactions">Transaction History</TabsTrigger>
                    <TabsTrigger value="files">Files &amp; Documents</TabsTrigger>
                </TabsList>
                <TabsContent value="lineage" className="mt-6">
                    <LineageView />
                </TabsContent>
                <TabsContent value="transactions" className="mt-6">
                    <TransactionHistory />
                </TabsContent>
                <TabsContent value="files" className="mt-6">
                    <FileManager />
                </TabsContent>
            </Tabs>
        </div>
    );
}
