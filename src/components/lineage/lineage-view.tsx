
'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { PersonCard } from './person-card';
import { LineageSuggestion } from './lineage-suggestion';
import { Card, CardContent } from '../ui/card';
import { Loader2, Search, PlusCircle, FileUp } from 'lucide-react';
import type { Person, User, Folder, DocumentFile } from '@/types';
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
import { useToast } from '@/hooks/use-toast';
import { ImportSheetDialog } from './import-sheet-dialog';

const AddFamilyHeadForm: FC<{ onAddFamilyHead: (data: Omit<Person, 'id' | 'heirs' | 'landRecords'>) => void, closeDialog: () => void }> = ({ onAddFamilyHead, closeDialog }) => {
    const [name, setName] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState<Person['gender']>('Male');
    const [maritalStatus, setMaritalStatus] = useState<Person['maritalStatus']>('Married');
    const [status, setStatus] = useState<Person['status']>('Alive');
    const [sourceOfLand, setSourceOfLand] = useState('');
    const [holdingPattern, setHoldingPattern] = useState('');

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
            holdingPattern,
        });
        closeDialog();
    };

    return (
        <form onSubmit={handleSubmit}>
            <DialogHeader>
                <DialogTitle>Add New Family Head</DialogTitle>
                <DialogDescription>
                  Enter the details for the new family head. Land and heir details can be added after creation.
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
                 <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="add-head-name" className="text-right">Name</Label>
                    <Input id="add-head-name" value={name} onChange={e => setName(e.target.value)} className="col-span-3" required />
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="add-head-age" className="text-right">Age</Label>
                    <Input id="add-head-age" type="number" value={age} onChange={e => setAge(e.target.value)} className="col-span-3" required />
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
                 <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="add-head-sourceOfLand" className="text-right">Source of Land</Label>
                    <Input id="add-head-sourceOfLand" value={sourceOfLand} onChange={e => setSourceOfLand(e.target.value)} className="col-span-3" placeholder="e.g., Purchase, Legal Heir" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="add-head-holdingPattern" className="text-right">Holding Pattern</Label>
                    <Input id="add-head-holdingPattern" value={holdingPattern} onChange={e => setHoldingPattern(e.target.value)} className="col-span-3" placeholder="e.g., Joint, Individual" />
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
    currentUser: User | null;
    folders: Folder[];
    onAddFolder: (parentId: string, name: string) => void;
    onDeleteFolder: (folderId: string) => void;
    onAddFile: (folderId: string, fileData: Omit<DocumentFile, 'id'>) => void;
    onDeleteFile: (folderId: string, fileId: string) => void;
}

const searchInFamily = (person: Person, query: string): boolean => {
    const lowerCaseQuery = query.toLowerCase();

    const checkPerson = (p: Person): boolean => {
        if (p.name.toLowerCase().includes(lowerCaseQuery)) return true;
        if (p.relation.toLowerCase().includes(lowerCaseQuery)) return true;
        if ((p.sourceOfLand || '').toLowerCase().includes(lowerCaseQuery)) return true;
        if ((p.holdingPattern || '').toLowerCase().includes(lowerCaseQuery)) return true;
        if (p.status.toLowerCase().includes(lowerCaseQuery)) return true;

        if (p.landRecords.some(lr => lr.surveyNumber.toLowerCase().includes(lowerCaseQuery))) {
            return true;
        }
        
        // Continue searching in heirs
        return p.heirs.some(heir => checkPerson(heir));
    }
    
    return checkPerson(person);
}

export function LineageView({ 
    familyHeads, 
    onAddHeir, 
    onUpdatePerson, 
    onAddFamilyHead,
    onImportSuccess,
    projectId, 
    currentUser,
    folders,
    onAddFolder,
    onDeleteFolder,
    onAddFile,
    onDeleteFile
}: LineageViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddFamilyHeadOpen, setIsAddFamilyHeadOpen] = useState(false);
  const [isImportSheetOpen, setIsImportSheetOpen] = useState(false);
  const { toast } = useToast();

  const userRole = currentUser?.role;
  const canEditLineage = userRole === 'Super Admin';

  if (!Array.isArray(familyHeads)) {
    return (
        <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="ml-4">Loading Owner Data...</p>
        </div>
    )
  }

  const filteredHeads = searchQuery 
    ? familyHeads.filter(person => searchInFamily(person, searchQuery))
    : familyHeads;

  const allOwnersDataString = JSON.stringify(familyHeads, null, 2);

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Owner &amp; Lineage Management</h2>
            <p className="text-muted-foreground">
                Search records, add family heads, manage details, and add heirs.
            </p>
          </div>
          <div className="flex items-center gap-2">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search full records..."
                  className="w-full pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              {canEditLineage && (
                <>
                  <Button variant="outline" onClick={() => setIsImportSheetOpen(true)}>
                    <FileUp className="mr-2 h-4 w-4" /> Import
                  </Button>
                  <Dialog open={isAddFamilyHeadOpen} onOpenChange={setIsAddFamilyHeadOpen}>
                      <DialogTrigger asChild>
                          <Button>
                              <PlusCircle className="mr-2 h-4 w-4" />
                              Add Family Head
                          </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                          <AddFamilyHeadForm 
                              onAddFamilyHead={onAddFamilyHead} 
                              closeDialog={() => setIsAddFamilyHeadOpen(false)} 
                          />
                      </DialogContent>
                  </Dialog>
                </>
              )}
          </div>
        </div>
        
        {filteredHeads.length > 0 ? (
          filteredHeads.map(person => {
            const personFolders = folders.filter(f => f.name === person.name);
            return (
                <PersonCard 
                    key={person.id} 
                    person={person} 
                    onAddHeir={onAddHeir} 
                    onUpdatePerson={onUpdatePerson} 
                    isFamilyHead={true}
                    projectId={projectId}
                    currentUser={currentUser}
                    personFolders={personFolders}
                    onAddFolder={onAddFolder}
                    onDeleteFolder={onDeleteFolder}
                    onAddFile={onAddFile}
                    onDeleteFile={onDeleteFile}
                />
            )
          })
        ) : (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              {searchQuery ? "No owners found matching your search." : "No family heads have been added yet."}
            </CardContent>
          </Card>
        )}
      </div>
      
      <LineageSuggestion existingData={allOwnersDataString} />
      <ImportSheetDialog 
        isOpen={isImportSheetOpen}
        onOpenChange={setIsImportSheetOpen}
        onImportSuccess={onImportSuccess}
      />
    </>
  );
}
