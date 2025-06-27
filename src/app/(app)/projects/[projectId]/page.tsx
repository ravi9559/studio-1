'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineageView } from "@/components/lineage/lineage-view";
import { TransactionHistory } from "@/components/transactions/transaction-history";
import { FileManager } from "@/components/files/file-manager";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TitleDocumentsView, type Folder } from '@/components/documents/title-documents-view';
import type { Person } from '@/components/lineage/person-card';

// Define the type for a project
type Project = {
  id: string;
  name: string;
  siteId: string;
  location: string;
};

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

// Mock data for lineage to be used as a default for new projects
const defaultFamilyHead: Person = {
  id: '1',
  name: 'Kandasamy Gounder',
  relation: 'Family Head',
  gender: 'Male',
  age: 85,
  maritalStatus: 'Married',
  status: 'Died',
  sourceOfLand: 'Purchase',
  landRecords: [
      { id: 'lr-1-1', surveyNumber: '123/A', acres: '5', cents: '20' }
  ],
  heirs: [
    {
      id: '1.1',
      name: 'Ramasamy Gounder',
      relation: 'Son',
      gender: 'Male',
      age: 60,
      maritalStatus: 'Married',
      status: 'Alive',
      sourceOfLand: 'Legal Heir',
      landRecords: [
        { id: 'lr-1.1-1', surveyNumber: '123/A', acres: '2', cents: '60' }
      ],
      heirs: [
        {
          id: '1.1.1',
          name: 'Palanisamy',
          relation: 'Son',
          gender: 'Male',
          age: 35,
          maritalStatus: 'Married',
          status: 'Alive',
          sourceOfLand: 'Legal Heir',
          landRecords: [],
          heirs: [],
        },
        {
          id: '1.1.2',
          name: 'Saraswathi',
          relation: 'Daughter',
          gender: 'Female',
          age: 32,
          maritalStatus: 'Married',
          status: 'Alive',
          sourceOfLand: 'Legal Heir',
          landRecords: [],
          heirs: [],
        },
      ],
    },
    {
      id: '1.2',
      name: 'Kamalam',
      relation: 'Daughter',
      gender: 'Female',
      age: 58,
      maritalStatus: 'Married',
      status: 'Alive',
      sourceOfLand: 'Gift',
      landRecords: [
         { id: 'lr-1.2-1', surveyNumber: '123/B', acres: '2', cents: '60' }
      ],
      heirs: [],
    },
  ],
};

export default function ProjectDetailsPage() {
    const params = useParams();
    const projectId = params.projectId as string;

    const [project, setProject] = useState<Project | null>(null);
    const [familyHead, setFamilyHead] = useState<Person | null>(null);
    const [folders, setFolders] = useState<Folder[]>([]);
    const [loading, setLoading] = useState(true);
    const [isLoaded, setIsLoaded] = useState(false);

    const lineageStorageKey = `lineage-data-${projectId}`;
    const folderStorageKey = `document-folders-${projectId}`;

    useEffect(() => {
        if (!projectId) return;
        try {
            // Load project details
            const savedProjects = localStorage.getItem('projects');
            if (savedProjects) {
                const projects: Project[] = JSON.parse(savedProjects);
                const currentProject = projects.find(p => p.id === projectId);
                if (currentProject) setProject(currentProject);
            }

            // Load lineage data
            const savedLineage = localStorage.getItem(lineageStorageKey);
            const lineageData = savedLineage ? JSON.parse(savedLineage) : defaultFamilyHead;
            setFamilyHead(lineageData);

            // Load folder data
            const savedFolders = localStorage.getItem(folderStorageKey);
            if (savedFolders) {
                setFolders(JSON.parse(savedFolders));
            } else {
                // Auto-generate folders from initial lineage data if no folders are saved
                const initialSurveyNumbers = new Set<string>();
                const collectSurveyNumbers = (person: Person) => {
                    (person.landRecords || []).forEach(rec => initialSurveyNumbers.add(rec.surveyNumber));
                    (person.heirs || []).forEach(collectSurveyNumbers);
                };
                collectSurveyNumbers(lineageData);
                const surveyFolders = Array.from(initialSurveyNumbers).map(createSurveyFolder);
                const kycFolder: Folder = {
                    id: `kyc-root-${Date.now()}`,
                    name: 'Seller KYC',
                    children: [],
                };
                setFolders([...surveyFolders, kycFolder]);
            }
        } catch (e) {
            console.error("Could not load project data", e);
        }
        setLoading(false);
        setIsLoaded(true);
    }, [projectId, lineageStorageKey, folderStorageKey]);

    useEffect(() => {
        if (isLoaded && familyHead) {
            try {
                localStorage.setItem(lineageStorageKey, JSON.stringify(familyHead));
                localStorage.setItem(folderStorageKey, JSON.stringify(folders));
            } catch (e) {
                console.error("Could not save project data to local storage", e);
            }
        }
    }, [familyHead, folders, isLoaded, lineageStorageKey, folderStorageKey]);

    const handleAddHeir = useCallback((parentId: string, heirData: Omit<Person, 'id' | 'heirs' | 'landRecords'>) => {
        if (!familyHead) return;
        const updatedFamilyHead = addHeirToFamily(familyHead, parentId, heirData);
        setFamilyHead(updatedFamilyHead);
    }, [familyHead]);

    const handleUpdatePerson = useCallback((personId: string, personData: Omit<Person, 'id' | 'heirs'>) => {
        if (!familyHead) return;

        const oldPersonState = findPerson(familyHead, personId);
        const oldSurveyNumbers = new Set(oldPersonState?.landRecords.map(lr => lr.surveyNumber) || []);
        
        const updatedFamilyHead = updatePersonInFamily(familyHead, personId, personData);
        setFamilyHead(updatedFamilyHead);

        const newSurveyNumbers = new Set(personData.landRecords.map(lr => lr.surveyNumber));
        const addedSurveyNumbers = [...newSurveyNumbers].filter(sn => !oldSurveyNumbers.has(sn));

        if (addedSurveyNumbers.length > 0) {
            setFolders(currentFolders => {
                const existingFolderNames = new Set(currentFolders.map(f => f.name));
                const newFoldersToAdd = addedSurveyNumbers
                    .filter(surveyNumber => !existingFolderNames.has(surveyNumber))
                    .map(createSurveyFolder);
                return [...currentFolders, ...newFoldersToAdd];
            });
        }
    }, [familyHead]);

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
                <TabsList className="grid w-full grid-cols-4 md:w-auto md:inline-flex">
                    <TabsTrigger value="lineage">Family Lineage</TabsTrigger>
                    <TabsTrigger value="title-documents">Title Documents</TabsTrigger>
                    <TabsTrigger value="transactions">Transaction History</TabsTrigger>
                    <TabsTrigger value="files">Files &amp; Documents</TabsTrigger>
                </TabsList>
                <TabsContent value="lineage" className="mt-6">
                    <LineageView 
                        familyHead={familyHead}
                        onAddHeir={handleAddHeir}
                        onUpdatePerson={handleUpdatePerson}
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
            </Tabs>
        </div>
    );
}
