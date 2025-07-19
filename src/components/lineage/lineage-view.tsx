
'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { PersonCard } from './person-card';
import { LineageSuggestion } from './lineage-suggestion';
import { Card, CardContent } from '../ui/card';
import { Loader2, Search, PlusCircle, FileUp } from 'lucide-react';
import type { Person, Folder, DocumentFile, User } from '@/types';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ImportSheetDialog } from './import-sheet-dialog';

const AddFamilyHeadForm: FC<{ onAddFamilyHead: (data: Omit<Person, 'id' | 'heirs' | 'landRecords'>) => void, closeDialog: () => void }> = ({ onAddFamilyHead, closeDialog }) => {
    const [name, setName] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState<Person['gender']>('Male');
    const [maritalStatus, setMaritalStatus] = useState<Person['maritalStatus']>('Married');
    const [status, setStatus] = useState<Person['status']>('Alive');
    const [sourceOfLand, setSourceOfLand] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !age) return;

        onAddFamilyHead({
            name,
            relation: "Family Head",
            age: parseInt(age, 10),
            gender,
            maritalStatus,
            status,
            sourceOfLand,
        });
        closeDialog();
    };

    return (
        <form onSubmit={handleSubmit}>
            <DialogHeader>
                <DialogTitle>Add New Family Head</DialogTitle>
                <DialogDescription>
                  Enter details for the new family head.
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                 <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">Name</Label>
                    <Input id="name" value={name} onChange={e => setName(e.target.value)} className="col-span-3" required />
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="age" className="text-right">Age</Label>
                    <Input id="age" type="number" value={age} onChange={e => setAge(e.target.value)} className="col-span-3" required />
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
                 <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="sourceOfLand" className="text-right">Source of Land</Label>
                    <Input id="sourceOfLand" value={sourceOfLand} onChange={e => setSourceOfLand(e.target.value)} className="col-span-3" />
                </div>
            </div>
            <DialogFooter className="pt-4 mt-2 border-t">
                <Button type="submit">Save Family Head</Button>
            </DialogFooter>
        </form>
    );
}

interface LineageViewProps {
    familyHeads: Person[];
    onAddHeir: (parentId: string, heirData: Omit<Person, 'id' | 'heirs' | 'landRecords'>) => void;
    onUpdatePerson: (personId: string, personData: Omit<Person, 'id' | 'heirs'>) => void;
    onAddFamilyHead: (personData: Omit<Person, 'id' | 'heirs' | 'landRecords'>) => void;
    onImportSuccess: (newOwners: Person[]) => void;
    projectId: string;
    folders: Folder[];
    onAddFolder: (parentId: string, name: string) => void;
    onDeleteFolder: (folderId: string) => void;
    onAddFile: (folderId: string, fileData: Omit<DocumentFile, 'id'>) => void;
    onDeleteFile: (folderId: string, fileId: string) => void;
    currentUser: User | null;
}

const searchInFamily = (person: Person, query: string): boolean => {
    const lowerCaseQuery = query.toLowerCase();
    const checkPerson = (p: Person): boolean => 
        p.name.toLowerCase().includes(lowerCaseQuery) ||
        p.relation.toLowerCase().includes(lowerCaseQuery) ||
        (p.sourceOfLand || '').toLowerCase().includes(lowerCaseQuery) ||
        p.status.toLowerCase().includes(lowerCaseQuery) ||
        p.landRecords.some(lr => lr.surveyNumber.toLowerCase().includes(lowerCaseQuery)) ||
        p.heirs.some(checkPerson);
    return checkPerson(person);
}

export function LineageView({ 
    familyHeads, 
    onAddHeir, 
    onUpdatePerson, 
    onAddFamilyHead,
    onImportSuccess,
    projectId, 
    folders,
    onAddFolder,
    onDeleteFolder,
    onAddFile,
    onDeleteFile,
    currentUser,
}: LineageViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddFamilyHeadOpen, setIsAddFamilyHeadOpen] = useState(false);
  const [isImportSheetOpen, setIsImportSheetOpen] = useState(false);

  if (!Array.isArray(familyHeads)) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  const filteredHeads = searchQuery ? familyHeads.filter(p => searchInFamily(p, searchQuery)) : familyHeads;
  const allOwnersDataString = JSON.stringify(familyHeads, null, 2);

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search records..." className="w-full pl-8" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => setIsImportSheetOpen(true)}>
                <FileUp className="mr-2 h-4 w-4" /> Import
              </Button>
              <Dialog open={isAddFamilyHeadOpen} onOpenChange={setIsAddFamilyHeadOpen}>
                  <DialogTrigger asChild><Button><PlusCircle className="mr-2 h-4 w-4" />Add Family Head</Button></DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                      <AddFamilyHeadForm onAddFamilyHead={onAddFamilyHead} closeDialog={() => setIsAddFamilyHeadOpen(false)} />
                  </DialogContent>
              </Dialog>
          </div>
        </div>
        
        {filteredHeads.map(person => (
            <PersonCard 
                key={person.id} 
                person={person}
                onAddHeir={onAddHeir} 
                onUpdatePerson={onUpdatePerson} 
                isFamilyHead={true}
                projectId={projectId}
                personFolders={folders.filter(f => f.name === person.name)}
                onAddFolder={onAddFolder}
                onDeleteFolder={onDeleteFolder}
                onAddFile={onAddFile}
                onDeleteFile={onDeleteFile}
                currentUser={currentUser}
            />
        ))}
        {filteredHeads.length === 0 && (
          <Card><CardContent className="p-8 text-center text-muted-foreground">{searchQuery ? "No results found." : "No family heads added yet."}</CardContent></Card>
        )}
      </div>
      
      <LineageSuggestion existingData={allOwnersDataString} />
      <ImportSheetDialog isOpen={isImportSheetOpen} onOpenChange={setIsImportSheetOpen} onImportSuccess={onImportSuccess} />
    </>
  );
}
