
'use client';

import type { FC } from 'react';
import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, UserPlus, Edit, Trash2, Milestone, Scale } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from '../ui/separator';
import type { Person, SurveyRecord, LandClassification } from '@/types';

interface PersonCardProps {
  person: Person;
  onAddHeir: (parentId: string, heirData: Omit<Person, 'id' | 'heirs' | 'landRecords'>) => void;
  onUpdatePerson: (personId: string, personData: Omit<Person, 'id' | 'heirs'>) => void;
  isFamilyHead?: boolean;
}

const statusColors: { [key in Person['status']]: string } = {
  Alive: 'bg-green-500',
  Died: 'bg-gray-500',
  Missing: 'bg-yellow-500',
  Unknown: 'bg-blue-500',
};

// A form component for adding an heir
const AddHeirForm: FC<{ personName: string, parentId: string, onAddHeir: PersonCardProps['onAddHeir'], closeDialog: () => void }> = ({ personName, parentId, onAddHeir, closeDialog }) => {
    const [name, setName] = useState('');
    const [relation, setRelation] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState<Person['gender']>('Male');
    const [maritalStatus, setMaritalStatus] = useState<Person['maritalStatus']>('Single');
    const [status, setStatus] = useState<Person['status']>('Alive');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !relation || !age) return;

        onAddHeir(parentId, {
            name,
            relation,
            age: parseInt(age, 10),
            gender,
            maritalStatus,
            status,
        });
        closeDialog();
    };

    return (
        <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Add Heir to {personName}</DialogTitle>
              <DialogDescription>
                Enter the details for the new heir. Land details can be added after creation by editing the heir.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                 <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="add-name" className="text-right">Name</Label>
                    <Input id="add-name" value={name} onChange={e => setName(e.target.value)} className="col-span-3" required />
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="add-relation" className="text-right">Relation</Label>
                    <Input id="add-relation" value={relation} placeholder="e.g., Son, Daughter" onChange={e => setRelation(e.target.value)} className="col-span-3" required />
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="add-age" className="text-right">Age</Label>
                    <Input id="add-age" type="number" value={age} onChange={e => setAge(e.target.value)} className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Gender</Label>
                    <Select onValueChange={(v: Person['gender']) => setGender(v)} defaultValue={gender}>
                        <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Female">Female</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Marital Status</Label>
                    <Select onValueChange={(v: Person['maritalStatus']) => setMaritalStatus(v)} defaultValue={maritalStatus}>
                        <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Single">Single</SelectItem>
                            <SelectItem value="Married">Married</SelectItem>
                            <SelectItem value="Divorced">Divorced</SelectItem>
                            <SelectItem value="Widowed">Widowed</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Status</Label>
                    <Select onValueChange={(v: Person['status']) => setStatus(v)} defaultValue={status}>
                        <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Alive">Alive</SelectItem>
                            <SelectItem value="Died">Died</SelectItem>
                            <SelectItem value="Missing">Missing</SelectItem>
                            <SelectItem value="Unknown">Unknown</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <DialogFooter>
                <Button type="submit">Save Heir</Button>
            </DialogFooter>
        </form>
    );
};

// A form component for editing a person
const EditPersonForm: FC<{ person: Person, onUpdatePerson: PersonCardProps['onUpdatePerson'], closeDialog: () => void }> = ({ person, onUpdatePerson, closeDialog }) => {
    const [name, setName] = useState(person.name);
    const [relation, setRelation] = useState(person.relation);
    const [age, setAge] = useState(person.age.toString());
    const [gender, setGender] = useState<Person['gender']>(person.gender);
    const [maritalStatus, setMaritalStatus] = useState<Person['maritalStatus']>(person.maritalStatus);
    const [status, setStatus] = useState<Person['status']>(person.status);
    const [sourceOfLand, setSourceOfLand] = useState(person.sourceOfLand || '');
    
    // Land records management state
    const [landRecords, setLandRecords] = useState<SurveyRecord[]>(person.landRecords || []);
    const [newSurveyNumber, setNewSurveyNumber] = useState('');
    const [newAcres, setNewAcres] = useState('');
    const [newCents, setNewCents] = useState('');
    const [newLandClassification, setNewLandClassification] = useState<LandClassification>('Unclassified');

    const handleAddLandRecord = () => {
        if (!newSurveyNumber.trim() || (!newAcres.trim() && !newCents.trim())) return;
        const newRecord: SurveyRecord = {
            id: `lr-${person.id}-${Date.now()}`,
            surveyNumber: newSurveyNumber,
            acres: newAcres,
            cents: newCents,
            landClassification: newLandClassification
        };
        setLandRecords([...landRecords, newRecord]);
        setNewSurveyNumber('');
        setNewAcres('');
        setNewCents('');
        setNewLandClassification('Unclassified');
    };

    const handleDeleteLandRecord = (recordId: string) => {
        setLandRecords(landRecords.filter(r => r.id !== recordId));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !relation || !age) return;

        onUpdatePerson(person.id, {
            name,
            relation,
            age: parseInt(age, 10),
            gender,
            maritalStatus,
            status,
            sourceOfLand,
            landRecords,
        });
        closeDialog();
    };

    return (
        <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Edit Details for {person.name}</DialogTitle>
              <DialogDescription>
                Update the personal and land details for this person.
              </DialogDescription>
            </DialogHeader>
            <div className="max-h-[70vh] overflow-y-auto p-4 space-y-6">
                <div className="space-y-4">
                    <h4 className="font-semibold text-lg">Personal Details</h4>
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-name" className="text-right">Name</Label>
                        <Input id="edit-name" value={name} onChange={e => setName(e.target.value)} className="col-span-3" required />
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-relation" className="text-right">Relation</Label>
                        <Input id="edit-relation" value={relation} placeholder="e.g., Son, Daughter" onChange={e => setRelation(e.target.value)} className="col-span-3" required />
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-age" className="text-right">Age</Label>
                        <Input id="edit-age" type="number" value={age} onChange={e => setAge(e.target.value)} className="col-span-3" required />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Gender</Label>
                        <Select onValueChange={(v: Person['gender']) => setGender(v)} defaultValue={gender}>
                            <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Male">Male</SelectItem>
                                <SelectItem value="Female">Female</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Marital Status</Label>
                        <Select onValueChange={(v: Person['maritalStatus']) => setMaritalStatus(v)} defaultValue={maritalStatus}>
                            <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Single">Single</SelectItem>
                                <SelectItem value="Married">Married</SelectItem>
                                <SelectItem value="Divorced">Divorced</SelectItem>
                                <SelectItem value="Widowed">Widowed</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Status</Label>
                        <Select onValueChange={(v: Person['status']) => setStatus(v)} defaultValue={status}>
                            <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Alive">Alive</SelectItem>
                                <SelectItem value="Died">Died</SelectItem>
                                <SelectItem value="Missing">Missing</SelectItem>
                                <SelectItem value="Unknown">Unknown</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <Separator />

                <div className="space-y-4">
                    <h4 className="font-semibold text-lg">Land Details</h4>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-sourceOfLand" className="text-right">Source of Land</Label>
                        <Input id="edit-sourceOfLand" value={sourceOfLand} onChange={e => setSourceOfLand(e.target.value)} className="col-span-3" placeholder="e.g., Purchase, Legal Heir" />
                    </div>

                    <div className="p-4 border rounded-lg space-y-4">
                        <h5 className="font-medium">Add New Survey Record</h5>
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="survey-number">Survey/Sub-Div No.</Label>
                                <Input id="survey-number" value={newSurveyNumber} onChange={e => setNewSurveyNumber(e.target.value)} placeholder="e.g., 256/2B" />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="acres">Acres</Label>
                                <Input id="acres" type="number" step="any" value={newAcres} onChange={e => setNewAcres(e.target.value)} placeholder="e.g., 5" />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="cents">Cents</Label>
                                <Input id="cents" type="number" step="any" value={newCents} onChange={e => setNewCents(e.target.value)} placeholder="e.g., 50" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="land-classification">Classification</Label>
                                <Select onValueChange={(v: LandClassification) => setNewLandClassification(v)} value={newLandClassification}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Unclassified">Unclassified</SelectItem>
                                        <SelectItem value="Wet">Wet</SelectItem>
                                        <SelectItem value="Dry">Dry</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <Button type="button" onClick={handleAddLandRecord}>Add Record</Button>
                    </div>

                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Survey No.</TableHead>
                                    <TableHead>Acres</TableHead>
                                    <TableHead>Cents</TableHead>
                                    <TableHead>Classification</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {landRecords && landRecords.length > 0 ? (
                                    landRecords.map(rec => (
                                        <TableRow key={rec.id}>
                                            <TableCell>{rec.surveyNumber}</TableCell>
                                            <TableCell>{rec.acres || '0'}</TableCell>
                                            <TableCell>{rec.cents || '0'}</TableCell>
                                            <TableCell><Badge variant="outline">{rec.landClassification}</Badge></TableCell>
                                            <TableCell className="text-right">
                                                <Button type="button" variant="ghost" size="icon" onClick={() => handleDeleteLandRecord(rec.id)}>
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow><TableCell colSpan={5} className="h-24 text-center">No land records.</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
            <DialogFooter className="p-4 border-t">
                <Button type="submit">Save Changes</Button>
            </DialogFooter>
        </form>
    );
}

export const PersonCard: FC<PersonCardProps> = ({ person, onAddHeir, onUpdatePerson, isFamilyHead }) => {
  const [isAddHeirOpen, setIsAddHeirOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  
  const totalExtent = useMemo(() => {
    let totalAcres = 0;
    let totalCents = 0;

    (person.landRecords || []).forEach(record => {
        totalAcres += parseFloat(record.acres) || 0;
        totalCents += parseFloat(record.cents) || 0;
    });

    if (totalCents >= 100) {
        totalAcres += Math.floor(totalCents / 100);
        totalCents = totalCents % 100;
    }

    return { acres: totalAcres, cents: parseFloat(totalCents.toFixed(2)) };
  }, [person.landRecords]);

  return (
    <Card className="bg-card/50 shadow-md">
      <CardHeader>
        <div className="flex items-start justify-between">
            <div>
                <CardTitle className="flex items-center gap-2">
                    <User className="text-primary" />
                    {person.name} <span className="text-sm font-normal text-muted-foreground">({person.relation})</span>
                </CardTitle>
                <CardDescription>Record ID: {person.id}</CardDescription>
            </div>
             <Badge variant="secondary" className="whitespace-nowrap flex items-center gap-1.5">
                <span className={`h-2 w-2 rounded-full ${statusColors[person.status]}`} />
                {person.status}
            </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="font-semibold">Gender:</span> {person.gender}</div>
            <div><span className="font-semibold">Age:</span> {person.age}</div>
            <div><span className="font-semibold">Marital Status:</span> {person.maritalStatus}</div>
            {person.sourceOfLand && <div><span className="font-semibold">Source of Land:</span> {person.sourceOfLand}</div>}
        </div>
        
        {person.landRecords && person.landRecords.length > 0 && (
            <div className="space-y-2 pt-2">
                <h4 className="font-semibold text-sm">Land Records</h4>
                <div className="border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Survey No.</TableHead>
                                <TableHead className="text-right">Acres</TableHead>
                                <TableHead className="text-right">Cents</TableHead>
                                <TableHead>Class</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                           {person.landRecords.map(rec => (
                                <TableRow key={rec.id}>
                                    <TableCell>{rec.surveyNumber}</TableCell>
                                    <TableCell className="text-right">{rec.acres || '0'}</TableCell>
                                    <TableCell className="text-right">{rec.cents || '0'}</TableCell>
                                    <TableCell><Badge variant="outline">{rec.landClassification}</Badge></TableCell>
                                </TableRow>
                           ))}
                        </TableBody>
                    </Table>
                </div>
                 <div className="flex items-center justify-end space-x-2 text-sm pt-2">
                    <Scale className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold">Total Extent:</span>
                    <span className="font-bold text-primary">{totalExtent.acres} Acres, {totalExtent.cents} Cents</span>
                </div>
            </div>
        )}
      </CardContent>
      <CardFooter className="flex items-center justify-end gap-2 p-3">
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogTrigger asChild>
                    <Button variant="ghost" size="sm"><Edit className="mr-1 h-3 w-3" /> Edit</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-3xl p-0">
                    <EditPersonForm person={person} onUpdatePerson={onUpdatePerson} closeDialog={() => setIsEditOpen(false)} />
                </DialogContent>
            </Dialog>
            {!isFamilyHead && <Button variant="ghost" size="sm"><Trash2 className="mr-1 h-3 w-3" /> Delete</Button>}
            <Dialog open={isAddHeirOpen} onOpenChange={setIsAddHeirOpen}>
                <DialogTrigger asChild>
                    <Button size="sm"><UserPlus className="mr-1 h-3 w-3" /> Add Heir</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                    <AddHeirForm personName={person.name} parentId={person.id} onAddHeir={onAddHeir} closeDialog={() => setIsAddHeirOpen(false)} />
                </DialogContent>
            </Dialog>
      </CardFooter>
      
      {person.heirs && person.heirs.length > 0 && (
        <div className="border-t">
          <div className="pl-6 border-l-2 border-primary/20 ml-4 my-4 space-y-4">
              <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2 pt-4 -ml-1"><Milestone className="h-4 w-4" />Heirs</h4>
            {person.heirs.map((heir) => (
              <PersonCard key={heir.id} person={heir} onAddHeir={onAddHeir} onUpdatePerson={onUpdatePerson} />
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};
