
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

// Recursive function to find a person in the family tree
const findPerson = (family: Person, personId: string): Person | null => {
  if (family.id === personId) {
    return family;
  }
  for (const heir of family.heirs) {
    const found = findPerson(heir, personId);
    if (found) {
      return found;
    }
  }
  return null;
};

// Recursive function to add an heir
const addHeirToFamily = (family: Person, parentId: string, newHeirData: Omit<Person, 'id' | 'heirs' | 'landRecords'>): Person => {
  if (family.id === parentId) {
    const newHeir: Person = {
      ...newHeirData,
      id: `${parentId}.${family.heirs.length + 1}`,
      landRecords: [],
      heirs: [],
    };
    return {
      ...family,
      heirs: [...family.heirs, newHeir],
    };
  }
  return {
    ...family,
    heirs: family.heirs.map(h => addHeirToFamily(h, parentId, newHeirData)),
  };
};

// Recursive function to update a person
const updatePersonInFamily = (family: Person, personId: string, updatedData: Omit<Person, 'id' | 'heirs'>): Person => {
  if (family.id === personId) {
    return {
      ...family,
      ...updatedData,
    };
  }
  return {
    ...family,
    heirs: family.heirs.map(h => updatePersonInFamily(h, personId, updatedData)),
  };
};

// Function to create the default folder structure for a new survey number
function createSurveyFolder(surveyNumber: string): Folder {
  const now = Date.now();
  // Sanitize surveyNumber for IDs
  const sanitizedSurvey = surveyNumber.replace(/[^a-zA-Z0-9]/g, '-');

  return {
    id: `survey-${sanitizedSurvey}-${now}`,
    name: surveyNumber,
    children: [
      {
        id: `rev-${sanitizedSurvey}-${now}`,
        name: 'Revenue Record',
        children: [
          {
            id: `sro-${sanitizedSurvey}-${now}`,
            name: 'SRO Records',
            children: [],
          },
        ],
      },
    ],
  };
}

// Mock data for lineage based on the provided site sketch
const defaultFamilyHead: Person = {
  id: '1',
  name: 'Arunachalam',
  relation: 'Family Head',
  gender: 'Male',
  age: 78,
  maritalStatus: 'Married',
  status: 'Alive',
  sourceOfLand: 'Purchase',
  landRecords: [
      { id: 'lr-1-1', surveyNumber: '34/1', acres: '1', cents: '50', landClassification: 'Dry' },
      { id: 'lr-1-2', surveyNumber: '34/2', acres: '0', cents: '75', landClassification: 'Dry' }
  ],
  heirs: [
    {
      id: '1.1',
      name: 'Baskar',
      relation: 'Son',
      gender: 'Male',
      age: 55,
      maritalStatus: 'Married',
      status: 'Alive',
      sourceOfLand: 'Legal Heir',
      landRecords: [
        { id: 'lr-1.1-1', surveyNumber: '35/1', acres: '2', cents: '10', landClassification: 'Wet' },
        { id: 'lr-1.1-2', surveyNumber: '35/3A', acres: '1', cents: '25', landClassification: 'Wet' },
      ],
      heirs: [],
    },
    {
      id: '1.2',
      name: 'Chitra',
      relation: 'Daughter',
      gender: 'Female',
      age: 52,
      maritalStatus: 'Married',
      status: 'Alive',
      sourceOfLand: 'Gift',
      landRecords: [
         { id: 'lr-1.2-1', surveyNumber: '33/1A', acres: '3', cents: '0', landClassification: 'Dry' },
         { id: 'lr-1.2-2', surveyNumber: '33/1B', acres: '0', cents: '80', landClassification: 'Dry' },
      ],
      heirs: [],
    },
    {
      id: '1.3',
      name: 'David',
      relation: 'Son',
      gender: 'Male',
      age: 48,
      maritalStatus: 'Married',
      status: 'Alive',
      sourceOfLand: 'Legal Heir',
      landRecords: [
         { id: 'lr-1.3-1', surveyNumber: '10/1A', acres: '0', cents: '95', landClassification: 'Unclassified' },
         { id: 'lr-1.3-2', surveyNumber: '10/1B', acres: '1', cents: '0', landClassification: 'Unclassified' },
         { id: 'lr-1.3-3', surveyNumber: '10/1C', acres: '1', cents: '10', landClassification: 'Unclassified' },
      ],
      heirs: [],
    },
  ],
};

function createDefaultAcquisitionStatus(projectId: string, surveyRecord: SurveyRecord, familyHeadName: string): AcquisitionStatus {
    return {
        id: `${projectId}-${surveyRecord.surveyNumber}`,
        projectId: projectId,
        surveyNumber: surveyRecord.surveyNumber,
        familyHeadName,
        extent: { acres: surveyRecord.acres, cents: surveyRecord.cents },
        landClassification: surveyRecord.landClassification,
        financials: {
            advancePayment: 'Pending',
            agreementStatus: 'Pending',
        },
        operations: {
            meetingDate: null,
            documentCollection: 'Pending',
        },
        legal: {
            queryStatus: 'Not Started',
        },
    };
}

export default function ProjectDetailsPage() {
    const params = useParams();
    const projectId = params.projectId as string;

    const [project, setProject] = useState<Project | null>(null);
    const [familyHead, setFamilyHead] = useState<Person | null>(null);
    const [folders, setFolders] = useState<Folder[]>([]);
    const [acquisitionStatuses, setAcquisitionStatuses] = useState<AcquisitionStatus[]>([]);
    const [loading, setLoading] = useState(true);
    const [isLoaded, setIsLoaded] = useState(false);
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    const lineageStorageKey = `lineage-data-${projectId}`;
    const folderStorageKey = `document-folders-${projectId}`;
    const acquisitionStorageKey = `acquisition-status-${projectId}`;

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

            const savedLineage = localStorage.getItem(lineageStorageKey);
            const lineageData = savedLineage ? JSON.parse(savedLineage) : defaultFamilyHead;
            setFamilyHead(lineageData);

            // Collect all unique survey numbers from lineage
            const surveyRecordsMap = new Map<string, SurveyRecord>();
            const collectSurveyRecords = (person: Person) => {
                (person.landRecords || []).forEach(rec => {
                    if (!surveyRecordsMap.has(rec.surveyNumber)) {
                        surveyRecordsMap.set(rec.surveyNumber, rec);
                    }
                });
                (person.heirs || []).forEach(collectSurveyRecords);
            };
            collectSurveyRecords(lineageData);
            const allSurveyRecords = Array.from(surveyRecordsMap.values());

            const savedFolders = localStorage.getItem(folderStorageKey);
            if (savedFolders) {
                setFolders(JSON.parse(savedFolders));
            } else {
                 const surveyFolders = allSurveyRecords.map(r => createSurveyFolder(r.surveyNumber));
                const familyMembers: string[] = [];
                const collectFamilyMembers = (person: Person) => {
                    familyMembers.push(person.name);
                    (person.heirs || []).forEach(collectFamilyMembers);
                };
                collectFamilyMembers(lineageData);

                const kycSubFolders: Folder[] = familyMembers.map((name, index) => ({
                    id: `kyc-member-${name.replace(/[^a-zA-Z0-9]/g, '-')}-${Date.now() + index}`,
                    name: name,
                    children: [],
                }));

                const kycFolder: Folder = {
                    id: `kyc-root-${Date.now()}`,
                    name: 'Seller KYC',
                    children: kycSubFolders,
                };
                setFolders([...surveyFolders, kycFolder]);
            }

            const savedAcquisition = localStorage.getItem(acquisitionStorageKey);
            if (savedAcquisition) {
                setAcquisitionStatuses(JSON.parse(savedAcquisition));
            } else {
                // Create a richer demo dataset for the acquisition tracker based on the site sketch
                const demoStatuses = allSurveyRecords.map(rec => {
                    const baseStatus = createDefaultAcquisitionStatus(projectId, rec, lineageData.name);
                    
                    // Customize statuses for demo purposes
                    if (rec.surveyNumber === '34/1') {
                        baseStatus.financials = { advancePayment: 'Paid', agreementStatus: 'Signed' };
                        baseStatus.operations = {
                            meetingDate: new Date(new Date().setDate(new Date().getDate() - 15)).toISOString(),
                            documentCollection: 'Fully Collected',
                        };
                         baseStatus.legal = { queryStatus: 'Cleared' };
                    } else if (rec.surveyNumber === '35/3A') {
                        baseStatus.financials = { advancePayment: 'Paid', agreementStatus: 'Pending' };
                        baseStatus.operations = {
                            meetingDate: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString(),
                            documentCollection: 'Partially Collected',
                        };
                        baseStatus.legal = { queryStatus: 'On-Progress' };
                    } else if (rec.surveyNumber === '33/1B') {
                        baseStatus.financials = { advancePayment: 'Pending', agreementStatus: 'Pending' };
                        baseStatus.operations = { meetingDate: null, documentCollection: 'Pending' };
                        baseStatus.legal = { queryStatus: 'Awaiting' };
                    }
                    // All other survey numbers (e.g., from S.No 10) will remain in their default "Not Started" / "Pending" state.
                    
                    return baseStatus;
                });
                setAcquisitionStatuses(demoStatuses);
            }

        } catch (e) {
            console.error("Could not load project data", e);
        }
        setLoading(false);
        setIsLoaded(true);
    }, [projectId, lineageStorageKey, folderStorageKey, acquisitionStorageKey]);

    useEffect(() => {
        if (isLoaded) {
            try {
                if (familyHead) localStorage.setItem(lineageStorageKey, JSON.stringify(familyHead));
                if (folders.length > 0) localStorage.setItem(folderStorageKey, JSON.stringify(folders));
                if (acquisitionStatuses.length > 0) localStorage.setItem(acquisitionStorageKey, JSON.stringify(acquisitionStatuses));
            } catch (e) {
                console.error("Could not save project data to local storage", e);
            }
        }
    }, [familyHead, folders, acquisitionStatuses, isLoaded, lineageStorageKey, folderStorageKey, acquisitionStorageKey]);

    const handleAddHeir = useCallback((parentId: string, heirData: Omit<Person, 'id' | 'heirs' | 'landRecords'>) => {
        if (!familyHead) return;
        const updatedFamilyHead = addHeirToFamily(familyHead, parentId, heirData);
        setFamilyHead(updatedFamilyHead);

        setFolders(currentFolders => {
            const newMemberFolder: Folder = {
                id: `kyc-member-${heirData.name.replace(/\s+/g, '-')}-${Date.now()}`,
                name: heirData.name,
                children: []
            };
            const addKycSubfolder = (nodes: Folder[]): Folder[] => {
                return nodes.map(folder => {
                    if (folder.name === 'Seller KYC') {
                        if (folder.children.some(child => child.name === heirData.name)) {
                            return folder;
                        }
                        const updatedChildren = [...folder.children, newMemberFolder];
                        return { ...folder, children: updatedChildren };
                    }
                    return folder;
                });
            };
            return addKycSubfolder(currentFolders);
        });
    }, [familyHead]);

    const handleUpdatePerson = useCallback((personId: string, personData: Omit<Person, 'id' | 'heirs'>) => {
        if (!familyHead) return;

        const oldPersonState = findPerson(familyHead, personId);
        if (!oldPersonState) return;
        
        const oldSurveyNumbers = new Set((oldPersonState.landRecords || []).map(lr => lr.surveyNumber));
        
        const updatedFamilyHead = updatePersonInFamily(familyHead, personId, personData);
        setFamilyHead(updatedFamilyHead);

        // Update acquisition status if land records changed
        setAcquisitionStatuses(currentStatuses => {
            const newStatuses = [...currentStatuses];
            (personData.landRecords || []).forEach(record => {
                const existingStatusIndex = newStatuses.findIndex(s => s.surveyNumber === record.surveyNumber);
                if (existingStatusIndex > -1) {
                    // Update existing status
                    newStatuses[existingStatusIndex] = {
                        ...newStatuses[existingStatusIndex],
                        extent: { acres: record.acres, cents: record.cents },
                        landClassification: record.landClassification,
                        familyHeadName: familyHead.name,
                    };
                } else {
                    // Add new status if a new survey number was added
                    newStatuses.push(createDefaultAcquisitionStatus(projectId, record, familyHead.name));
                }
            });
            return newStatuses;
        });

        const newSurveyNumbers = new Set((personData.landRecords || []).map(lr => lr.surveyNumber));
        const addedSurveyNumbers = [...newSurveyNumbers].filter(sn => !oldSurveyNumbers.has(sn));

        setFolders(currentFolders => {
            let updatedFolders = [...currentFolders];

            if (addedSurveyNumbers.length > 0) {
                const existingFolderNames = new Set(updatedFolders.map(f => f.name));
                const newFoldersToAdd = addedSurveyNumbers
                    .filter(surveyNumber => !existingFolderNames.has(surveyNumber))
                    .map(createSurveyFolder);
                updatedFolders = [...updatedFolders, ...newFoldersToAdd];
            }

            if (oldPersonState.name !== personData.name) {
                const updateKycSubfolderName = (nodes: Folder[]): Folder[] => {
                    return nodes.map(folder => {
                        if (folder.name === 'Seller KYC') {
                            const updatedChildren = folder.children.map(child => {
                                if (child.name === oldPersonState.name) {
                                    return { ...child, name: personData.name };
                                }
                                return child;
                            });
                            return { ...folder, children: updatedChildren };
                        }
                        return folder;
                    });
                };
                updatedFolders = updateKycSubfolderName(updatedFolders);
            }
            return updatedFolders;
        });
    }, [familyHead, projectId]);

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
        if (!familyHead) return [];
        const surveyNumbers = new Set<string>();
        const collect = (person: Person) => {
            (person.landRecords || []).forEach(lr => surveyNumbers.add(lr.surveyNumber));
            (person.heirs || []).forEach(collect);
        };
        collect(familyHead);
        return Array.from(surveyNumbers);
    }, [familyHead]);

    const allSurveyRecordsWithOwner = useMemo(() => {
        if (!familyHead) return [];
        const records: SurveyRecordWithOwner[] = [];
        const collect = (person: Person) => {
            (person.landRecords || []).forEach(lr => {
                records.push({
                    ...lr,
                    ownerName: person.name,
                    ownerId: person.id,
                });
            });
            (person.heirs || []).forEach(collect);
        };
        collect(familyHead);
        return records;
    }, [familyHead]);


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
            <Tabs defaultValue="lineage" className="w-full">
                <TabsList className="grid w-full sm:inline-flex sm:w-auto">
                    <TabsTrigger value="lineage">Family Lineage</TabsTrigger>
                    <TabsTrigger value="site-sketch">Site Sketch</TabsTrigger>
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
                        familyHead={familyHead}
                        onAddHeir={handleAddHeir}
                        onUpdatePerson={handleUpdatePerson}
                    />
                </TabsContent>
                <TabsContent value="site-sketch" className="mt-6">
                    <SiteSketchView plotData={allSurveyRecordsWithOwner} />
                </TabsContent>
                 <TabsContent value="acquisition-tracker" className="mt-6">
                    <AcquisitionTrackerView 
                        statuses={acquisitionStatuses} 
                        onUpdateStatus={handleUpdateAcquisitionStatus}
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

    
