
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineageView } from "@/components/lineage/lineage-view";
import { TransactionHistory } from "@/components/transactions/transaction-history";
import { FileManager } from "@/components/files/file-manager";
import { ArrowLeft, Loader2, Edit } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';
import { TitleDocumentsView } from '@/components/documents/title-documents-view';
import { Notes } from '@/components/project/notes';
import { Tasks } from '@/components/project/tasks';
import { LegalNotes } from '@/components/project/legal-notes';
import { AcquisitionTrackerView } from '@/components/acquisition/acquisition-tracker-view';
import type { User, Project, Person, Folder, AcquisitionStatus, SurveyRecord } from '@/types';
import { SiteSketchView } from '@/components/sketch/site-sketch-view';
import { siteSketchData, type SiteSketchPlot } from '@/lib/site-sketch-data';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

// --- Versioning and Storage Keys ---
const DATA_VERSION = "1.3"; 
const DATA_VERSION_KEY = 'data-version';
const PROJECTS_STORAGE_KEY = 'projects';
const USERS_STORAGE_KEY = 'users';

// --- Default Data Constants ---
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


// --- Data Initialization Functions ---

const createOwnersMap = () => {
  return siteSketchData.reduce((acc, plot) => {
    if (plot.ownerName !== "N/A") {
      if (!acc[plot.ownerName]) {
        acc[plot.ownerName] = [];
      }
      acc[plot.ownerName].push({
        id: `lr-${plot.surveyNumber}-${plot.ownerName.replace(/\s+/g, '-')}-${Math.random()}`,
        surveyNumber: plot.surveyNumber,
        acres: plot.acres,
        cents: plot.cents,
        landClassification: plot.classification,
        googleMapsLink: plot.googleMapsLink,
      });
    }
    return acc;
  }, {} as Record<string, SurveyRecord[]>);
};

const createInitialOwners = (ownersMap: Record<string, SurveyRecord[]>): Person[] => {
  return Object.keys(ownersMap).map((ownerName, index) => ({
    id: `owner-${ownerName.replace(/\s+/g, '-')}-${index}`,
    name: ownerName,
    relation: "Family Head",
    gender: 'Male', 
    age: 40 + index * 2,
    maritalStatus: 'Married',
    status: 'Alive',
    sourceOfLand: 'Purchase',
    landRecords: ownersMap[ownerName],
    heirs: [],
  }));
};

function createDefaultAcquisitionStatus(projectId: string, plot: SiteSketchPlot, index: number): AcquisitionStatus {
    const status: AcquisitionStatus = {
        id: `${projectId}-${plot.surveyNumber}-${index}`,
        projectId: projectId,
        surveyNumber: plot.surveyNumber,
        familyHeadName: plot.ownerName,
        extent: { acres: plot.acres, cents: plot.cents },
        landClassification: plot.classification,
        googleMapsLink: plot.googleMapsLink,
        financials: { advancePayment: 'Pending', agreementStatus: 'Pending' },
        operations: { meetingDate: null, documentCollection: 'Pending' },
        legal: { queryStatus: 'Not Started' },
    };
    switch (plot.status.toLowerCase()) {
        case 'sale advance':
            status.financials.advancePayment = 'Paid';
            status.operations.documentCollection = 'Partially Collected';
            status.legal.queryStatus = 'On-Progress';
            break;
        case 'agreement':
            status.financials.advancePayment = 'Paid';
            status.financials.agreementStatus = 'Signed';
            status.operations.documentCollection = 'Fully Collected';
            status.operations.meetingDate = new Date().toISOString();
            status.legal.queryStatus = 'Cleared';
            break;
    }
    return status;
}

function createDefaultFolders(owners: Person[], oldFolders: Folder[] = []): Folder[] {
  const findOldFolder = (path: string[]) => {
      let currentLevel = oldFolders;
      let found = null;
      for (const name of path) {
          found = currentLevel.find(f => f.name === name);
          if (found) {
              currentLevel = found.children;
          } else {
              return null;
          }
      }
      return found;
  };
    
  return owners.map((owner, ownerIndex) => {
    // Collect all survey numbers from the head and all their heirs recursively
    const allSurveyNumbers = new Set<string>();
    const collectSurveyNumbers = (person: Person) => {
        (person.landRecords || []).forEach(lr => allSurveyNumbers.add(lr.surveyNumber));
        (person.heirs || []).forEach(collectSurveyNumbers);
    };
    collectSurveyNumbers(owner);
    const surveyNumbersForFamily = Array.from(allSurveyNumbers);

    const revenueSurveyFolders = surveyNumbersForFamily.map((sn, snIndex) => {
        const oldSubFolder = findOldFolder([owner.name, 'Revenue Records', sn]);
        return {
            id: `revenue-survey-${sn.replace(/[^a-zA-Z0-9]/g, '-')}-${owner.id}-${snIndex}`,
            name: sn,
            children: oldSubFolder ? oldSubFolder.children : [], // Preserve children
        };
    });
    const sroSurveyFolders = surveyNumbersForFamily.map((sn, snIndex) => {
        const oldSubFolder = findOldFolder([owner.name, 'SRO Documents', sn]);
        return {
            id: `sro-survey-${sn.replace(/[^a-zA-Z0-9]/g, '-')}-${owner.id}-${snIndex}`,
            name: sn,
            children: oldSubFolder ? oldSubFolder.children : [], // Preserve children
        };
    });

    return {
      id: `head-${owner.id}-${ownerIndex}`,
      name: owner.name,
      children: [
        { id: `revenue-${owner.id}`, name: 'Revenue Records', children: revenueSurveyFolders },
        { id: `sro-${owner.id}`, name: 'SRO Documents', children: sroSurveyFolders },
      ],
    };
  });
}


// --- Main Page Component ---

export default function ProjectDetailsPage() {
    const params = useParams();
    const projectId = params.projectId as string;
    const { toast } = useToast();

    const [project, setProject] = useState<Project | null>(null);
    const [owners, setOwners] = useState<Person[]>([]);
    const [folders, setFolders] = useState<Folder[]>([]);
    const [acquisitionStatuses, setAcquisitionStatuses] = useState<AcquisitionStatus[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [activeTab, setActiveTab] = useState('site-sketch');
    const [activeStatusId, setActiveStatusId] = useState<string | undefined>(undefined);
    
    const [isEditProjectDialogOpen, setIsEditProjectDialogOpen] = useState(false);
    const [editedProjectName, setEditedProjectName] = useState('');
    const [editedProjectSiteId, setEditedProjectSiteId] = useState('');
    const [editedProjectLocation, setEditedProjectLocation] = useState('');

    const ownersStorageKey = useMemo(() => `lineage-data-${projectId}`, [projectId]);
    const folderStorageKey = useMemo(() => `document-folders-${projectId}`, [projectId]);
    const acquisitionStorageKey = useMemo(() => `acquisition-status-${projectId}`, [projectId]);

    // --- Data Loading and Initialization ---
    useEffect(() => {
        if (!projectId) return;
        setLoading(true);

        try {
            // --- Data Versioning and Migration ---
            const savedVersion = localStorage.getItem(DATA_VERSION_KEY);
            if (savedVersion !== DATA_VERSION) {
                console.warn(`Data version mismatch. Stored: ${savedVersion}, Code: ${DATA_VERSION}. Regenerating data...`);
                const theme = localStorage.getItem('theme');
                localStorage.clear();
                if (theme) localStorage.setItem('theme', theme);
                localStorage.setItem(DATA_VERSION_KEY, DATA_VERSION);
            }

            // --- Initialize Core Data (Users/Projects) if missing ---
            let allProjects: Project[];
            const savedProjects = localStorage.getItem(PROJECTS_STORAGE_KEY);
            if (!savedProjects) {
                allProjects = initialProjects;
                localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(allProjects));
            } else {
                allProjects = JSON.parse(savedProjects);
            }
            
            const savedUsers = localStorage.getItem(USERS_STORAGE_KEY);
            if (savedUsers) {
                const users: User[] = JSON.parse(savedUsers);
                if (users.length > 0) setCurrentUser(users[0]);
            } else {
                 localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(initialUsers));
                 setCurrentUser(initialUsers[0]);
            }

            // Find the current project
            const currentProject = allProjects.find(p => p.id === projectId);
            if (currentProject) {
                setProject(currentProject);
                setEditedProjectName(currentProject.name);
                setEditedProjectSiteId(currentProject.siteId);
                setEditedProjectLocation(currentProject.location);
            } else {
                // This case should not be hit if navigation is from a valid source
                setProject(null);
                setLoading(false);
                return;
            }

            // --- Load or Regenerate Project-Specific Data ---
            let loadedOwners = JSON.parse(localStorage.getItem(ownersStorageKey) || 'null');
            let loadedStatuses = JSON.parse(localStorage.getItem(acquisitionStorageKey) || 'null');
            let loadedFolders = JSON.parse(localStorage.getItem(folderStorageKey) || 'null');

            if (!loadedOwners || !loadedStatuses || !loadedFolders || loadedOwners.length === 0) {
                const ownersMap = createOwnersMap();
                const initialHeads = createInitialOwners(ownersMap);
                const demoStatuses = siteSketchData.map((plot, index) => createDefaultAcquisitionStatus(projectId, plot, index));
                const defaultFolders = createDefaultFolders(initialHeads);

                loadedOwners = initialHeads;
                loadedStatuses = demoStatuses;
                loadedFolders = defaultFolders;

                localStorage.setItem(ownersStorageKey, JSON.stringify(loadedOwners));
                localStorage.setItem(acquisitionStorageKey, JSON.stringify(loadedStatuses));
                localStorage.setItem(folderStorageKey, JSON.stringify(loadedFolders));
            }
            
            setOwners(loadedOwners);
            setAcquisitionStatuses(loadedStatuses);
            setFolders(loadedFolders);
            
            if (loadedStatuses.length > 0 && (!activeStatusId || !loadedStatuses.some((s: { id: string | undefined; }) => s.id === activeStatusId))) {
                setActiveStatusId(loadedStatuses[0].id);
            }

        } catch (e) {
            console.error("Could not load project data", e);
            toast({ variant: 'destructive', title: 'Error Loading Data', description: 'There was a problem initializing project data.' });
        }
        setLoading(false);
    }, [projectId, ownersStorageKey, folderStorageKey, acquisitionStorageKey, activeStatusId, toast]);

    const updateAndPersistOwners = useCallback((newOwners: Person[]) => {
        setOwners(newOwners);
        localStorage.setItem(ownersStorageKey, JSON.stringify(newOwners));
    }, [ownersStorageKey]);

    // This effect will run whenever `owners` data changes, ensuring folders stay in sync while preserving user additions.
    useEffect(() => {
        if (owners && owners.length > 0) {
            // Use the functional form of setState to get the previous state
            // to avoid listing `folders` in the dependency array and causing loops.
            setFolders(currentFolders => {
                const newFolders = createDefaultFolders(owners, currentFolders);

                // Avoid unnecessary writes if the structure hasn't changed.
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
        const updatedProjectData: Project = { ...project, name: editedProjectName, siteId: editedProjectSiteId, location: editedProjectLocation };
        try {
            const projects: Project[] = JSON.parse(localStorage.getItem('projects') || '[]');
            const updatedProjects = projects.map(p => p.id === projectId ? updatedProjectData : p);
            localStorage.setItem('projects', JSON.stringify(updatedProjects));
            setProject(updatedProjectData);
            setIsEditProjectDialogOpen(false);
            toast({ title: 'Project Updated', description: 'The project details have been successfully saved.' });
        } catch (error) {
            console.error("Failed to update project", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to update project details.' });
        }
    };
    
    const handleAddHeir = useCallback((parentId: string, heirData: Omit<Person, 'id' | 'heirs' | 'landRecords'>) => {
        const newOwners = JSON.parse(JSON.stringify(owners));
        let parentFound = false;

        const addHeirRecursive = (person: Person): boolean => {
            if (person.id === parentId) {
                const newHeir: Person = { ...heirData, id: `${parentId}.${person.heirs.length + 1}`, landRecords: [], heirs: [] };
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
        }
    }, [owners, updateAndPersistOwners]);

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
        }
    }, [owners, updateAndPersistOwners]);

    const handleUpdateAcquisitionStatus = useCallback((updatedStatus: AcquisitionStatus) => {
        const newStatuses = acquisitionStatuses.map(status => status.id === updatedStatus.id ? updatedStatus : status);
        setAcquisitionStatuses(newStatuses);
        localStorage.setItem(acquisitionStorageKey, JSON.stringify(newStatuses));
    }, [acquisitionStatuses, acquisitionStorageKey]);

    const handleAddFolder = useCallback((parentId: string, name: string) => {
        const newFolder: Folder = { id: `folder-${Date.now()}`, name, children: [] };
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

    const allSurveyNumbers = useMemo(() => Array.from(new Set(siteSketchData.map(d => d.surveyNumber))), []);
    const handleSelectSurvey = useCallback((statusId: string) => { setActiveStatusId(statusId); setActiveTab('acquisition-tracker'); }, []);


    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    if (!project) {
        return (
            <div className="p-4 sm:p-6 lg:p-8 text-center">
                <Button variant="ghost" asChild className="mb-4">
                    <Link href="/">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Projects
                    </Link>
                </Button>
                <h1 className="text-2xl font-bold">Project not found</h1>
                <p className="text-muted-foreground">The project you are looking for does not exist or has been deleted. This can happen on first load; try returning to the main page.</p>
            </div>
        )
    }

    const currentUserRole = currentUser?.role;
    const canSeeSensitiveTabs = currentUserRole === 'Super Admin';
    const canSeeLegalNotes = currentUserRole === 'Super Admin' || currentUserRole === 'Lawyer';


    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <header className="mb-6">
                <Button variant="ghost" asChild className="mb-4 -ml-4">
                    <Link href="/">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Projects
                    </Link>
                </Button>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
                        <p className="text-muted-foreground">{project.siteId} - {project.location}</p>
                    </div>
                     <Dialog open={isEditProjectDialogOpen} onOpenChange={setIsEditProjectDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline">
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Project
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Edit Project Details</DialogTitle>
                                <DialogDescription>
                                    Make changes to your project here. Click save when you're done.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleUpdateProject}>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="edit-name" className="text-right">Name</Label>
                                        <Input id="edit-name" value={editedProjectName} onChange={(e) => setEditedProjectName(e.target.value)} className="col-span-3" required />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="edit-siteId" className="text-right">Site ID</Label>
                                        <Input id="edit-siteId" value={editedProjectSiteId} onChange={(e) => setEditedProjectSiteId(e.target.value)} className="col-span-3" required />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="edit-location" className="text-right">Location</Label>
                                        <Input id="edit-location" value={editedProjectLocation} onChange={(e) => setEditedProjectLocation(e.target.value)} className="col-span-3" required />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="submit">Save Changes</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </header>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <ScrollArea className="w-full pb-2.5">
                    <TabsList>
                        <TabsTrigger value="site-sketch">Site Sketch</TabsTrigger>
                        <TabsTrigger value="lineage">Family Lineage</TabsTrigger>
                        <TabsTrigger value="acquisition-tracker">Acquisition Tracker</TabsTrigger>
                        <TabsTrigger value="title-documents">Title Documents</TabsTrigger>
                        <TabsTrigger value="transactions">Transaction History</TabsTrigger>
                        <TabsTrigger value="files">Files &amp; Documents</TabsTrigger>
                        {canSeeLegalNotes && <TabsTrigger value="legal-notes">Legal Notes</TabsTrigger>}
                        {canSeeSensitiveTabs && (<><TabsTrigger value="notes">Notes</TabsTrigger><TabsTrigger value="tasks">Tasks</TabsTrigger></>)}
                    </TabsList>
                    <ScrollBar orientation="horizontal" />
                </ScrollArea>
                <TabsContent value="lineage" className="mt-6">
                    <LineageView familyHeads={owners} onAddHeir={handleAddHeir} onUpdatePerson={handleUpdatePerson} />
                </TabsContent>
                <TabsContent value="site-sketch" className="mt-6">
                    <SiteSketchView acquisitionStatuses={acquisitionStatuses} onSelectSurvey={handleSelectSurvey} />
                </TabsContent>
                 <TabsContent value="acquisition-tracker" className="mt-6">
                    <AcquisitionTrackerView statuses={acquisitionStatuses} onUpdateStatus={handleUpdateAcquisitionStatus} activeStatusId={activeStatusId} onActiveStatusChange={setActiveStatusId} />
                </TabsContent>
                <TabsContent value="title-documents" className="mt-6">
                    <TitleDocumentsView folders={folders} onAddFolder={handleAddFolder} onDeleteFolder={handleDeleteFolder} />
                </TabsContent>
                <TabsContent value="transactions" className="mt-6">
                    <TransactionHistory projectId={projectId} />
                </TabsContent>
                <TabsContent value="files" className="mt-6">
                    <FileManager projectId={projectId} />
                </TabsContent>
                {canSeeLegalNotes && (
                    <TabsContent value="legal-notes" className="mt-6">
                        <LegalNotes projectId={projectId} surveyNumbers={allSurveyNumbers} currentUser={currentUser} />
                    </TabsContent>
                 )}
                 {canSeeSensitiveTabs && (
                    <>
                        <TabsContent value="notes" className="mt-6"><Notes projectId={projectId} /></TabsContent>
                        <TabsContent value="tasks" className="mt-6"><Tasks projectId={projectId} /></TabsContent>
                    </>
                )}
            </Tabs>
        </div>
    );
}
