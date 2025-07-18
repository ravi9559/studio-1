'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { PlusCircle, Trash2, ArrowLeft } from "lucide-react";
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import type { Project, Person, SurveyRecord, LandClassification } from '@/types';

const PROJECTS_STORAGE_KEY = 'projects';

export default function CreateProjectPage() {
    const router = useRouter();
    const { toast } = useToast();

    // Project Details
    const [projectName, setProjectName] = useState('');
    const [projectSiteId, setProjectSiteId] = useState('');
    const [projectLocation, setProjectLocation] = useState('');

    // Family Head Details
    const [fhName, setFhName] = useState('');
    const [fhAge, setFhAge] = useState('');
    const [fhGender, setFhGender] = useState<Person['gender']>('Male');
    const [fhMaritalStatus, setFhMaritalStatus] = useState<Person['maritalStatus']>('Married');
    const [fhStatus, setFhStatus] = useState<Person['status']>('Alive');
    const [fhSourceOfLand, setFhSourceOfLand] = useState('Self Acquired');
    const [fhHoldingPattern, setFhHoldingPattern] = useState('Individual');

    // Land Records
    const [landRecords, setLandRecords] = useState<Omit<SurveyRecord, 'id'>[]>([]);
    const [newSurveyNumber, setNewSurveyNumber] = useState('');
    const [newAcres, setNewAcres] = useState('');
    const [newCents, setNewCents] = useState('');
    const [newClassification, setNewClassification] = useState<LandClassification>('Wet');

    const handleAddLandRecord = () => {
        if (!newSurveyNumber.trim() || (!newAcres.trim() && !newCents.trim())) {
            toast({ variant: 'destructive', title: 'Missing Information', description: 'Please provide a survey number and either acres or cents.' });
            return;
        }
        setLandRecords([
            ...landRecords,
            {
                surveyNumber: newSurveyNumber,
                acres: newAcres,
                cents: newCents,
                landClassification: newClassification,
            }
        ]);
        // Reset fields
        setNewSurveyNumber('');
        setNewAcres('');
        setNewCents('');
    };

    const handleDeleteLandRecord = (index: number) => {
        setLandRecords(landRecords.filter((_, i) => i !== index));
    };

    const handleSaveProject = (e: React.FormEvent) => {
        e.preventDefault();

        // --- Validation ---
        if (!projectName || !projectSiteId || !projectLocation) {
            toast({ variant: 'destructive', title: 'Missing Project Details', description: 'Please fill in all project details.' });
            return;
        }
        if (!fhName || !fhAge) {
            toast({ variant: 'destructive', title: 'Missing Family Head Details', description: 'Please fill in the family head\'s name and age.' });
            return;
        }
        if (landRecords.length === 0) {
            toast({ variant: 'destructive', title: 'No Land Records', description: 'Please add at least one land record.' });
            return;
        }

        // --- Create Project and Data Structures ---
        const newProjectId = `proj-${Date.now()}`;
        
        const newProject: Project = {
            id: newProjectId,
            name: projectName,
            siteId: projectSiteId,
            location: projectLocation,
        };

        const finalLandRecords: SurveyRecord[] = landRecords.map((rec, i) => ({
            ...rec,
            id: `lr-${newProjectId}-${i}`
        }));

        const newFamilyHead: Person = {
            id: `owner-${Date.now()}`,
            name: fhName,
            relation: 'Family Head',
            age: parseInt(fhAge, 10),
            gender: fhGender,
            maritalStatus: fhMaritalStatus,
            status: fhStatus,
            sourceOfLand: fhSourceOfLand,
            holdingPattern: fhHoldingPattern,
            landRecords: finalLandRecords,
            heirs: [],
        };
        
        try {
            // --- Save Project to localStorage ---
            const allProjects: Project[] = JSON.parse(localStorage.getItem(PROJECTS_STORAGE_KEY) || '[]');
            localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify([...allProjects, newProject]));

            // --- Save Lineage Data to localStorage ---
            localStorage.setItem(`lineage-data-${newProjectId}`, JSON.stringify([newFamilyHead]));
            
            // --- Initialize other empty data structures for the new project ---
            localStorage.setItem(`acquisition-status-${newProjectId}`, '[]');
            localStorage.setItem(`document-folders-${newProjectId}`, '[]');
            localStorage.setItem(`transactions-${newProjectId}`, '[]');
            
            toast({ title: 'Project Created', description: `Project "${projectName}" has been successfully created.` });
            router.push('/dashboard');

        } catch (error) {
            console.error("Failed to create project", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to save the new project.' });
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <header className="mb-8">
                <Button variant="ghost" asChild className="mb-2 -ml-4">
                    <Link href="/dashboard"><ArrowLeft className="mr-2 h-4 w-4" />Back to Projects</Link>
                </Button>
                <h1 className="text-3xl font-bold tracking-tight">Create New Project</h1>
                <p className="text-muted-foreground">Enter the project and initial lineage details below.</p>
            </header>

            <form onSubmit={handleSaveProject} className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Section 1: Project Details</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="project-name">Project Name</Label>
                            <Input id="project-name" value={projectName} onChange={(e) => setProjectName(e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="project-siteid">Site ID</Label>
                            <Input id="project-siteid" value={projectSiteId} onChange={(e) => setProjectSiteId(e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="project-location">Location</Label>
                            <Input id="project-location" value={projectLocation} onChange={(e) => setProjectLocation(e.target.value)} required />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Section 2: Initial Family Head</CardTitle>
                        <CardDescription>Enter the details for the primary family head for this project.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="space-y-2"><Label htmlFor="fh-name">Name</Label><Input id="fh-name" value={fhName} onChange={(e) => setFhName(e.target.value)} required /></div>
                        <div className="space-y-2"><Label htmlFor="fh-age">Age</Label><Input id="fh-age" type="number" value={fhAge} onChange={(e) => setFhAge(e.target.value)} required /></div>
                        <div className="space-y-2"><Label>Gender</Label><Select value={fhGender} onValueChange={(v: Person['gender']) => setFhGender(v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent></Select></div>
                        <div className="space-y-2"><Label>Marital Status</Label><Select value={fhMaritalStatus} onValueChange={(v: Person['maritalStatus']) => setFhMaritalStatus(v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Single">Single</SelectItem><SelectItem value="Married">Married</SelectItem><SelectItem value="Divorced">Divorced</SelectItem><SelectItem value="Widowed">Widowed</SelectItem></SelectContent></Select></div>
                        <div className="space-y-2"><Label>Status</Label><Select value={fhStatus} onValueChange={(v: Person['status']) => setFhStatus(v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Alive">Alive</SelectItem><SelectItem value="Died">Died</SelectItem><SelectItem value="Missing">Missing</SelectItem><SelectItem value="Unknown">Unknown</SelectItem></SelectContent></Select></div>
                        <div className="space-y-2"><Label>Source of Land</Label><Select value={fhSourceOfLand} onValueChange={(v) => setFhSourceOfLand(v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Self Acquired">Self Acquired</SelectItem><SelectItem value="Inherited">Inherited</SelectItem><SelectItem value="Gift">Gift</SelectItem><SelectItem value="Settlement">Settlement</SelectItem></SelectContent></Select></div>
                        <div className="space-y-2"><Label>Holding Pattern</Label><Select value={fhHoldingPattern} onValueChange={(v) => setFhHoldingPattern(v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Individual">Individual</SelectItem><SelectItem value="Company">Company</SelectItem><SelectItem value="Trust">Trust</SelectItem></SelectContent></Select></div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Section 3: Land Records</CardTitle>
                        <CardDescription>Add land records for the family head.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {landRecords.length > 0 && (
                            <ul className="space-y-2">
                                {landRecords.map((rec, index) => (
                                    <li key={index} className="flex items-center justify-between p-2 border rounded-md bg-muted/50 text-sm">
                                        <span>S.No: <strong>{rec.surveyNumber}</strong>, Extent: <strong>{rec.acres || '0'}ac {rec.cents || '0'}c</strong>, Class: <strong>{rec.landClassification}</strong></span>
                                        <Button type="button" variant="ghost" size="icon" onClick={() => handleDeleteLandRecord(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                    </li>
                                ))}
                            </ul>
                        )}
                         <div className="p-4 border-2 border-dashed rounded-lg space-y-4">
                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                                <div className="space-y-2"><Label htmlFor="lr-survey">Survey/Sub-Div No.</Label><Input id="lr-survey" value={newSurveyNumber} onChange={e => setNewSurveyNumber(e.target.value)} /></div>
                                <div className="space-y-2"><Label htmlFor="lr-acres">Acres</Label><Input id="lr-acres" type="number" step="any" value={newAcres} onChange={e => setNewAcres(e.target.value)} /></div>
                                <div className="space-y-2"><Label htmlFor="lr-cents">Cents</Label><Input id="lr-cents" type="number" step="any" value={newCents} onChange={e => setNewCents(e.target.value)} /></div>
                                <div className="space-y-2"><Label>Classification</Label><Select value={newClassification} onValueChange={(v: LandClassification) => setNewClassification(v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Wet">Wet</SelectItem><SelectItem value="Dry">Dry</SelectItem><SelectItem value="Unclassified">Unclassified</SelectItem></SelectContent></Select></div>
                             </div>
                             <Button type="button" onClick={handleAddLandRecord}><PlusCircle className="mr-2 h-4 w-4" />Add Land Record</Button>
                         </div>
                    </CardContent>
                </Card>
                
                <div className="flex justify-end pt-4">
                    <Button type="submit" size="lg">Save Project</Button>
                </div>
            </form>
        </div>
    );
}
