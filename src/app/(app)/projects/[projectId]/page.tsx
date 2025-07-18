
'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { LineageView } from "@/components/lineage/lineage-view";
import { ArrowLeft, Loader2, Edit, Trash2, Wallet } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';
import { AcquisitionTrackerView } from '@/components/acquisition/acquisition-tracker-view';
import type { User, Project, Person, Folder, AcquisitionStatus, DocumentFile, LandClassification, AggregationProgress, FinancialTransaction } from '@/types';
import { SiteSketchView } from '@/components/sketch/site-sketch-view';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
    const acquisitionTrackerRef = useRef<HTMLDivElement>(null);

    const [project, setProject] = useState<Project | null>(null);
    const [owners, setOwners] = useState<Person[]>([]);
    const [folders, setFolders] = useState<Folder[]>([]);
    const [acquisitionStatuses, setAcquisitionStatuses] = useState<AcquisitionStatus[]>([]);
    const [financialTransactions, setFinancialTransactions] = useState<FinancialTransaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    
    // --- Navigation State ---
    const [activeStatusId, setActiveStatusId] = useState<string | undefined>(undefined);
    
    const [isEditProjectDialogOpen, setIsEditProjectDialogOpen] = useState(false);
    const [editedProjectName, setEditedProjectName] = useState('');
    const [editedProjectSiteId, setEditedProjectSiteId] = useState('');
    const [editedProjectLocation, setEditedProjectLocation] = useState('');
    const [editedGoogleMapsLink, setEditedGoogleMapsLink] = useState('');

    const ownersStorageKey = useMemo(() => `lineage-data-${projectId}`, [projectId]);
    const folderStorageKey = useMemo(() => `document-folders-${projectId}`, [projectId]);
    const acquisitionStorageKey = useMemo(() => `acquisition-status-${projectId}`, [projectId]);
    const financialTransactionsStorageKey = useMemo(() => `financial-transactions-${projectId}`, [projectId]);


    // --- Data Loading and Initialization ---
    useEffect(() => {
        if (!projectId) return;
        setLoading(true);

        try {
            // --- Load Core Data (Users/Projects) ---
            const savedProjects = localStorage.getItem(PROJECTS_STORAGE_KEY);
            if (!savedProjects) {
                 setProject(null);
                 setLoading(false);
                 return;
            }
            const allProjects: Project[] = JSON.parse(savedProjects);
            
            const savedLoggedInUser = localStorage.getItem('loggedInUser');
            if (savedLoggedInUser) {
                setCurrentUser(JSON.parse(savedLoggedInUser));
            }


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
        const records: { ownerName: string, ownerId: string, surveyNumber: string, acres: string, cents: string, landClassification: LandClassification }[] = [];
        const collect = (person: Person) => {
            person.landRecords.forEach(lr => {
                records.push({
                    ownerName: person.name,
                    ownerId: person.id,
                    surveyNumber: lr.surveyNumber,
                    acres: lr.acres,
                    cents: lr.cents,
                    landClassification: lr.landClassification,
                });
            });
            person.heirs.forEach(collect);
        };
        owners.forEach(collect);
        return records;
    }, [owners]);
    
    useEffect(() => {
        if (loading || !owners) return;

        let existingStatuses: AcquisitionStatus[] = JSON.parse(localStorage.getItem(acquisitionStorageKey) || '[]');
        
        let changed = false;
        const surveyCounts: { [key: string]: number } = {};

        const updatedStatuses = allSurveyRecords.map((record) => {
            surveyCounts[record.surveyNumber] = (surveyCounts[record.surveyNumber] || 0) + 1;
            const id = `${projectId}-${record.surveyNumber}-${surveyCounts[record.surveyNumber] - 1}`;
            
            const existing = existingStatuses.find(s => s.surveyNumber === record.surveyNumber && s.familyHeadName === record.ownerName);

            if (existing) {
                 if(existing.familyHeadName !== record.ownerName || existing.extent.acres !== record.acres || existing.extent.cents !== record.cents || existing.landClassification !== record.landClassification || existing.familyHeadId !== record.ownerId) {
                    changed = true;
                    return { ...existing, familyHeadName: record.ownerName, familyHeadId: record.ownerId, extent: { acres: record.acres, cents: record.cents }, landClassification: record.landClassification };
                 }
                 return existing;
            } else {
                changed = true;
                return {
                    id,
                    projectId,
                    surveyNumber: record.surveyNumber,
                    familyHeadName: record.ownerName,
                    familyHeadId: record.ownerId,
                    extent: { acres: record.acres, cents: record.cents },
                    landClassification: record.landClassification,
                    legal: { overallStatus: 'Not Started' },
                };
            }
        });

        const validRecordIds = new Set(updatedStatuses.map(s => s.id));
        const filteredStatuses = existingStatuses.filter(s => validRecordIds.has(s.id));
        
        if (updatedStatuses.length !== filteredStatuses.length || JSON.stringify(updatedStatuses) !== JSON.stringify(filteredStatuses)) {
            changed = true;
        }

        if (changed) {
            localStorage.setItem(acquisitionStorageKey, JSON.stringify(updatedStatuses));
            setAcquisitionStatuses(updatedStatuses);
        } else {
            setAcquisitionStatuses(existingStatuses);
        }

        if (updatedStatuses.length > 0 && (!activeStatusId || !updatedStatuses.some(s => s.id === activeStatusId))) {
            setActiveStatusId(updatedStatuses[0].id);
        }
    }, [owners, projectId, acquisitionStorageKey, allSurveyRecords, loading, activeStatusId]);

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
            localStorage.removeItem(acquisitionStorageKey);
            localStorage.removeItem(`transactions-${projectId}`);
            localStorage.removeItem(financialTransactionsStorageKey);
            localStorage.removeItem(`files-${projectId}`);
            localStorage.removeItem(`site-sketch-${projectId}`); // Remove site sketch

            // 3. Remove item-specific data (notes, tasks, etc.) by iterating through survey numbers
            acquisitionStatuses.forEach(status => {
                localStorage.removeItem(`notes-${projectId}-${status.surveyNumber}`);
                localStorage.removeItem(`legal-notes-${projectId}-${status.surveyNumber}`);
                localStorage.removeItem(`legal-queries-${projectId}-${status.surveyNumber}`);
                localStorage.removeItem(`aggregation-${projectId}-${status.surveyNumber}`);
            });

            toast({
                title: "Project Deleted",
                description: `The project "${project.name}" and all its data have been removed.`,
            });

            // 4. Redirect to dashboard
            router.push('/dashboard');

        } catch (error) {
            console.error("Failed to delete project", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete project.' });
        }
    };


    const handleAddFamilyHead = useCallback((personData: Omit<Person, 'id' | 'heirs' | 'landRecords'>) => {
        const newFamilyHead: Person = {
            ...personData,
            id: `owner-${Date.now()}`,
            heirs: [],
            landRecords: [],
        };
        const newOwners = [...owners, newFamilyHead];
        updateAndPersistOwners(newOwners);
        toast({
            title: "Family Head Added",
            description: `${newFamilyHead.name} has been added to the lineage.`,
        });
    }, [owners, updateAndPersistOwners, toast]);
    
    const handleAddHeir = useCallback((parentId: string, heirData: Omit<Person, 'id' | 'heirs' | 'landRecords'>) => {
        const newOwners = JSON.parse(JSON.stringify(owners));
        let parentFound = false;

        const addHeirRecursive = (person: Person): boolean => {
            if (person.id === parentId) {
                const newHeir: Person = { ...heirData, id: `heir-${parentId}-${Date.now()}`, landRecords: [], heirs: [] };
                person.heirs.push(newHeir);
                return true;
            }
            for (const heir of person.heirs) { if (addHeirRecursive(heir)) return true; }
            return false;
        };

        for (const owner of newOwners) {
            if (addHeirRecursive(owner)) {
                parentFound = true;
                break;
            }
        }
        
        if (parentFound) {
            updateAndPersistOwners(newOwners);
            toast({ title: 'Heir Added', description: 'A new heir has been successfully added.' });
        }
    }, [owners, updateAndPersistOwners, toast]);

    const handleUpdatePerson = useCallback((personId: string, personData: Omit<Person, 'id' | 'heirs'>) => {
        const newOwners = JSON.parse(JSON.stringify(owners));
        let personFound = false;

        const updatePersonRecursive = (person: Person): boolean => {
            if (person.id === personId) {
                Object.assign(person, personData);
                return true;
            }
            for (const heir of person.heirs) { if (updatePersonRecursive(heir)) return true; }
            return false;
        };
        
        for (const owner of newOwners) {
            if (updatePersonRecursive(owner)) {
                personFound = true;
                break;
            }
        }
        if(personFound) {
             updateAndPersistOwners(newOwners);
             toast({ title: 'Record Updated', description: 'The person\'s details have been saved.' });
        }
    }, [owners, updateAndPersistOwners, toast]);

    const handleUpdateAcquisitionStatus = useCallback((updatedStatus: AcquisitionStatus) => {
        const newStatuses = acquisitionStatuses.map(status => status.id === updatedStatus.id ? updatedStatus : status);
        setAcquisitionStatuses(newStatuses);
        localStorage.setItem(acquisitionStorageKey, JSON.stringify(newStatuses));
    }, [acquisitionStatuses, acquisitionStorageKey]);

    const handleAddFolder = useCallback((parentId: string, name: string) => {
        const newFolder: Folder = { id: `folder-${Date.now()}`, name, children: [], files: [] };
        let updatedFolders;
        if (parentId === 'root') {
          updatedFolders = [...folders, newFolder];
        } else {
          const addRecursive = (nodes: Folder[]): Folder[] => nodes.map(node => {
              if (node.id === parentId) return { ...node, children: [...node.children, newFolder] };
              if (node.children.length > 0) return { ...node, children: addRecursive(node.children) };
              return node;
          });
          updatedFolders = addRecursive(folders);
        }
        setFolders(updatedFolders);
        localStorage.setItem(folderStorageKey, JSON.stringify(updatedFolders));
    }, [folders, folderStorageKey]);

    const handleDeleteFolder = useCallback((folderId: string) => {
        const deleteRecursive = (nodes: Folder[]): Folder[] => nodes.filter(node => node.id !== folderId).map(node => {
            if (node.children.length > 0) return { ...node, children: deleteRecursive(node.children) };
            return node;
        });
        const updatedFolders = deleteRecursive(folders);
        setFolders(updatedFolders);
        localStorage.setItem(folderStorageKey, JSON.stringify(updatedFolders));
    }, [folders, folderStorageKey]);

     const handleAddFileToFolder = useCallback((folderId: string, fileData: Omit<DocumentFile, 'id'>) => {
        const newFile: DocumentFile = { id: `file-${Date.now()}`, ...fileData };

        const addFileRecursive = (nodes: Folder[]): Folder[] => {
            return nodes.map(node => {
                if (node.id === folderId) {
                    return { ...node, files: [...(node.files || []), newFile] };
                }
                if (node.children?.length > 0) {
                    return { ...node, children: addFileRecursive(node.children) };
                }
                return node;
            });
        };
        
        const updatedFolders = addFileRecursive(folders);
        setFolders(updatedFolders);
        localStorage.setItem(folderStorageKey, JSON.stringify(updatedFolders));
        toast({ title: "File Uploaded", description: `Successfully added ${fileData.name}.` });
    }, [folders, folderStorageKey, toast]);

    const handleDeleteFileFromFolder = useCallback((folderId: string, fileId: string) => {
        const deleteFileRecursive = (nodes: Folder[]): Folder[] => {
            return nodes.map(node => {
                if (node.id === folderId) {
                    const updatedFiles = (node.files || []).filter(file => file.id !== fileId);
                    return { ...node, files: updatedFiles };
                }
                if (node.children?.length > 0) {
                    return { ...node, children: deleteFileRecursive(node.children) };
                }
                return node;
            });
        };
        
        const updatedFolders = deleteFileRecursive(folders);
        setFolders(updatedFolders);
        localStorage.setItem(folderStorageKey, JSON.stringify(updatedFolders));
        toast({ title: "File Deleted", description: "The file record has been removed." });
    }, [folders, folderStorageKey, toast]);


    const handleSelectSurvey = useCallback((statusId: string) => { 
        setActiveStatusId(statusId);
        acquisitionTrackerRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    const currentUserRole = currentUser?.role;

    const advancePaymentPercentage = useMemo(() => {
        if (acquisitionStatuses.length === 0 || owners.length === 0) {
            return 0;
        }

        const familyHeadsWithAdvance = new Set<string>();
        financialTransactions.forEach(tx => {
            if (tx.purpose === 'Token Advance') {
                familyHeadsWithAdvance.add(tx.familyHeadId);
            }
        });
        
        if (familyHeadsWithAdvance.size === 0) {
            return 0;
        }

        let parcelsWithAdvancePaid = 0;
        acquisitionStatuses.forEach(status => {
            if (familyHeadsWithAdvance.has(status.familyHeadId)) {
                parcelsWithAdvancePaid++;
            }
        });
        
        return (parcelsWithAdvancePaid / acquisitionStatuses.length) * 100;

    }, [acquisitionStatuses, owners, financialTransactions]);


    if (loading) {
        return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>
    }

    if (!project) {
        return (
            <div className="p-4 sm:p-6 lg:p-8 text-center">
                <h1 className="text-2xl font-bold mb-4">Project not found</h1>
                <p className="text-muted-foreground">The project you are looking for does not exist.</p>
                 <Button variant="outline" asChild className="mt-4">
                    <Link href="/dashboard"><ArrowLeft className="mr-2 h-4 w-4" />Back to Projects</Link>
                </Button>
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
                    {currentUserRole === 'Super Admin' && (
                        <Dialog open={isEditProjectDialogOpen} onOpenChange={setIsEditProjectDialogOpen}>
                            <DialogTrigger asChild><Button variant="outline"><Edit className="mr-2 h-4 w-4" />Edit Project</Button></DialogTrigger>
                            <DialogContent className="sm:max-w-xl">
                                <DialogHeader><DialogTitle>Edit Project Details</DialogTitle><DialogDescription>Make changes to your project here. Click save when you're done.</DialogDescription></DialogHeader>
                                <form onSubmit={handleUpdateProject} className="space-y-4">
                                    <div className="grid gap-4 py-4">
                                        <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="edit-name" className="text-right">Name</Label><Input id="edit-name" value={editedProjectName} onChange={(e) => setEditedProjectName(e.target.value)} className="col-span-3" required /></div>
                                        <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="edit-siteId" className="text-right">Site ID</Label><Input id="edit-siteId" value={editedProjectSiteId} onChange={(e) => setEditedProjectSiteId(e.target.value)} className="col-span-3" required /></div>
                                        <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="edit-location" className="text-right">Location</Label><Input id="edit-location" value={editedProjectLocation} onChange={(e) => setEditedProjectLocation(e.target.value)} className="col-span-3" required /></div>
                                        <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="edit-googleMapsLink" className="text-right">Map Link</Label><Input id="edit-googleMapsLink" value={editedGoogleMapsLink} onChange={(e) => setEditedGoogleMapsLink(e.target.value)} className="col-span-3" placeholder="Google Maps URL..."/></div>
                                    </div>
                                    <DialogFooter><Button type="submit">Save Changes</Button></DialogFooter>
                                </form>
                                <Separator />
                                <div className="space-y-2">
                                    <Label className="font-semibold text-destructive">Danger Zone</Label>
                                    <p className="text-xs text-muted-foreground">Deleting a project is a permanent action and cannot be undone. This will remove all associated lineage, acquisition, and document data.</p>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="destructive" className="w-full">
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete Project
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This action cannot be undone. This will permanently delete the project
                                                    "{project.name}" and all of its associated data.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction
                                                    className="bg-destructive hover:bg-destructive/90"
                                                    onClick={handleDeleteProject}
                                                >
                                                    Yes, delete this project
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </DialogContent>
                        </Dialog>
                    )}
                </header>

                <Tabs defaultValue="lineage" className="w-full">
                    <TabsList className="flex-wrap h-auto">
                        <TabsTrigger value="lineage">Family Lineage</TabsTrigger>
                        <TabsTrigger value="documents">Title Documents</TabsTrigger>
                        <TabsTrigger value="transactions">Transaction History</TabsTrigger>
                        <TabsTrigger value="sketch">Site Sketch</TabsTrigger>
                        {currentUserRole !== 'Lawyer' && <TabsTrigger value="acquisition">Acquisition Dashboard</TabsTrigger>}
                        {(currentUserRole === 'Super Admin' || currentUserRole === 'Aggregator' || currentUserRole === 'Lawyer') && <TabsTrigger value="collection">Document Collection Status</TabsTrigger>}
                        <TabsTrigger value="notes">Notes</TabsTrigger>
                        {currentUserRole !== 'Aggregator' && <TabsTrigger value="legal">Legal Notes</TabsTrigger>}
                    </TabsList>
                    
                    <TabsContent value="lineage" className="pt-4">
                        <LineageView 
                            familyHeads={owners} 
                            financialTransactions={financialTransactions}
                            onAddHeir={handleAddHeir} 
                            onUpdatePerson={handleUpdatePerson} 
                            onAddFamilyHead={handleAddFamilyHead}
                            onImportSuccess={(newOwners) => updateAndPersistOwners(newOwners)}
                            onFinancialTransactionsUpdate={updateAndPersistFinancials}
                            projectId={projectId} 
                            currentUser={currentUser}
                            folders={folders}
                            onAddFolder={handleAddFolder}
                            onDeleteFolder={handleDeleteFolder}
                            onAddFile={handleAddFileToFolder}
                            onDeleteFile={handleDeleteFileFromFolder}
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
                    {currentUserRole !== 'Lawyer' && (
                        <TabsContent value="acquisition" className="pt-4">
                             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">
                                            Advance Payments (%)
                                        </CardTitle>
                                        <Wallet className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">
                                            {advancePaymentPercentage.toFixed(1)}%
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Percentage of land parcels where an advance has been paid
                                        </p>
                                    </CardContent>
                                </Card>
                             </div>
                             <SiteSketchView 
                                acquisitionStatuses={acquisitionStatuses} 
                                financialTransactions={financialTransactions}
                                onSelectSurvey={handleSelectSurvey} 
                            />
                            <div className="mt-6" ref={acquisitionTrackerRef}>
                               <AcquisitionTrackerView 
                                statuses={acquisitionStatuses} 
                                familyHeads={owners}
                                onUpdateStatus={handleUpdateAcquisitionStatus} 
                                activeStatusId={activeStatusId} 
                                onActiveStatusChange={setActiveStatusId}
                                currentUser={currentUser}
                               />
                            </div>
                        </TabsContent>
                    )}
                     {(currentUserRole === 'Super Admin' || currentUserRole === 'Aggregator' || currentUserRole === 'Lawyer') && (
                        <TabsContent value="collection" className="pt-4">
                            <DocumentCollectionStatusView
                                projectId={projectId}
                                familyHeads={owners}
                                currentUser={currentUser}
                            />
                        </TabsContent>
                    )}
                    <TabsContent value="notes" className="pt-4">
                        <Notes projectId={projectId} surveyNumbers={surveyNumbers} currentUser={currentUser} />
                    </TabsContent>
                    {currentUserRole !== 'Aggregator' && (
                        <TabsContent value="legal" className="pt-4">
                            <LegalNotes projectId={projectId} surveyNumbers={surveyNumbers} currentUser={currentUser} />
                        </TabsContent>
                    )}
                </Tabs>
            </div>
        </div>
    );
}
