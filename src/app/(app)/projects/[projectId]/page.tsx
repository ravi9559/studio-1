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
import type { Project, Person, Folder, DocumentFile, FinancialTransaction } from '@/types';
import { initializeNewProjectData, createDefaultFolders } from '@/lib/project-template';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TitleDocumentsView } from '@/components/documents/title-documents-view';
import { TransactionHistory } from '@/components/transactions/transaction-history';
import { Notes } from '@/components/project/notes';
import { LegalNotes } from '@/components/project/legal-notes';
import { SiteSketchManager } from '@/components/project/site-sketch-manager';
import { AdvancePaymentGrid } from '@/components/transactions/advance-payment-grid';

// Firestore imports
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useAuth } from '@/context/auth-context';

// --- Main Page Component ---
export default function ProjectDetailsPage() {
    const params = useParams();
    const projectId = params.projectId as string;
    const { toast } = useToast();
    const router = useRouter();
    const { db } = useAuth(); // Get the Firestore instance

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

    // --- Data Loading from Firestore ---
    useEffect(() => {
        if (!projectId || !db) return;
        setLoading(true);
        const fetchProjectData = async () => {
            try {
                // Fetch the main project document
                const docRef = doc(db, "projects", projectId);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const projectData = { id: docSnap.id, ...docSnap.data() } as Project;
                    setProject(projectData);
                    setEditedProjectName(projectData.name);
                    setEditedProjectSiteId(projectData.siteId);
                    setEditedProjectLocation(projectData.location);
                    setEditedGoogleMapsLink(projectData.googleMapsLink || '');

                    // Extract nested data
                    const familyHead = projectData.familyHead;
                    setOwners([familyHead]); // Assume the entire lineage is nested under familyHead
                    setFolders(projectData.documentFolders);
                    setFinancialTransactions(projectData.financialTransactions || []);
                } else {
                    toast({ variant: 'destructive', title: 'Project Not Found', description: 'This project ID does not exist.' });
                    setProject(null);
                }
            } catch (e) {
                console.error("Error fetching project data:", e);
                toast({ variant: 'destructive', title: 'Error Loading Data', description: 'There was a problem loading project data from Firestore.' });
            } finally {
                setLoading(false);
            }
        };

        fetchProjectData();
    }, [projectId, db, toast]);

    // All other logic that relies on `owners` will now be triggered when the `setOwners` call in useEffect completes.
    // The `useEffect` that updates folders based on owners is now redundant because folders are loaded directly from the project doc.

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

    // --- Update Project Details in Firestore ---
    const handleUpdateProject = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!project || !db || !editedProjectName || !editedProjectSiteId || !editedProjectLocation) {
            toast({ variant: 'destructive', title: 'Error', description: 'Missing project details or Firestore not initialized.' });
            return;
        }

        setLoading(true);

        try {
            const docRef = doc(db, "projects", projectId);
            await updateDoc(docRef, {
                name: editedProjectName,
                siteId: editedProjectSiteId,
                location: editedProjectLocation,
                googleMapsLink: editedGoogleMapsLink
            });

            // Update local state to reflect the change
            setProject(prev => prev ? { ...prev, name: editedProjectName, siteId: editedProjectSiteId, location: editedProjectLocation, googleMapsLink: editedGoogleMapsLink } : null);
            setIsEditProjectDialogOpen(false);
            toast({ title: 'Project Updated', description: 'The project details have been successfully saved to Firestore.' });
        } catch (error) {
            console.error("Failed to update project in Firestore", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to update project details in Firestore.' });
        } finally {
            setLoading(false);
        }
    };
    
    // --- Delete Project from Firestore ---
    const handleDeleteProject = async () => {
        if (!project || !db) return;

        setLoading(true);

        try {
            const docRef = doc(db, "projects", projectId);
            await deleteDoc(docRef);

            toast({ title: "Project Deleted", description: `The project "${project.name}" has been removed from Firestore.`, });
            router.push('/dashboard');
        } catch (error) {
            console.error("Failed to delete project from Firestore", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete project from Firestore.' });
        } finally {
            setLoading(false);
        }
    };

    // Placeholder functions for now, these would need to be updated to use Firestore
    // For now, they will not save to the database. They will only update local state.
    const updateAndPersistOwners = useCallback((newOwners: Person[]) => {
        setOwners(newOwners);
        // TODO: Implement Firestore update here. Example:
        // const docRef = doc(db, "projects", projectId);
        // updateDoc(docRef, { familyHead: newOwners[0] });
    }, []);

    const updateAndPersistFinancials = useCallback((newFinancials: FinancialTransaction[]) => {
        setFinancialTransactions(newFinancials);
        // TODO: Implement Firestore update here. Example:
        // const docRef = doc(db, "projects", projectId);
        // updateDoc(docRef, { financialTransactions: newFinancials });
    }, []);
    
    // This useEffect is now redundant since folders are loaded from the project doc.
    // It's commented out to prevent unexpected behavior.
    /*
    useEffect(() => {
        if (owners && owners.length > 0) {
            setFolders(currentFolders => {
                const newFolders = createDefaultFolders(owners, currentFolders);
                if (JSON.stringify(newFolders) !== JSON.stringify(currentFolders)) {
                    // TODO: Update Firestore here as well
                    return newFolders;
                }
                return currentFolders;
            });
        }
    }, [owners]);
    */

    const handleAddFolder = useCallback((folderName: string, parentFolderId?: string) => {
        // TODO: Implement Firestore update logic
    }, [folders, projectId, db]);
    
    const handleDeleteFolder = useCallback((folderId: string) => {
        // TODO: Implement Firestore update logic
    }, [folders, projectId, db]);
    
    const handleAddFileToFolder = useCallback((folderId: string, file: DocumentFile) => {
        // TODO: Implement Firestore update logic
    }, [folders, projectId, db]);
    
    const handleDeleteFileFromFolder = useCallback((fileId: string, folderId: string) => {
        // TODO: Implement Firestore update logic
    }, [folders, projectId, db]);

    const surveyNumbers = useMemo(() => allSurveyRecords.map(r => r.surveyNumber), [allSurveyRecords]);

    if (!project && !loading) {
        return (
            <div className="p-4 sm:p-6 lg:p-8 text-center text-muted-foreground">
                <p>Project not found.</p>
                <Button asChild className="mt-4">
                    <Link href="/dashboard">Back to Dashboard</Link>
                </Button>
            </div>
        );
    }

    if (loading || !project) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }
    
    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <header className="mb-8 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Button variant="ghost" asChild><Link href="/dashboard"><ArrowLeft className="h-4 w-4" /></Link></Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
                        <p className="text-muted-foreground">{project.siteId} - {project.location}</p>
                    </div>
                </div>
                <div className="flex space-x-2">
                    <Dialog open={isEditProjectDialogOpen} onOpenChange={setIsEditProjectDialogOpen}>
                        <DialogTrigger asChild><Button variant="outline"><Edit className="mr-2 h-4 w-4" />Edit</Button></DialogTrigger>
                        <DialogContent>
                            <DialogHeader><DialogTitle>Edit Project Details</DialogTitle></DialogHeader>
                            <form onSubmit={handleUpdateProject} className="space-y-4 py-4">
                                <div className="space-y-2"><Label>Project Name</Label><Input value={editedProjectName} onChange={e => setEditedProjectName(e.target.value)} required /></div>
                                <div className="space-y-2"><Label>Site ID</Label><Input value={editedProjectSiteId} onChange={e => setEditedProjectSiteId(e.target.value)} required /></div>
                                <div className="space-y-2"><Label>Location</Label><Input value={editedProjectLocation} onChange={e => setEditedProjectLocation(e.target.value)} required /></div>
                                <div className="space-y-2"><Label>Google Maps Link</Label><Input value={editedGoogleMapsLink} onChange={e => setEditedGoogleMapsLink(e.target.value)} /></div>
                                <DialogFooter><Button type="submit">Save Changes</Button></DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                    
                    <AlertDialog>
                        <AlertDialogTrigger asChild><Button variant="destructive"><Trash2 className="mr-2 h-4 w-4" />Delete</Button></AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader><AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone. This will permanently delete your project and all associated data from the server.</AlertDialogDescription></AlertDialogHeader>
                            <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDeleteProject} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction></AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </header>

            <Tabs defaultValue="lineage" className="w-full">
                <TabsList className="grid w-full grid-cols-6">
                    <TabsTrigger value="lineage">Lineage</TabsTrigger>
                    <TabsTrigger value="payments">Payments</TabsTrigger>
                    <TabsTrigger value="documents">Documents</TabsTrigger>
                    <TabsTrigger value="transactions">History</TabsTrigger>
                    <TabsTrigger value="sketch">Site Sketch</TabsTrigger>
                    <TabsTrigger value="notes">Notes</TabsTrigger>
                </TabsList>
                <TabsContent value="lineage" className="pt-4">
                    {/* The LineageView component will need to be updated to pass a function that updates Firestore */}
                    <LineageView owners={owners} allSurveyRecords={allSurveyRecords} updateOwners={updateAndPersistOwners} />
                </TabsContent>
                <TabsContent value="payments" className="pt-4">
                    <AdvancePaymentGrid
                        familyHeads={owners}
                        financialTransactions={financialTransactions}
                        onUpdateFinancials={updateAndPersistFinancials}
                    />
                </TabsContent>
                <TabsContent value="documents" className="pt-4">
                    <TitleDocumentsView
                        folders={folders}
                        onAddFolder={handleAddFolder}
                        onDeleteFolder={handleDeleteFolder}
                        onAddFile={handleAddFileToFolder}
                        onDeleteFile={handleDeleteFileFromFolder}
                    />
                </TabsContent>
                <TabsContent value="transactions" className="pt-4">
                    <TransactionHistory projectId={projectId} />
                </TabsContent>
                <TabsContent value="sketch" className="pt-4">
                    <SiteSketchManager projectId={projectId} />
                </TabsContent>
                <TabsContent value="notes" className="pt-4">
                    <Notes projectId={projectId} surveyNumbers={surveyNumbers} />
                </TabsContent>
                 <TabsContent value="legal" className="pt-4">
                    <LegalNotes projectId={projectId} surveyNumbers={surveyNumbers} />
                </TabsContent>
            </Tabs>
        </div>
    );
}