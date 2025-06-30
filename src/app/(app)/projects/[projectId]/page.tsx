
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { LineageView } from "@/components/lineage/lineage-view";
import { TransactionHistory } from "@/components/transactions/transaction-history";
import { FileManager } from "@/components/files/file-manager";
import { ArrowLeft, Loader2, Edit, MapPin, AreaChart, Users2, Droplets, Sun, FileUp, ChevronDown, LayoutDashboard, Briefcase, Landmark as LandmarkIcon, BarChart3 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';
import { TitleDocumentsView } from '@/components/documents/title-documents-view';
import { Notes } from '@/components/project/notes';
import { Tasks } from '@/components/project/tasks';
import { LegalNotes } from '@/components/project/legal-notes';
import { AcquisitionTrackerView } from '@/components/acquisition/acquisition-tracker-view';
import type { User, Project, Person, Folder, AcquisitionStatus, DocumentFile } from '@/types';
import { SiteSketchView } from '@/components/sketch/site-sketch-view';
import { siteSketchData } from '@/lib/site-sketch-data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { ProjectMap } from '@/components/project/project-map';
import { roadData } from '@/lib/road-data';
import { MindMapView } from '@/components/mindmap/mind-map-view';
import { Progress } from "@/components/ui/progress";
import { createOwnersMap, createInitialOwners, createDefaultAcquisitionStatus, createDefaultFolders, initializeNewProjectData } from '@/lib/project-template';
import { SiteAcquisitionChart } from '@/components/acquisition/site-acquisition-chart';


// --- Storage Keys ---
const PROJECTS_STORAGE_KEY = 'projects';
const USERS_STORAGE_KEY = 'users';

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
    
    // --- Navigation State ---
    const [activeView, setActiveView] = useState('dashboard');
    const [activeStatusId, setActiveStatusId] = useState<string | undefined>(undefined);
    
    const [siteSketchPdf, setSiteSketchPdf] = useState<string | null>(null);
    
    const [isEditProjectDialogOpen, setIsEditProjectDialogOpen] = useState(false);
    const [editedProjectName, setEditedProjectName] = useState('');
    const [editedProjectSiteId, setEditedProjectSiteId] = useState('');
    const [editedProjectLocation, setEditedProjectLocation] = useState('');
    const [editedGoogleMapsLink, setEditedGoogleMapsLink] = useState('');

    const ownersStorageKey = useMemo(() => `lineage-data-${projectId}`, [projectId]);
    const folderStorageKey = useMemo(() => `document-folders-${projectId}`, [projectId]);
    const acquisitionStorageKey = useMemo(() => `acquisition-status-${projectId}`, [projectId]);
    const siteSketchStorageKey = useMemo(() => `site-sketch-pdf-${projectId}`, [projectId]);

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
            
            const savedUsers = localStorage.getItem(USERS_STORAGE_KEY);
            if (savedUsers) {
                const users: User[] = JSON.parse(savedUsers);
                if (users.length > 0) setCurrentUser(users[0]);
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
            let loadedStatuses = JSON.parse(localStorage.getItem(acquisitionStorageKey) || 'null');
            let loadedFolders = JSON.parse(localStorage.getItem(folderStorageKey) || 'null');
            const savedPdf = localStorage.getItem(siteSketchStorageKey);
            if (savedPdf) setSiteSketchPdf(savedPdf);
            
            const isDataMissing = !loadedOwners || !loadedStatuses || !loadedFolders;

            if (isDataMissing) {
                toast({
                    title: "Initializing Project",
                    description: "Setting up default data for this project..."
                });
                initializeNewProjectData(projectId);
                
                loadedOwners = JSON.parse(localStorage.getItem(ownersStorageKey) || 'null');
                loadedStatuses = JSON.parse(localStorage.getItem(acquisitionStorageKey) || 'null');
                loadedFolders = JSON.parse(localStorage.getItem(folderStorageKey) || 'null');
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
    }, [projectId, ownersStorageKey, folderStorageKey, acquisitionStorageKey, siteSketchStorageKey, activeStatusId, toast]);

    const updateAndPersistOwners = useCallback((newOwners: Person[]) => {
        setOwners(newOwners);
        localStorage.setItem(ownersStorageKey, JSON.stringify(newOwners));
    }, [ownersStorageKey]);

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
    }, [folders, folderStorageKey]);

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
    }, [folders, folderStorageKey]);


    const handlePdfUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type === 'application/pdf') {
            const reader = new FileReader();
            reader.onload = (e) => {
                const dataUrl = e.target?.result as string;
                setSiteSketchPdf(dataUrl);
                localStorage.setItem(siteSketchStorageKey, dataUrl);
                toast({ title: "Site sketch uploaded successfully." });
            };
            reader.readAsDataURL(file);
        } else {
            toast({ variant: 'destructive', title: "Invalid file", description: "Please upload a valid PDF file." });
        }
    };
    
    const projectStats = useMemo(() => {
        let totalAcres = 0;
        let totalCents = 0;
        const ownerCount = owners.length;

        owners.forEach(owner => {
            (owner.landRecords || []).forEach(rec => {
                totalAcres += parseFloat(rec.acres || '0');
                totalCents += parseFloat(rec.cents || '0');
            });
        });

        if (totalCents >= 100) {
            totalAcres += Math.floor(totalCents / 100);
            totalCents %= 100;
        }

        const wetPlots = siteSketchData.filter(p => p.classification === 'Wet').length;
        const dryPlots = siteSketchData.filter(p => p.classification === 'Dry').length;

        return {
            totalAcres: totalAcres.toFixed(2),
            totalCents: totalCents.toFixed(2),
            ownerCount,
            wetPlots,
            dryPlots,
        };
    }, [owners]);
    
    const progressStats = useMemo(() => {
        if (!acquisitionStatuses || acquisitionStatuses.length === 0) {
            return {
                advancePaidPercent: 0,
                meetingsDonePercent: 0,
                docsCollectedPercent: 0,
            };
        }

        const total = acquisitionStatuses.length;
        
        const advancePaidCount = acquisitionStatuses.filter(s => s.financials.advancePayment === 'Paid').length;
        const meetingsDoneCount = acquisitionStatuses.filter(s => !!s.operations.meetingDate).length;
        const docsCollectedCount = acquisitionStatuses.filter(s => s.operations.documentCollection === 'Fully Collected').length;

        return {
            advancePaidPercent: Math.round((advancePaidCount / total) * 100),
            meetingsDonePercent: Math.round((meetingsDoneCount / total) * 100),
            docsCollectedPercent: Math.round((docsCollectedCount / total) * 100),
        };
    }, [acquisitionStatuses]);


    const allSurveyNumbers = useMemo(() => Array.from(new Set(siteSketchData.map(d => d.surveyNumber))), []);
    
    const handleSelectSurvey = useCallback((statusId: string) => { 
        setActiveStatusId(statusId);
        setActiveView('acquisition-tracker');
    }, []);

    const currentUserRole = currentUser?.role;
    const canSeeSensitiveTabs = currentUserRole === 'Super Admin';
    const canSeeLegalNotes = currentUserRole === 'Super Admin' || currentUserRole === 'Lawyer';


    if (loading) {
        return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>
    }

    if (!project) {
        return (
            <div className="p-4 sm:p-6 lg:p-8 text-center">
                <Button variant="ghost" asChild className="mb-4">
                    <Link href="/dashboard"><ArrowLeft className="mr-2 h-4 w-4" />Back to Projects</Link>
                </Button>
                <h1 className="text-2xl font-bold">Project not found</h1>
                <p className="text-muted-foreground">The project you are looking for does not exist.</p>
            </div>
        )
    }

    const renderActiveView = () => {
        switch(activeView) {
            case 'lineage':
                return <LineageView familyHeads={owners} onAddHeir={handleAddHeir} onUpdatePerson={handleUpdatePerson} onImport={(newOwners) => updateAndPersistOwners(newOwners)}/>;
            case 'acquisition-tracker':
                return <AcquisitionTrackerView statuses={acquisitionStatuses} onUpdateStatus={handleUpdateAcquisitionStatus} activeStatusId={activeStatusId} onActiveStatusChange={setActiveStatusId} />;
            case 'acquisition-chart':
                return <SiteAcquisitionChart projectId={projectId} />;
            case 'title-documents':
                return <TitleDocumentsView folders={folders} onAddFolder={handleAddFolder} onDeleteFolder={handleDeleteFolder} onAddFile={handleAddFileToFolder} onDeleteFile={handleDeleteFileFromFolder} />;
            case 'transactions':
                return <TransactionHistory projectId={projectId} />;
            case 'files':
                return <FileManager projectId={projectId} />;
            case 'legal-notes':
                return canSeeLegalNotes ? <LegalNotes projectId={projectId} surveyNumbers={allSurveyNumbers} currentUser={currentUser} /> : null;
            case 'notes':
                 return canSeeSensitiveTabs ? <Notes projectId={projectId} /> : null;
            case 'tasks':
                return canSeeSensitiveTabs ? <Tasks projectId={projectId} /> : null;
            case 'dashboard':
            default:
                return (
                    <div className="space-y-8">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Extent</CardTitle><AreaChart className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{projectStats.totalAcres} Acres</div><p className="text-xs text-muted-foreground">{projectStats.totalCents} Cents</p></CardContent></Card>
                            <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Number of Owners</CardTitle><Users2 className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{projectStats.ownerCount}</div><p className="text-xs text-muted-foreground">Unique family heads</p></CardContent></Card>
                            <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Wet Land Plots</CardTitle><Droplets className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{projectStats.wetPlots}</div><p className="text-xs text-muted-foreground">Count of wet land parcels</p></CardContent></Card>
                            <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Dry Land Plots</CardTitle><Sun className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{projectStats.dryPlots}</div><p className="text-xs text-muted-foreground">Count of dry land parcels</p></CardContent></Card>
                        </div>
                        
                        <Card className="overflow-hidden">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><MapPin /> Site Location & Major Roads</CardTitle>
                                    <CardDescription>
                                    Showing project context with key transportation corridors.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="aspect-video w-full rounded-md overflow-hidden border animate-in fade-in duration-500">
                                    <ProjectMap />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 mt-4 text-sm">
                                    {roadData.map(road => (
                                        <div key={road.name} className="flex items-center gap-2">
                                            <span className="h-4 w-4 rounded" style={{ backgroundColor: road.color }} />
                                            <span>{road.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                        <Card><CardHeader><CardTitle>Site Sketch</CardTitle><CardDescription>Upload and view the official site sketch PDF.</CardDescription></CardHeader><CardContent>{siteSketchPdf ? (<div className="aspect-[4/5]"><iframe src={siteSketchPdf} title="Site Sketch" width="100%" height="100%" className="rounded-md border"/></div>) : (<div className="aspect-[4/5] flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg text-center"><FileUp className="h-10 w-10 text-muted-foreground mb-4" /><p className="mb-4 font-semibold">No Site Sketch Uploaded</p><Button asChild size="sm"><label htmlFor="pdf-upload" className="cursor-pointer">Upload PDF</label></Button><Input id="pdf-upload" type="file" accept="application/pdf" className="hidden" onChange={handlePdfUpload} /></div>)}</CardContent></Card>
                        <Card><CardHeader><CardTitle>Photo &amp; Video Gallery</CardTitle><CardDescription>Visuals from the project site.</CardDescription></CardHeader><CardContent><Carousel className="w-full"><CarouselContent>{Array.from({ length: 3 }).map((_, index) => (<CarouselItem key={index}><div className="p-1"><Card><CardContent className="flex aspect-video items-center justify-center p-0"><Image src={`https://placehold.co/600x400.png`} width={600} height={400} alt={`Placeholder ${index + 1}`} data-ai-hint="landscape field" className="rounded-lg object-cover w-full h-full" /></CardContent></Card></div></CarouselItem>))}</CarouselContent><CarouselPrevious /><CarouselNext /></Carousel></CardContent></Card>

                        <div>
                            <SiteSketchView acquisitionStatuses={acquisitionStatuses} onSelectSurvey={handleSelectSurvey} />
                        </div>

                        <div>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Project Progress Dashboard</CardTitle>
                                    <CardDescription>A high-level overview of key acquisition milestones.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-2">
                                        <Label>Advance Payments ({progressStats.advancePaidPercent}%)</Label>
                                        <Progress value={progressStats.advancePaidPercent} />
                                        <p className="text-sm text-muted-foreground">Percentage of land parcels where an advance has been paid.</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>In-Person Meetings ({progressStats.meetingsDonePercent}%)</Label>
                                        <Progress value={progressStats.meetingsDonePercent} />
                                        <p className="text-sm text-muted-foreground">Percentage of owners who have had an in-person meeting.</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Document Collection ({progressStats.docsCollectedPercent}%)</Label>
                                        <Progress value={progressStats.docsCollectedPercent} />
                                        <p className="text-sm text-muted-foreground">Percentage of land parcels with fully collected documents.</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                        
                        <div>
                            <MindMapView projectName={project.name} familyHeads={owners} />
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-4">
            <header className="flex items-center justify-between">
                <div>
                    <Button variant="ghost" asChild className="mb-2 -ml-4"><Link href="/dashboard"><ArrowLeft className="mr-2 h-4 w-4" />Back to Projects</Link></Button>
                    <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
                    <p className="text-muted-foreground">Project ID: {project.siteId} &middot; {project.location}</p>
                </div>
                 <Dialog open={isEditProjectDialogOpen} onOpenChange={setIsEditProjectDialogOpen}>
                    <DialogTrigger asChild><Button variant="outline"><Edit className="mr-2 h-4 w-4" />Edit Project</Button></DialogTrigger>
                    <DialogContent className="sm:max-w-xl">
                        <DialogHeader><DialogTitle>Edit Project Details</DialogTitle><DialogDescription>Make changes to your project here. Click save when you're done.</DialogDescription></DialogHeader>
                        <form onSubmit={handleUpdateProject}>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="edit-name" className="text-right">Name</Label><Input id="edit-name" value={editedProjectName} onChange={(e) => setEditedProjectName(e.target.value)} className="col-span-3" required /></div>
                                <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="edit-siteId" className="text-right">Site ID</Label><Input id="edit-siteId" value={editedProjectSiteId} onChange={(e) => setEditedProjectSiteId(e.target.value)} className="col-span-3" required /></div>
                                <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="edit-location" className="text-right">Location</Label><Input id="edit-location" value={editedProjectLocation} onChange={(e) => setEditedProjectLocation(e.target.value)} className="col-span-3" required /></div>
                                <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="edit-googleMapsLink" className="text-right">Map Link</Label><Input id="edit-googleMapsLink" value={editedGoogleMapsLink} onChange={(e) => setEditedGoogleMapsLink(e.target.value)} className="col-span-3" placeholder="Google Maps URL..."/></div>
                            </div>
                            <DialogFooter><Button type="submit">Save Changes</Button></DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </header>

            {/* --- Main Navigation Bar --- */}
            <nav className="border-b sticky top-0 bg-background/95 backdrop-blur-sm z-10 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-2">
                    <Button variant={activeView === 'dashboard' ? 'secondary' : 'ghost'} onClick={() => setActiveView('dashboard')}>
                        <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
                    </Button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant={['lineage', 'notes', 'tasks', 'files', 'acquisition-chart'].includes(activeView) ? 'secondary' : 'ghost'}>
                               <Briefcase className="mr-2 h-4 w-4" /> Workspace <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                            <DropdownMenuItem onClick={() => setActiveView('lineage')}>Family Lineage</DropdownMenuItem>
                             <DropdownMenuItem onClick={() => setActiveView('acquisition-chart')}>Site Acquisition Chart</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setActiveView('files')}>Files &amp; Documents</DropdownMenuItem>
                            {canSeeSensitiveTabs && <DropdownMenuItem onClick={() => setActiveView('notes')}>Notes</DropdownMenuItem>}
                            {canSeeSensitiveTabs && <DropdownMenuItem onClick={() => setActiveView('tasks')}>Tasks</DropdownMenuItem>}
                        </DropdownMenuContent>
                    </DropdownMenu>

                     <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant={['acquisition-tracker', 'title-documents', 'transactions', 'legal-notes'].includes(activeView) ? 'secondary' : 'ghost'}>
                                <LandmarkIcon className="mr-2 h-4 w-4" /> Land &amp; Legal <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                            <DropdownMenuItem onClick={() => setActiveView('acquisition-tracker')}>Acquisition Tracker</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setActiveView('title-documents')}>Title Documents</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setActiveView('transactions')}>Transaction History</DropdownMenuItem>
                             {canSeeLegalNotes && <DropdownMenuItem onClick={() => setActiveView('legal-notes')}>Legal Notes</DropdownMenuItem>}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </nav>

            <div className="pt-6">
                {renderActiveView()}
            </div>
            
        </div>
    );
}

    

    



    