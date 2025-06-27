
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineageView } from "@/components/lineage/lineage-view";
import { TransactionHistory } from "@/components/transactions/transaction-history";
import { FileManager } from "@/components/files/file-manager";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TitleDocumentsView } from '@/components/documents/title-documents-view';
import { Notes } from '@/components/project/notes';
import { Tasks } from '@/components/project/tasks';
import { LegalNotes } from '@/components/project/legal-notes';
import { AcquisitionTrackerView } from '@/components/acquisition/acquisition-tracker-view';
import type { User, Project, Person, Folder, AcquisitionStatus, SurveyRecord, SurveyRecordWithOwner } from '@/types';
import { SiteSketchView } from '@/components/sketch/site-sketch-view';
import { siteSketchData } from '@/lib/site-sketch-data';

// --- Data Initialization Functions ---

// Creates a map of owners to their land records from the site sketch data.
const createOwnersMap = () => {
  return siteSketchData.reduce((acc, plot) => {
    if (plot.ownerName !== "N/A") {
      if (!acc[plot.ownerName]) {
        acc[plot.ownerName] = [];
      }
      acc[plot.ownerName].push({
        id: `lr-${plot.surveyNumber}-${plot.ownerName.replace(/\s+/g, '-')}`,
        surveyNumber: plot.surveyNumber,
        acres: plot.acres,
        cents: plot.cents,
        landClassification: plot.classification,
      });
    }
    return acc;
  }, {} as Record<string, SurveyRecord[]>);
};

// Creates the initial list of family heads (owners) from the owners map.
const createInitialFamilyHeads = (ownersMap: Record<string, SurveyRecord[]>): Person[] => {
  return Object.keys(ownersMap).map((ownerName, index) => ({
    id: `owner-${ownerName.replace(/\s+/g, '-')}-${index}`,
    name: ownerName,
    relation: "Family Head",
    gender: 'Male', // Default, can be edited
    age: 40 + index * 2, // Dummy age
    maritalStatus: 'Married', // Default
    status: 'Alive', // Default
    sourceOfLand: 'Purchase', // Default
    landRecords: ownersMap[ownerName],
    heirs: [],
  }));
};

// Creates the default acquisition status for a given land plot.
function createDefaultAcquisitionStatus(projectId: string, plot: typeof siteSketchData[0]): AcquisitionStatus {
    const status: AcquisitionStatus = {
        id: `${projectId}-${plot.surveyNumber}`,
        projectId: projectId,
        surveyNumber: plot.surveyNumber,
        familyHeadName: plot.ownerName,
        extent: { acres: plot.acres, cents: plot.cents },
        landClassification: plot.classification,
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
        case 'pending':
        default:
            // Default status is already pending/not started
            break;
    }
    return status;
}

// Generates the default folder structure based on all survey numbers and owners.
function createDefaultFolders(familyHeads: Person[]): Folder[] {
  const allSurveyNumbers = new Set<string>();
  const allOwnerNames = new Set<string>();

  familyHeads.forEach(head => {
    allOwnerNames.add(head.name);
    (head.landRecords || []).forEach(lr => allSurveyNumbers.add(lr.surveyNumber));
  });

  const createSurveyFolder = (surveyNumber: string): Folder => {
    const sanitizedSurvey = surveyNumber.replace(/[^a-zA-Z0-9]/g, '-');
    return {
      id: `survey-${sanitizedSurvey}-${Date.now()}`,
      name: surveyNumber,
      children: [
        {
          id: `rev-${sanitizedSurvey}-${Date.now()}`,
          name: 'Revenue Record',
          children: [
            { id: `sro-${sanitizedSurvey}-${Date.now()}`, name: 'SRO Records', children: [] },
          ],
        },
      ],
    };
  };

  const surveyFolders = Array.from(allSurveyNumbers).map(createSurveyFolder);

  const kycSubFolders: Folder[] = Array.from(allOwnerNames).map((name, index) => ({
    id: `kyc-member-${name.replace(/[^a-zA-Z0-9]/g, '-')}-${Date.now() + index}`,
    name: name,
    children: [],
  }));

  const kycFolder: Folder = {
    id: `kyc-root-${Date.now()}`,
    name: 'Seller KYC',
    children: kycSubFolders,
  };

  return [...surveyFolders, kycFolder];
}


// --- Main Page Component ---

export default function ProjectDetailsPage() {
    const params = useParams();
    const projectId = params.projectId as string;

    const [project, setProject] = useState<Project | null>(null);
    const [familyHeads, setFamilyHeads] = useState<Person[]>([]);
    const [folders, setFolders] = useState<Folder[]>([]);
    const [acquisitionStatuses, setAcquisitionStatuses] = useState<AcquisitionStatus[]>([]);
    const [loading, setLoading] = useState(true);
    const [isLoaded, setIsLoaded] = useState(false);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [activeTab, setActiveTab] = useState('site-sketch');
    const [activeSurvey, setActiveSurvey] = useState<string | undefined>(siteSketchData[0]?.surveyNumber);

    const lineageStorageKey = `lineage-data-${projectId}`;
    const folderStorageKey = `document-folders-${projectId}`;
    const acquisitionStorageKey = `acquisition-status-${projectId}`;

    // --- Data Loading and Initialization ---
    useEffect(() => {
        if (!projectId) return;
        try {
            const savedProjects = localStorage.getItem('projects');
            if (savedProjects) {
                const projects: Project[] = JSON.parse(savedProjects);
                const currentProject = projects.find(p => p.id === projectId);
                if (currentProject) setProject(currentProject);
            }

            const savedUsers = localStorage.getItem('users');
            if (savedUsers) {
                const users: User[] = JSON.parse(savedUsers);
                if (users.length > 0) setCurrentUser(users[0]);
            }

            // Lineage Data
            const savedLineage = localStorage.getItem(lineageStorageKey);
            if (savedLineage) {
                setFamilyHeads(JSON.parse(savedLineage));
            } else {
                const ownersMap = createOwnersMap();
                const initialHeads = createInitialFamilyHeads(ownersMap);
                setFamilyHeads(initialHeads);
            }
            
            // Acquisition Statuses
            const savedAcquisition = localStorage.getItem(acquisitionStorageKey);
            if (savedAcquisition) {
                setAcquisitionStatuses(JSON.parse(savedAcquisition));
            } else {
                const demoStatuses = siteSketchData.map(plot => createDefaultAcquisitionStatus(projectId, plot));
                setAcquisitionStatuses(demoStatuses);
            }
            
            // Document Folders
            const savedFolders = localStorage.getItem(folderStorageKey);
             if (savedFolders) {
                setFolders(JSON.parse(savedFolders));
            } else {
                // We need familyHeads to generate folders, so we do it based on what was just set
                const lineageData = savedLineage ? JSON.parse(savedLineage) : createInitialFamilyHeads(createOwnersMap());
                const defaultFolders = createDefaultFolders(lineageData);
                setFolders(defaultFolders);
            }


        } catch (e) {
            console.error("Could not load project data", e);
        }
        setLoading(false);
        setIsLoaded(true);
    }, [projectId, lineageStorageKey, folderStorageKey, acquisitionStorageKey]);


    // --- Data Persistence ---
    useEffect(() => {
        if (isLoaded) {
            try {
                if (familyHeads.length > 0) localStorage.setItem(lineageStorageKey, JSON.stringify(familyHeads));
                if (folders.length > 0) localStorage.setItem(folderStorageKey, JSON.stringify(folders));
                if (acquisitionStatuses.length > 0) localStorage.setItem(acquisitionStorageKey, JSON.stringify(acquisitionStatuses));
            } catch (e) {
                console.error("Could not save project data to local storage", e);
            }
        }
    }, [familyHeads, folders, acquisitionStatuses, isLoaded, lineageStorageKey, folderStorageKey, acquisitionStorageKey]);


    // --- Helper functions for manipulating state ---
    const findPerson = (people: Person[], personId: string): {person: Person, path: string[]} | null => {
        for (let i = 0; i < people.length; i++) {
            const p = people[i];
            if (p.id === personId) return { person: p, path: [i.toString()] };
            
            const findInHeirs = (person: Person, currentPath: string[]): {person: Person, path: string[]} | null => {
                 if (person.id === personId) return { person, path: currentPath };
                 for (let j = 0; j < person.heirs.length; j++) {
                     const heir = person.heirs[j];
                     const result = findInHeirs(heir, [...currentPath, 'heirs', j.toString()]);
                     if (result) return result;
                 }
                 return null;
            }
            const result = findInHeirs(p, [i.toString()]);
            if (result) return result;
        }
        return null;
    }
    
    // --- State Update Handlers ---
    const handleAddHeir = useCallback((parentId: string, heirData: Omit<Person, 'id' | 'heirs' | 'landRecords'>) => {
        setFamilyHeads(currentHeads => {
            const newHeads = JSON.parse(JSON.stringify(currentHeads)); // Deep copy

            const addHeirRecursive = (person: Person): boolean => {
                if (person.id === parentId) {
                    const newHeir: Person = {
                        ...heirData,
                        id: `${parentId}.${person.heirs.length + 1}`,
                        landRecords: [],
                        heirs: [],
                    };
                    person.heirs.push(newHeir);
                    return true;
                }
                for (const heir of person.heirs) {
                    if (addHeirRecursive(heir)) return true;
                }
                return false;
            };

            for (const head of newHeads) {
                if (addHeirRecursive(head)) break;
            }
            return newHeads;
        });

        // Add a KYC folder for the new heir
        setFolders(currentFolders => {
            const newMemberFolder: Folder = {
                id: `kyc-member-${heirData.name.replace(/\s+/g, '-')}-${Date.now()}`,
                name: heirData.name,
                children: []
            };
            const addKycSubfolder = (nodes: Folder[]): Folder[] => {
                return nodes.map(folder => {
                    if (folder.name === 'Seller KYC') {
                        if (!folder.children.some(child => child.name === heirData.name)) {
                           return { ...folder, children: [...folder.children, newMemberFolder] };
                        }
                    }
                    return folder;
                });
            };
            return addKycSubfolder(currentFolders);
        });
    }, []);

    const handleUpdatePerson = useCallback((personId: string, personData: Omit<Person, 'id' | 'heirs'>) => {
        let oldPersonName = '';

        setFamilyHeads(currentHeads => {
            const newHeads = JSON.parse(JSON.stringify(currentHeads)); // Deep copy

            const updatePersonRecursive = (person: Person): boolean => {
                if (person.id === personId) {
                    oldPersonName = person.name;
                    Object.assign(person, personData);
                    return true;
                }
                for (const heir of person.heirs) {
                    if (updatePersonRecursive(heir)) return true;
                }
                return false;
            };

            for (const head of newHeads) {
                if (updatePersonRecursive(head)) break;
            }
            return newHeads;
        });

        // Update related data if necessary
        const newSurveyNumbers = (personData.landRecords || []).map(lr => lr.surveyNumber);
        
        // Update Acquisition Statuses
        setAcquisitionStatuses(currentStatuses => {
            let statuses = [...currentStatuses];
            (personData.landRecords || []).forEach(record => {
                const existingIndex = statuses.findIndex(s => s.surveyNumber === record.surveyNumber);
                if (existingIndex > -1) {
                    statuses[existingIndex] = {
                        ...statuses[existingIndex],
                        familyHeadName: personData.name,
                        extent: { acres: record.acres, cents: record.cents },
                        landClassification: record.landClassification
                    };
                }
            });
            return statuses;
        });

        // Update Folders
        setFolders(currentFolders => {
            let updatedFolders = [...currentFolders];
            const existingFolderNames = new Set(updatedFolders.map(f => f.name));

            newSurveyNumbers.forEach(sn => {
                if (!existingFolderNames.has(sn)) {
                    const sanitizedSurvey = sn.replace(/[^a-zA-Z0-9]/g, '-');
                     updatedFolders.push({
                        id: `survey-${sanitizedSurvey}-${Date.now()}`,
                        name: sn,
                        children: [{ id: `rev-${sanitizedSurvey}-${Date.now()}`, name: 'Revenue Record', children: [] }]
                    });
                }
            });
            
            if (oldPersonName && oldPersonName !== personData.name) {
                const kycFolder = updatedFolders.find(f => f.name === 'Seller KYC');
                if (kycFolder) {
                    kycFolder.children = kycFolder.children.map(child => 
                        child.name === oldPersonName ? { ...child, name: personData.name } : child
                    );
                }
            }

            return updatedFolders;
        });
    }, [projectId]);

    const handleUpdateAcquisitionStatus = useCallback((updatedStatus: AcquisitionStatus) => {
        setAcquisitionStatuses(currentStatuses =>
            currentStatuses.map(status =>
                status.id === updatedStatus.id ? updatedStatus : status
            )
        );
    }, []);

    const handleAddFolder = useCallback((parentId: string, name: string) => {
        const newFolder: Folder = {
          id: `folder-${Date.now()}`,
          name,
          children: [],
        };
        const addFolderRecursive = (nodes: Folder[], pId: string, nFolder: Folder): Folder[] => {
            return nodes.map((node) => {
              if (node.id === pId) {
                return { ...node, children: [...node.children, nFolder] };
              }
              if (node.children.length > 0) {
                return { ...node, children: addFolderRecursive(node.children, pId, nFolder) };
              }
              return node;
            });
        };

        if (parentId === 'root') {
          setFolders((currentFolders) => [...currentFolders, newFolder]);
        } else {
          setFolders((currentFolders) => addFolderRecursive(currentFolders, parentId, newFolder));
        }
    }, []);

    const handleDeleteFolder = useCallback((folderId: string) => {
        const deleteFolderRecursive = (nodes: Folder[], fId: string): Folder[] => {
            return nodes.filter(node => node.id !== fId).map(node => {
                if (node.children.length > 0) {
                    return { ...node, children: deleteFolderRecursive(node.children, fId) };
                }
                return node;
            });
        };
        setFolders(currentFolders => deleteFolderRecursive(currentFolders, folderId));
    }, []);

    const allSurveyNumbers = useMemo(() => {
        return Array.from(new Set(siteSketchData.map(d => d.surveyNumber)));
    }, []);


    const handleSelectSurvey = useCallback((surveyNumber: string) => {
        setActiveSurvey(surveyNumber);
        setActiveTab('acquisition-tracker');
    }, []);


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
                    <Link href="/">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Projects
                    </Link>
                </Button>
                <h1 className="text-2xl font-bold">Project not found</h1>
                <p className="text-muted-foreground">The project you are looking for does not exist or has been deleted.</p>
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
                <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
                <p className="text-muted-foreground">{project.siteId} - {project.location}</p>
            </header>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full sm:inline-flex sm:w-auto">
                    <TabsTrigger value="site-sketch">Site Sketch</TabsTrigger>
                    <TabsTrigger value="lineage">Family Lineage</TabsTrigger>
                    <TabsTrigger value="acquisition-tracker">Acquisition Tracker</TabsTrigger>
                    <TabsTrigger value="title-documents">Title Documents</TabsTrigger>
                    <TabsTrigger value="transactions">Transaction History</TabsTrigger>
                    <TabsTrigger value="files">Files &amp; Documents</TabsTrigger>
                    {canSeeLegalNotes && (
                         <TabsTrigger value="legal-notes">Legal Notes</TabsTrigger>
                    )}
                    {canSeeSensitiveTabs && (
                        <>
                            <TabsTrigger value="notes">Notes</TabsTrigger>
                            <TabsTrigger value="tasks">Tasks</TabsTrigger>
                        </>
                    )}
                </TabsList>
                <TabsContent value="lineage" className="mt-6">
                    <LineageView 
                        familyHeads={familyHeads}
                        onAddHeir={handleAddHeir}
                        onUpdatePerson={handleUpdatePerson}
                    />
                </TabsContent>
                <TabsContent value="site-sketch" className="mt-6">
                    <SiteSketchView 
                        acquisitionStatuses={acquisitionStatuses} 
                        onSelectSurvey={handleSelectSurvey}
                    />
                </TabsContent>
                 <TabsContent value="acquisition-tracker" className="mt-6">
                    <AcquisitionTrackerView 
                        statuses={acquisitionStatuses} 
                        onUpdateStatus={handleUpdateAcquisitionStatus}
                        activeSurvey={activeSurvey}
                        onActiveSurveyChange={setActiveSurvey}
                    />
                </TabsContent>
                <TabsContent value="title-documents" className="mt-6">
                    <TitleDocumentsView
                        folders={folders}
                        onAddFolder={handleAddFolder}
                        onDeleteFolder={handleDeleteFolder}
                    />
                </TabsContent>
                <TabsContent value="transactions" className="mt-6">
                    <TransactionHistory projectId={projectId} />
                </TabsContent>
                <TabsContent value="files" className="mt-6">
                    <FileManager projectId={projectId} />
                </TabsContent>
                {canSeeLegalNotes && (
                    <TabsContent value="legal-notes" className="mt-6">
                        <LegalNotes
                            projectId={projectId}
                            surveyNumbers={allSurveyNumbers}
                            currentUser={currentUser}
                        />
                    </TabsContent>
                 )}
                 {canSeeSensitiveTabs && (
                    <>
                        <TabsContent value="notes" className="mt-6">
                            <Notes projectId={projectId} />
                        </TabsContent>
                        <TabsContent value="tasks" className="mt-6">
                            <Tasks projectId={projectId} />
                        </TabsContent>
                    </>
                )}
            </Tabs>
        </div>
    );
}
