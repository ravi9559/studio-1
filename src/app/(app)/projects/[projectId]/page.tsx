
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { LineageView } from "@/components/lineage/lineage-view";
import { ArrowLeft, Loader2, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';
import type { Project, Person, Folder, DocumentFile, FinancialTransaction, User } from '@/types';
import { initializeNewProjectData, createDefaultFolders } from '@/lib/project-template';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TitleDocumentsView } from '@/components/documents/title-documents-view';
import { TransactionHistory } from '@/components/transactions/transaction-history';
import { Notes } from '@/components/project/notes';
import { LegalNotes } from '@/components/project/legal-notes';
import { DocumentCollectionStatusView } from '@/components/aggregation/document-collection-status-view';
import { SiteSketchManager } from '@/components/project/site-sketch-manager';

// --- Storage Keys ---
const PROJECTS_STORAGE_KEY = 'projects';

// --- Main Page Component ---
export default function ProjectDetailsPage() {
    const params = useParams();
    const projectId = params.projectId as string;
    const { toast } = useToast();
    const router = useRouter();

    const [project, setProject] = useState<Project | null>(null);
    const [owners, setOwners] = useState<Person[]>([]);
    const [folders, setFolders] = useState<Folder[]>([]);
    const [financialTransactions, setFinancialTransactions] = useState<FinancialTransaction[]>([]);
    const [loading, setLoading] = useState(true);
    
    const [isEditProjectDialogOpen, setIsEditProjectDialogOpen] = useState(false);
    const [editedProjectName, setEditedProjectName] = useState('');
    const [editedProjectSiteId, setEditedProjectSiteId] = useState('');
    const [editedProjectLocation, setEditedProjectLocation] = useState('');
    const [editedGoogleMapsLink, setEditedGoogleMapsLink] = useState('');

    const ownersStorageKey = useMemo(() => `lineage-data-${projectId}`, [projectId]);
    const folderStorageKey = useMemo(() => `document-folders-${projectId}`, [projectId]);
    const financialTransactionsStorageKey = useMemo(() => `financial-transactions-${projectId}`, [projectId]);

    // Simplified for single-user app, we can assume a default user or remove checks
    const currentUser: User = {};

    // --- Data Loading and Initialization ---
    useEffect(() => {
        if (!projectId) return;
        setLoading(true);

        try {
            // --- Load Project ---
            const savedProjects = localStorage.getItem(PROJECTS_STORAGE_KEY);
            if (!savedProjects) {
                 setProject(null);
                 setLoading(false);
                 return;
            }
            const allProjects: Project[] = JSON.parse(savedProjects);
            
            // Find the current project
            const currentProject = allProjects.find(p => p.id === projectId);
            if (currentProject) {
                setProject(currentProject);
                setEditedProjectName(currentProject.name);
                setEditedProjectSiteId(currentProject.siteId);
                setEditedProjectLocation(currentProject.location);
                setEditedGoogleMapsLink(currentProject.googleMapsLink || '');
            } else {
                setProject(null);
                setLoading(false);
                return;
            }

            // --- Load or Regenerate Project-Specific Data ---
            let loadedOwners = JSON.parse(localStorage.getItem(ownersStorageKey) || 'null');
            let loadedFolders = JSON.parse(localStorage.getItem(folderStorageKey) || 'null');
            let loadedFinancials = JSON.parse(localStorage.getItem(financialTransactionsStorageKey) || '[]');
            
            if (!loadedOwners) {
                initializeNewProjectData(projectId);
                loadedOwners = JSON.parse(localStorage.getItem(ownersStorageKey) || '[]');
                loadedFolders = JSON.parse(localStorage.getItem(folderStorageKey) || '[]');
                loadedFinancials = JSON.parse(localStorage.getItem(financialTransactionsStorageKey) || '[]');
            }
            
            setOwners(loadedOwners);
            setFolders(loadedFolders);
            setFinancialTransactions(loadedFinancials);

        } catch (e) {
            console.error("Could not load project data", e);
            toast({ variant: 'destructive', title: 'Error Loading Data', description: 'There was a problem initializing project data.' });
        }
        setLoading(false);
    }, [projectId, ownersStorageKey, folderStorageKey, financialTransactionsStorageKey, toast]);

    const allSurveyRecords = useMemo(() => {
        const records: { ownerName: string, ownerId: string, surveyNumber: string, acres: string, cents: string }[] = [];
        const collect = (person: Person) => {
            person.landRecords.forEach(lr => {
                records.push({
                    ownerName: person.name,
                    ownerId: person.id,
                    surveyNumber: lr.surveyNumber,
                    acres: lr.acres,
                    cents: lr.cents,
                });
            });
            person.heirs.forEach(collect);
        };
        owners.forEach(collect);
        return records;
    }, [owners]);

    const updateAndPersistOwners = useCallback((newOwners: Person[]) => {
        setOwners(newOwners);
        localStorage.setItem(ownersStorageKey, JSON.stringify(newOwners));
    }, [ownersStorageKey]);
    
    const updateAndPersistFinancials = useCallback((newFinancials: FinancialTransaction[]) => {
        setFinancialTransactions(newFinancials);
        localStorage.setItem(financialTransactionsStorageKey, JSON.stringify(newFinancials));
    }, [financialTransactionsStorageKey]);

    useEffect(() => {
        if (owners && owners.length > 0) {
            setFolders(currentFolders => {
                const newFolders = createDefaultFolders(owners, currentFolders);
                if (JSON.stringify(newFolders) !== JSON.stringify(currentFolders)) {
                    localStorage.setItem(folderStorageKey, JSON.stringify(newFolders));
                    return newFolders;
                }
                return currentFolders;
            });
        }
    }, [owners, folderStorageKey]);
    
    const handleUpdateProject = (e: React.FormEvent) => {
        e.preventDefault();
        if (!project || !editedProjectName || !editedProjectSiteId || !editedProjectLocation) return;
        const updatedProjectData: Project = { ...project, name: editedProjectName, siteId: editedProjectSiteId, location: editedProjectLocation, googleMapsLink: editedGoogleMapsLink };
        try {
            const projects: Project[] = JSON.parse(localStorage.getItem(PROJECTS_STORAGE_KEY) || '[]');
            const updatedProjects = projects.map(p => p.id === projectId ? updatedProjectData : p);
            localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(updatedProjects));
            setProject(updatedProjectData);
            setIsEditProjectDialogOpen(false);
            toast({ title: 'Project Updated', description: 'The project details have been successfully saved.' });
        } catch (error) {
            console.error("Failed to update project", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to update project details.' });
        }
    };

    const handleDeleteProject = () => {
        if (!project) return;
        
        try {
            // 1. Remove the main project entry
            const projects: Project[] = JSON.parse(localStorage.getItem(PROJECTS_STORAGE_KEY) || '[]');
            const updatedProjects = projects.filter(p => p.id !== projectId);
            localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(updatedProjects));

            // 2. Remove all associated project-specific data
            localStorage.removeItem(ownersStorageKey);
            localStorage.removeItem(folderStorageKey);
            localStorage.removeItem(`acquisition-status-${projectId}`);
            localStorage.removeItem(`transactions-${projectId}`);
            localStorage.removeItem(financialTransactionsStorageKey);
            localStorage.removeItem(`files-${projectId}`);
            localStorage.removeItem(`site-sketch-${projectId}`);

            // 3. Remove item-specific data (notes, tasks, etc.)
            allSurveyRecords.forEach(record => {
                localStorage.removeItem(`notes-${projectId}-${record.surveyNumber}`);
                localStorage.removeItem(`legal-notes-${projectId}-${record.surveyNumber}`);
                localStorage.removeItem(`aggregation-${projectId}-${record.surveyNumber}`);
            });

            toast({
                title: "Project Deleted",
                description: `The project "${project.name}" and all its data have been removed.`,
            });
            router.push('/dashboard');
        } catch (error) {
            console.error("Failed to delete project", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete project.' });
        }
    };

    const handleAddFamilyHead = useCallback((personData: Omit<Person, 'id' | 'heirs' | 'landRecords'>) => {
        const newFamilyHead: Person = { ...personData, id: `owner-${Date.now()}`, heirs: [], landRecords: [] };
        const newOwners = [...owners, newFamilyHead];
        updateAndPersistOwners(newOwners);
        toast({ title: "Family Head Added", description: `${newFamilyHead.name} has been added.` });
    }, [owners, updateAndPersistOwners, toast]);
    
    const handleAddHeir = useCallback((parentId: string, heirData: Omit<Person, 'id' | 'heirs' | 'landRecords'>) => {
        const newOwners = JSON.parse(JSON.stringify(owners));
        const addHeirRecursive = (person: Person): boolean => {
            if (person.id === parentId) {
                person.heirs.push({ ...heirData, id: `heir-${parentId}-${Date.now()}`, landRecords: [], heirs: [] });
                return true;
            }
            return person.heirs.some(addHeirRecursive);
        };
        if (newOwners.some(addHeirRecursive)) {
            updateAndPersistOwners(newOwners);
            toast({ title: 'Heir Added' });
        }
    }, [owners, updateAndPersistOwners, toast]);

    const handleUpdatePerson = useCallback((personId: string, personData: Omit<Person, 'id' | 'heirs'>) => {
        const newOwners = JSON.parse(JSON.stringify(owners));
        const updatePersonRecursive = (person: Person): boolean => {
            if (person.id === personId) {
                Object.assign(person, personData);
                return true;
            }
            return person.heirs.some(updatePersonRecursive);
        };
        if (newOwners.some(updatePersonRecursive)) {
             updateAndPersistOwners(newOwners);
             toast({ title: 'Record Updated' });
        }
    }, [owners, updateAndPersistOwners, toast]);

    const handleAddFolder = useCallback((parentId: string, name: string) => {
        const newFolder: Folder = { id: `folder-${Date.now()}`, name, children: [], files: [] };
        const addRecursive = (nodes: Folder[]): Folder[] => nodes.map(node => {
            if (node.id === parentId) return { ...node, children: [...node.children, newFolder] };
            return { ...node, children: addRecursive(node.children) };
        });
        const updatedFolders = parentId === 'root' ? [...folders, newFolder] : addRecursive(folders);
        setFolders(updatedFolders);
        localStorage.setItem(folderStorageKey, JSON.stringify(updatedFolders));
    }, [folders, folderStorageKey]);

    const handleDeleteFolder = useCallback((folderId: string) => {
        const deleteRecursive = (nodes: Folder[]): Folder[] => nodes
            .filter(node => node.id !== folderId)
            .map(node => ({ ...node, children: deleteRecursive(node.children) }));
        const updatedFolders = deleteRecursive(folders);
        setFolders(updatedFolders);
        localStorage.setItem(folderStorageKey, JSON.stringify(updatedFolders));
    }, [folders, folderStorageKey]);

    const handleAddFileToFolder = useCallback((folderId: string, fileData: Omit<DocumentFile, 'id'>) => {
        const newFile: DocumentFile = { id: `file-${Date.now()}`, ...fileData };
        const addFileRecursive = (nodes: Folder[]): Folder[] => nodes.map(node => {
            if (node.id === folderId) return { ...node, files: [...(node.files || []), newFile] };
            return { ...node, children: addFileRecursive(node.children) };
        });
        const updatedFolders = addFileRecursive(folders);
        setFolders(updatedFolders);
        localStorage.setItem(folderStorageKey, JSON.stringify(updatedFolders));
        toast({ title: "File Uploaded" });
    }, [folders, folderStorageKey, toast]);

    const handleDeleteFileFromFolder = useCallback((folderId: string, fileId: string) => {
        const deleteFileRecursive = (nodes: Folder[]): Folder[] => nodes.map(node => {
            if (node.id === folderId) return { ...node, files: (node.files || []).filter(f => f.id !== fileId) };
            return { ...node, children: deleteFileRecursive(node.children) };
        });
        const updatedFolders = deleteFileRecursive(folders);
        setFolders(updatedFolders);
        localStorage.setItem(folderStorageKey, JSON.stringify(updatedFolders));
        toast({ title: "File Deleted" });
    }, [folders, folderStorageKey, toast]);

    if (loading) return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>;

    if (!project) {
        return (
            <div className="p-8 text-center">
                <h1 className="text-2xl font-bold mb-4">Project not found</h1>
                <Button variant="outline" asChild className="mt-4"><Link href="/dashboard"><ArrowLeft className="mr-2 h-4 w-4" />Back to Projects</Link></Button>
            </div>
        )
    }
    
    const surveyNumbers = allSurveyRecords.map(r => r.surveyNumber);

    return (
        <div className="relative">
            <div className="p-4 sm:p-6 lg:p-8 space-y-4">
                <header className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
                        <p className="text-muted-foreground">Site ID: {project.siteId} &middot; {project.location}</p>
                    </div>
                    
                    <Dialog open={isEditProjectDialogOpen} onOpenChange={setIsEditProjectDialogOpen}>
                        <DialogTrigger asChild><Button variant="outline"><Edit className="mr-2 h-4 w-4" />Edit Project</Button></DialogTrigger>
                        <DialogContent className="sm:max-w-xl">
                            <DialogHeader><DialogTitle>Edit Project Details</DialogTitle></DialogHeader>
                            <form onSubmit={handleUpdateProject} className="space-y-4">
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="edit-name" className="text-right">Name</Label><Input id="edit-name" value={editedProjectName} onChange={(e) => setEditedProjectName(e.target.value)} className="col-span-3" required /></div>
                                    <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="edit-siteId" className="text-right">Site ID</Label><Input id="edit-siteId" value={editedProjectSiteId} onChange={(e) => setEditedProjectSiteId(e.target.value)} className="col-span-3" required /></div>
                                    <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="edit-location" className="text-right">Location</Label><Input id="edit-location" value={editedProjectLocation} onChange={(e) => setEditedProjectLocation(e.target.value)} className="col-span-3" required /></div>
                                    <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="edit-googleMapsLink" className="text-right">Map Link</Label><Input id="edit-googleMapsLink" value={editedGoogleMapsLink} onChange={(e) => setEditedGoogleMapsLink(e.target.value)} className="col-span-3" /></div>
                                </div>
                                <DialogFooter><Button type="submit">Save Changes</Button></DialogFooter>
                            </form>
                            <Separator />
                            <div className="space-y-2">
                                <Label className="font-semibold text-destructive">Danger Zone</Label>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild><Button variant="destructive" className="w-full"><Trash2 className="mr-2 h-4 w-4" />Delete Project</Button></AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete the project "{project.name}".</AlertDialogDescription></AlertDialogHeader>
                                        <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction className="bg-destructive" onClick={handleDeleteProject}>Yes, delete</AlertDialogAction></AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </DialogContent>
                    </Dialog>
                    
                </header>

                <Tabs defaultValue="lineage" className="w-full">
                    <TabsList>
                        <TabsTrigger value="lineage">Family Lineage</TabsTrigger>
                        <TabsTrigger value="documents">Title Documents</TabsTrigger>
                        <TabsTrigger value="transactions">Transaction History</TabsTrigger>
                        <TabsTrigger value="sketch">Site Sketch</TabsTrigger>
                        <TabsTrigger value="collection">Document Collection Status</TabsTrigger>
                        <TabsTrigger value="notes">Notes</TabsTrigger>
                        <TabsTrigger value="legal">Legal Notes</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="lineage" className="pt-4">
                        <LineageView 
                            familyHeads={owners} 
                            onAddHeir={handleAddHeir} 
                            onUpdatePerson={handleUpdatePerson} 
                            onAddFamilyHead={handleAddFamilyHead}
                            onImportSuccess={updateAndPersistOwners}
                            projectId={projectId} 
                            folders={folders}
                            onAddFolder={handleAddFolder}
                            onDeleteFolder={handleDeleteFolder}
                            onAddFile={handleAddFileToFolder}
                            onDeleteFile={handleDeleteFileFromFolder}
                            currentUser={currentUser}
                        />
                    </TabsContent>
                    <TabsContent value="documents" className="pt-4">
                        <TitleDocumentsView 
                            folders={folders}
                            onAddFolder={handleAddFolder}
                            onDeleteFolder={handleDeleteFolder}
                            onAddFile={handleAddFileToFolder}
                            onDeleteFile={handleDeleteFileFromFolder}
                            currentUser={currentUser}
                        />
                    </TabsContent>
                    <TabsContent value="transactions" className="pt-4">
                        <TransactionHistory projectId={projectId} currentUser={currentUser} />
                    </TabsContent>
                    <TabsContent value="sketch" className="pt-4">
                        <SiteSketchManager projectId={projectId} />
                    </TabsContent>
                    <TabsContent value="collection" className="pt-4">
                        <DocumentCollectionStatusView
                            projectId={projectId}
                            familyHeads={owners}
                            currentUser={currentUser}
                        />
                    </TabsContent>
                    <TabsContent value="notes" className="pt-4">
                        <Notes projectId={projectId} surveyNumbers={surveyNumbers} currentUser={currentUser} />
                    </TabsContent>
                     <TabsContent value="legal" className="pt-4">
                        <LegalNotes projectId={projectId} surveyNumbers={surveyNumbers} currentUser={currentUser} />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
