
'use client';

import { useState, FC } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Trash2, ArrowLeft, UserPlus, Milestone } from "lucide-react";
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import type { Project, Person, SurveyRecord, LandClassification, Transaction } from '@/types';
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { createDefaultFolders } from '@/lib/project-template';
import { Badge } from '@/components/ui/badge';

const PROJECTS_STORAGE_KEY = 'projects';


const AddHeirForm: FC<{
    parentId: string;
    parentName: string;
    onAddHeir: (parentId: string, heir: Person) => void;
    onClose: () => void;
}> = ({ parentId, parentName, onAddHeir, onClose }) => {
    const [name, setName] = useState('');
    const [relation, setRelation] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState<Person['gender']>('Male');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newHeir: Person = {
            id: `heir-${parentId}-${Date.now()}`,
            name,
            relation,
            age: parseInt(age, 10) || 0,
            gender,
            maritalStatus: 'Single',
            status: 'Alive',
            landRecords: [],
            heirs: [],
        };
        onAddHeir(parentId, newHeir);
        onClose();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
             <DialogHeader>
                <DialogTitle>Add Heir to {parentName}</DialogTitle>
                <DialogDescription>Enter the details for the new heir.</DialogDescription>
             </DialogHeader>
             <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="space-y-2"><Label>Name</Label><Input value={name} onChange={e => setName(e.target.value)} required /></div>
                <div className="space-y-2"><Label>Relation</Label><Input value={relation} onChange={e => setRelation(e.target.value)} required /></div>
                <div className="space-y-2"><Label>Age</Label><Input type="number" value={age} onChange={e => setAge(e.target.value)} required /></div>
                <div className="space-y-2"><Label>Gender</Label><Select value={gender} onValueChange={(v: Person['gender']) => setGender(v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent></Select></div>
             </div>
             <div className="flex justify-end gap-2 pt-4"><Button type="button" variant="ghost" onClick={onClose}>Cancel</Button><Button type="submit">Add Heir</Button></div>
        </form>
    )
}

const HeirCard: FC<{ person: Person; onAddHeir: (parentId: string, heir: Person) => void; level?: number }> = ({ person, onAddHeir, level = 0 }) => {
    const [isAddHeirOpen, setIsAddHeirOpen] = useState(false);
    return (
        <div style={{ marginLeft: `${level * 20}px` }} className="mt-2 p-3 border rounded-md bg-muted/30">
            <div className="flex items-center justify-between">
                <div>
                    <p className="font-semibold">{person.name} <span className="text-sm font-normal text-muted-foreground">({person.relation})</span></p>
                    <p className="text-xs text-muted-foreground">Age: {person.age}, Gender: {person.gender}</p>
                </div>
                 <Dialog open={isAddHeirOpen} onOpenChange={setIsAddHeirOpen}>
                    <DialogTrigger asChild><Button variant="ghost" size="sm"><UserPlus className="mr-2 h-4 w-4" />Add Heir</Button></DialogTrigger>
                    <DialogContent>
                        <AddHeirForm parentId={person.id} parentName={person.name} onAddHeir={onAddHeir} onClose={() => setIsAddHeirOpen(false)} />
                    </DialogContent>
                </Dialog>
            </div>
            {person.heirs.map(heir => <HeirCard key={heir.id} person={heir} onAddHeir={onAddHeir} level={level + 1} />)}
        </div>
    )
}


export default function CreateProjectPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [isAddHeirOpen, setIsAddHeirOpen] = useState(false);

    // Project Details
    const [projectName, setProjectName] = useState('');
    const [projectSiteId, setProjectSiteId] = useState('');
    const [projectLocation, setProjectLocation] = useState('');
    const [googleMapsLink, setGoogleMapsLink] = useState('');

    // Family Head Details
    const [familyHead, setFamilyHead] = useState<Person>({
        id: `owner-${Date.now()}`,
        name: '',
        relation: 'Family Head',
        age: 40,
        gender: 'Male',
        maritalStatus: 'Married',
        status: 'Alive',
        sourceOfLand: 'Self Acquired',
        holdingPattern: 'Individual',
        landRecords: [],
        heirs: [],
    });
    
    // Transaction History
    const [transactions, setTransactions] = useState<Omit<Transaction, 'id'>[]>([]);
    const [newTxOwner, setNewTxOwner] = useState('');
    const [newTxSourceName, setNewTxSourceName] = useState('');
    const [newTxMode, setNewTxMode] = useState<Transaction['mode']>('Purchase');
    const [newTxYear, setNewTxYear] = useState('');
    const [newTxDoc, setNewTxDoc] = useState('');

    const handleFamilyHeadChange = (field: keyof Person, value: any) => {
        setFamilyHead(prev => ({ ...prev, [field]: value }));
    };

    const handleAddLandRecord = (record: Omit<SurveyRecord, 'id'>) => {
        handleFamilyHeadChange('landRecords', [
            ...familyHead.landRecords,
            { ...record, id: `lr-${familyHead.id}-${Date.now()}` }
        ]);
    };

    const handleDeleteLandRecord = (index: number) => {
        handleFamilyHeadChange('landRecords', familyHead.landRecords.filter((_, i) => i !== index));
    };

    const addHeirToFamily = (parentId: string, newHeir: Person) => {
        const addHeirRecursive = (people: Person[]): Person[] => {
            return people.map(p => {
                if (p.id === parentId) {
                    return { ...p, heirs: [...p.heirs, newHeir] };
                }
                return { ...p, heirs: addHeirRecursive(p.heirs) };
            });
        };
        setFamilyHead(prev => ({...prev, heirs: addHeirRecursive(prev.heirs)}));
    };
    
    const handleAddTransaction = () => {
        if (!newTxOwner || !newTxSourceName || !newTxYear) {
            toast({ variant: 'destructive', title: 'Missing Transaction Info', description: 'Please provide Owner, Source Name, and Year.' });
            return;
        }
        setTransactions([...transactions, {
            owner: newTxOwner,
            sourceName: newTxSourceName,
            mode: newTxMode,
            year: parseInt(newTxYear, 10) || 0,
            doc: newTxDoc,
        }]);
        // Reset fields
        setNewTxOwner(''); setNewTxSourceName(''); setNewTxYear(''); setNewTxDoc('');
    };

    const handleDeleteTransaction = (index: number) => {
        setTransactions(transactions.filter((_, i) => i !== index));
    };


    const handleSaveProject = (e: React.FormEvent) => {
        e.preventDefault();

        // --- Validation ---
        if (!projectName || !projectSiteId || !projectLocation) {
            toast({ variant: 'destructive', title: 'Missing Project Details', description: 'Please fill in all project details.' });
            return;
        }
        if (!familyHead.name || !familyHead.age) {
            toast({ variant: 'destructive', title: 'Missing Family Head Details', description: 'Please fill in the family head\'s name and age.' });
            return;
        }
        if (familyHead.landRecords.length === 0) {
            toast({ variant: 'destructive', title: 'No Land Records', description: 'Please add at least one land record for the family head.' });
            return;
        }

        const newProjectId = `proj-${Date.now()}`;
        
        const newProject: Project = {
            id: newProjectId,
            name: projectName,
            siteId: projectSiteId,
            location: projectLocation,
            googleMapsLink: googleMapsLink,
        };
        
        const finalTransactions: Transaction[] = transactions.map((tx, i) => ({
            ...tx,
            id: `tx-${newProjectId}-${i}`
        }));
        
        try {
            const allProjects: Project[] = JSON.parse(localStorage.getItem(PROJECTS_STORAGE_KEY) || '[]');
            localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify([...allProjects, newProject]));
            localStorage.setItem(`lineage-data-${newProjectId}`, JSON.stringify([familyHead]));
            localStorage.setItem(`transactions-${newProjectId}`, JSON.stringify(finalTransactions));
            localStorage.setItem(`acquisition-status-${newProjectId}`, '[]');
            localStorage.setItem(`document-folders-${newProjectId}`, JSON.stringify(createDefaultFolders([familyHead])));
            
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
                {/* Project Details */}
                <Card>
                    <CardHeader><CardTitle>Project Details</CardTitle></CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2"><Label>Project Name</Label><Input value={projectName} onChange={(e) => setProjectName(e.target.value)} required /></div>
                        <div className="space-y-2"><Label>Site ID</Label><Input value={projectSiteId} onChange={(e) => setProjectSiteId(e.target.value)} required /></div>
                        <div className="space-y-2"><Label>Location</Label><Input value={projectLocation} onChange={(e) => setProjectLocation(e.target.value)} required /></div>
                        <div className="space-y-2"><Label>Google Maps Link</Label><Input value={googleMapsLink} onChange={(e) => setGoogleMapsLink(e.target.value)} placeholder="Optional URL..." /></div>
                    </CardContent>
                </Card>

                {/* Family Lineage */}
                <Card>
                    <CardHeader><CardTitle>Initial Family Lineage</CardTitle><CardDescription>Enter details for the primary family head, their heirs, and their land.</CardDescription></CardHeader>
                    <CardContent className="space-y-6">
                        {/* Family Head */}
                        <div className="p-4 border rounded-lg">
                            <h3 className="text-lg font-semibold mb-4">Family Head</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div className="space-y-2"><Label>Name</Label><Input value={familyHead.name} onChange={e => handleFamilyHeadChange('name', e.target.value)} required /></div>
                                <div className="space-y-2"><Label>Age</Label><Input type="number" value={familyHead.age || ''} onChange={e => handleFamilyHeadChange('age', parseInt(e.target.value, 10))} required /></div>
                                <div className="space-y-2"><Label>Gender</Label><Select value={familyHead.gender} onValueChange={(v: Person['gender']) => handleFamilyHeadChange('gender', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent></Select></div>
                                <div className="space-y-2"><Label>Marital Status</Label><Select value={familyHead.maritalStatus} onValueChange={(v: Person['maritalStatus']) => handleFamilyHeadChange('maritalStatus', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Single">Single</SelectItem><SelectItem value="Married">Married</SelectItem><SelectItem value="Divorced">Divorced</SelectItem><SelectItem value="Widowed">Widowed</SelectItem></SelectContent></Select></div>
                                <div className="space-y-2"><Label>Status</Label><Select value={familyHead.status} onValueChange={(v: Person['status']) => handleFamilyHeadChange('status', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Alive">Alive</SelectItem><SelectItem value="Died">Died</SelectItem><SelectItem value="Missing">Missing</SelectItem><SelectItem value="Unknown">Unknown</SelectItem></SelectContent></Select></div>
                                <div className="space-y-2"><Label>Source of Land</Label><Select value={familyHead.sourceOfLand} onValueChange={(v) => handleFamilyHeadChange('sourceOfLand', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Self Acquired">Self Acquired</SelectItem><SelectItem value="Inherited">Inherited</SelectItem><SelectItem value="Gift">Gift</SelectItem><SelectItem value="Settlement">Settlement</SelectItem></SelectContent></Select></div>
                                <div className="space-y-2"><Label>Holding Pattern</Label><Select value={familyHead.holdingPattern} onValueChange={(v) => handleFamilyHeadChange('holdingPattern', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Individual">Individual</SelectItem><SelectItem value="Company">Company</SelectItem><SelectItem value="Trust">Trust</SelectItem></SelectContent></Select></div>
                            </div>
                        </div>
                        {/* Heirs */}
                        <div className="p-4 border rounded-lg">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold flex items-center gap-2"><Milestone /> Heirs</h3>
                                <Dialog open={isAddHeirOpen} onOpenChange={setIsAddHeirOpen}>
                                    <DialogTrigger asChild><Button type="button" disabled={!familyHead.name}><UserPlus className="mr-2 h-4 w-4"/>Add Heir to Family Head</Button></DialogTrigger>
                                    <DialogContent>
                                        <AddHeirForm parentId={familyHead.id} parentName={familyHead.name} onAddHeir={addHeirToFamily} onClose={() => setIsAddHeirOpen(false)} />
                                    </DialogContent>
                                </Dialog>
                            </div>
                            {familyHead.heirs.length > 0 ? (
                                familyHead.heirs.map(heir => <HeirCard key={heir.id} person={heir} onAddHeir={addHeirToFamily} />)
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-4">No heirs added yet.</p>
                            )}
                        </div>
                        {/* Land Records */}
                        <LandRecordsForm records={familyHead.landRecords} onAdd={handleAddLandRecord} onDelete={handleDeleteLandRecord} />
                    </CardContent>
                </Card>
                
                {/* Transaction History */}
                <Card>
                    <CardHeader><CardTitle>Transaction History</CardTitle><CardDescription>Add initial transaction records for this project.</CardDescription></CardHeader>
                    <CardContent className="space-y-6">
                        {transactions.length > 0 && (
                            <ul className="space-y-2">
                                {transactions.map((tx, index) => (
                                    <li key={index} className="flex items-center justify-between p-2 border rounded-md bg-muted/50 text-sm">
                                        <span>Owner: <strong>{tx.owner}</strong>, Source: <strong>{tx.sourceName}</strong>, Year: <strong>{tx.year}</strong></span>
                                        <Button type="button" variant="ghost" size="icon" onClick={() => handleDeleteTransaction(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                    </li>
                                ))}
                            </ul>
                        )}
                         <div className="p-4 border-2 border-dashed rounded-lg space-y-4">
                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
                                <div className="space-y-2"><Label>Owner</Label><Input value={newTxOwner} onChange={e => setNewTxOwner(e.target.value)} /></div>
                                <div className="space-y-2"><Label>Source Name</Label><Input value={newTxSourceName} onChange={e => setNewTxSourceName(e.target.value)} /></div>
                                <div className="space-y-2"><Label>Year</Label><Input type="number" value={newTxYear} onChange={e => setNewTxYear(e.target.value)} /></div>
                                <div className="space-y-2"><Label>Doc Number</Label><Input value={newTxDoc} onChange={e => setNewTxDoc(e.target.value)} /></div>
                                <div className="space-y-2"><Label>Source Mode</Label><Select value={newTxMode} onValueChange={(v: Transaction['mode']) => setNewTxMode(v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Purchase">Purchase</SelectItem><SelectItem value="Legal Heir">Legal Heir</SelectItem><SelectItem value="Gift">Gift</SelectItem><SelectItem value="Settlement">Settlement</SelectItem></SelectContent></Select></div>
                             </div>
                             <Button type="button" onClick={handleAddTransaction}><PlusCircle className="mr-2 h-4 w-4" />Add Transaction</Button>
                         </div>
                    </CardContent>
                </Card>
                
                <div className="flex justify-end pt-4">
                    <Button type="submit" size="lg">Save Project & Continue</Button>
                </div>
            </form>
        </div>
    );
}


// --- Sub-component for Land Records Form ---
const LandRecordsForm: FC<{
    records: SurveyRecord[],
    onAdd: (record: Omit<SurveyRecord, 'id'>) => void,
    onDelete: (index: number) => void
}> = ({ records, onAdd, onDelete }) => {
    const [newSurveyNumber, setNewSurveyNumber] = useState('');
    const [newAcres, setNewAcres] = useState('');
    const [newCents, setNewCents] = useState('');
    const [newClassification, setNewClassification] = useState<LandClassification>('Wet');
    const { toast } = useToast();

    const handleAddClick = () => {
        if (!newSurveyNumber.trim() || (!newAcres.trim() && !newCents.trim())) {
            toast({ variant: 'destructive', title: 'Missing Information', description: 'Please provide a survey number and either acres or cents.' });
            return;
        }
        onAdd({
            surveyNumber: newSurveyNumber,
            acres: newAcres,
            cents: newCents,
            landClassification: newClassification,
        });
        // Reset fields
        setNewSurveyNumber(''); setNewAcres(''); setNewCents('');
    };

    return (
        <div className="p-4 border rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Land Records</h3>
             {records.length > 0 && (
                <ul className="space-y-2 mb-4">
                    {records.map((rec, index) => (
                        <li key={rec.id} className="flex items-center justify-between p-2 border rounded-md bg-muted/50 text-sm">
                            <span>S.No: <strong>{rec.surveyNumber}</strong>, Extent: <strong>{rec.acres || '0'}ac {rec.cents || '0'}c</strong>, Class: <strong>{rec.landClassification}</strong></span>
                            <Button type="button" variant="ghost" size="icon" onClick={() => onDelete(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </li>
                    ))}
                </ul>
            )}
             <div className="p-4 border-2 border-dashed rounded-lg space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                    <div className="space-y-2"><Label>Survey/Sub-Div No.</Label><Input value={newSurveyNumber} onChange={e => setNewSurveyNumber(e.target.value)} /></div>
                    <div className="space-y-2"><Label>Acres</Label><Input type="number" step="any" value={newAcres} onChange={e => setNewAcres(e.target.value)} /></div>
                    <div className="space-y-2"><Label>Cents</Label><Input type="number" step="any" value={newCents} onChange={e => setNewCents(e.target.value)} /></div>
                    <div className="space-y-2"><Label>Classification</Label><Select value={newClassification} onValueChange={(v: LandClassification) => setNewClassification(v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Wet">Wet</SelectItem><SelectItem value="Dry">Dry</SelectItem><SelectItem value="Unclassified">Unclassified</SelectItem></SelectContent></Select></div>
                 </div>
                 <Button type="button" onClick={handleAddClick}><PlusCircle className="mr-2 h-4 w-4" />Add Land Record</Button>
             </div>
        </div>
    )
}
