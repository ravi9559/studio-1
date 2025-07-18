
'use client';

import type { FC } from 'react';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, UserPlus, Edit, Trash2, Milestone, Scale, Save, Plus, X, Link as LinkIcon, StickyNote, Gavel, ScrollText, FolderArchive, FolderIcon, FolderPlus, File as FileIcon, FilePlus, Download, Loader2, Wallet } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from '../ui/separator';
import type { Person, SurveyRecord, LandClassification, Note, LegalNote, User, Transaction, Folder, DocumentFile, FinancialTransaction } from '@/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Textarea } from '../ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const statusColors: { [key in Person['status']]: string } = {
  Alive: 'bg-green-500',
  Died: 'bg-gray-500',
  Missing: 'bg-yellow-500',
  Unknown: 'bg-blue-500',
};

// --- DIALOGS FOR FOLDER VIEW ---

const AddFolderDialog: FC<{
  folderName: string;
  onSave: (name: string) => void;
  onOpenChange: (open: boolean) => void;
}> = ({ folderName, onSave, onOpenChange }) => {
  const [newFolderName, setNewFolderName] = useState('');
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFolderName.trim()) {
      onSave(newFolderName.trim());
      setNewFolderName('');
      onOpenChange(false);
    }
  };

  return (
    <DialogContent className="sm:max-w-md">
      <form onSubmit={handleSubmit}>
        <DialogHeader>
          <DialogTitle>Add New Folder</DialogTitle>
          <DialogDescription>
            Enter a name for the new folder inside "{folderName}".
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="folder-name" className="text-right">Name</Label>
            <Input id="folder-name" value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} className="col-span-3" required />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit">Add Folder</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
};


// Dialog for adding a new file
const AddFileDialog: FC<{
  folderName: string;
  onSave: (fileData: Omit<DocumentFile, 'id'>) => void;
  onOpenChange: (open: boolean) => void;
}> = ({ folderName, onSave, onOpenChange }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    } else {
      setSelectedFile(null);
    }
  };

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      toast({
        variant: 'destructive',
        title: 'No file selected',
        description: 'Please choose a file to upload.',
      });
      return;
    }

    setIsLoading(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const fileExtension = selectedFile.name.slice((selectedFile.name.lastIndexOf(".") - 1 >>> 0) + 2).toUpperCase();

      onSave({
        name: selectedFile.name,
        type: fileExtension || 'File',
        size: formatBytes(selectedFile.size),
        uploaded: new Date().toISOString(),
        url: dataUrl,
      });
      
      setIsLoading(false);
      onOpenChange(false);
    };
    reader.onerror = () => {
        setIsLoading(false);
        toast({
            variant: 'destructive',
            title: 'File Read Error',
            description: 'Could not read the selected file.',
        });
    }
    reader.readAsDataURL(selectedFile);
  };

  return (
    <DialogContent className="sm:max-w-md">
      <form onSubmit={handleSubmit}>
        <DialogHeader>
          <DialogTitle>Upload a File</DialogTitle>
          <DialogDescription>
            Choose a file from your local drive to upload to "{folderName}".
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="file-upload" className="text-right">File</Label>
            <Input id="file-upload" type="file" onChange={handleFileChange} className="col-span-3" required />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={isLoading}>Cancel</Button>
          <Button type="submit" disabled={!selectedFile || isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Upload
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
};


// --- FOLDER VIEW ---
const FolderView: FC<{
  folder: Folder;
  onAddFolder: (parentId: string, name: string) => void;
  onDeleteFolder: (folderId: string) => void;
  onAddFile: (folderId: string, fileData: Omit<DocumentFile, 'id'>) => void;
  onDeleteFile: (folderId: string, fileId: string) => void;
  level: number;
}> = ({ folder, onAddFolder, onDeleteFolder, onAddFile, onDeleteFile, level }) => {
  const [isAddFolderOpen, setIsAddFolderOpen] = useState(false);
  const [isAddFileOpen, setIsAddFileOpen] = useState(false);
  const { toast } = useToast();

  const handleDownload = (file: DocumentFile) => {
    if (!file.url) {
        toast({
            variant: 'destructive',
            title: 'Download Error',
            description: 'This file does not have downloadable content.'
        });
        return;
    }
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ marginLeft: `${level * 20}px` }} className="mt-2">
      <div className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/50">
        <FolderIcon className="h-5 w-5 text-primary" />
        <span className="flex-grow font-medium">{folder.name}</span>
        
        {/* Add File Dialog */}
        <Dialog open={isAddFileOpen} onOpenChange={setIsAddFileOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7" title="Add File">
              <FilePlus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <AddFileDialog folderName={folder.name} onSave={(data) => onAddFile(folder.id, data)} onOpenChange={setIsAddFileOpen} />
        </Dialog>

        {/* Add Folder Dialog */}
        <Dialog open={isAddFolderOpen} onOpenChange={setIsAddFolderOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7" title="Add Sub-folder">
              <FolderPlus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <AddFolderDialog folderName={folder.name} onSave={(name) => onAddFolder(folder.id, name)} onOpenChange={setIsAddFolderOpen} />
        </Dialog>
        
        {level > 2 && ( // Only allow deleting folders deeper than the main categories
            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => onDeleteFolder(folder.id)} title="Delete Folder">
                <Trash2 className="h-4 w-4" />
            </Button>
        )}
      </div>

      {/* Render Files */}
      <div className="pl-6 mt-1 space-y-1">
        {(folder.files || []).map(file => (
          <div key={file.id} className="flex items-center gap-2 p-1.5 rounded-md hover:bg-muted/50 text-sm">
            <FileIcon className="h-4 w-4 text-muted-foreground" />
            <span className="flex-grow">{file.name}</span>
            <span className="text-xs text-muted-foreground">{file.size}</span>
            <span className="text-xs text-muted-foreground">{format(new Date(file.uploaded), 'PP')}</span>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleDownload(file)} title="Download File" disabled={!file.url}>
                <Download className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive" onClick={() => onDeleteFile(folder.id, file.id)} title="Delete File">
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
      </div>

      {/* Render Sub-folders */}
      {folder.children.map((child) => (
        <FolderView key={child.id} folder={child} onAddFolder={onAddFolder} onDeleteFolder={onDeleteFolder} onAddFile={onAddFile} onDeleteFile={onDeleteFile} level={level + 1} />
      ))}
    </div>
  );
};


interface PersonCardProps {
  person: Person;
  onAddHeir: (parentId: string, heirData: Omit<Person, 'id' | 'heirs' | 'landRecords'>) => void;
  onUpdatePerson: (personId: string, personData: Omit<Person, 'id' | 'heirs'>) => void;
  isFamilyHead?: boolean;
  projectId: string;
  currentUser: User | null;
  personFolders: Folder[];
  onAddFolder: (parentId: string, name: string) => void;
  onDeleteFolder: (folderId: string) => void;
  onAddFile: (folderId: string, fileData: Omit<DocumentFile, 'id'>) => void;
  onDeleteFile: (folderId: string, fileId: string) => void;
}

// A form component for adding an heir
const AddHeirForm: FC<{ personName: string, parentId: string, onAddHeir: PersonCardProps['onAddHeir'], closeDialog: () => void }> = ({ personName, parentId, onAddHeir, closeDialog }) => {
    const [name, setName] = useState('');
    const [relation, setRelation] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState<Person['gender']>('Male');
    const [maritalStatus, setMaritalStatus] = useState<Person['maritalStatus']>('Single');
    const [status, setStatus] = useState<Person['status']>('Alive');
    const [sourceOfLand, setSourceOfLand] = useState('');
    const [holdingPattern, setHoldingPattern] = useState('');

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
            sourceOfLand,
            holdingPattern,
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
                 <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="add-sourceOfLand" className="text-right">Source of Land</Label>
                    <Input id="add-sourceOfLand" value={sourceOfLand} onChange={e => setSourceOfLand(e.target.value)} className="col-span-3" placeholder="e.g., Purchase, Legal Heir" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="add-holdingPattern" className="text-right">Holding Pattern</Label>
                    <Input id="add-holdingPattern" value={holdingPattern} onChange={e => setHoldingPattern(e.target.value)} className="col-span-3" placeholder="e.g., Joint, Individual" />
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
    const [holdingPattern, setHoldingPattern] = useState(person.holdingPattern || '');
    
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
            landClassification: newLandClassification,
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
            holdingPattern,
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
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-holdingPattern" className="text-right">Holding Pattern</Label>
                        <Input id="edit-holdingPattern" value={holdingPattern} onChange={e => setHoldingPattern(e.target.value)} className="col-span-3" placeholder="e.g., Joint, Individual" />
                    </div>

                    <div className="p-4 border rounded-lg space-y-4">
                        <h5 className="font-medium">Add New Survey Record</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
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
                                    <TableHead>Extent</TableHead>
                                    <TableHead>Class</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {landRecords && landRecords.length > 0 ? (
                                    landRecords.map(rec => (
                                        <TableRow key={rec.id}>
                                            <TableCell>{rec.surveyNumber}</TableCell>
                                            <TableCell>{rec.acres || '0'}ac {rec.cents || '0'}c</TableCell>
                                            <TableCell><Badge variant="outline">{rec.landClassification}</Badge></TableCell>
                                            <TableCell className="text-right">
                                                <Button type="button" variant="ghost" size="icon" onClick={() => handleDeleteLandRecord(rec.id)}>
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow><TableCell colSpan={4} className="h-24 text-center">No land records.</TableCell></TableRow>
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
};

// Transaction Form Dialog Component
const TransactionFormDialog: FC<{
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onSave: (transactionData: Omit<Transaction, 'id'>) => void;
    transaction: Transaction | null;
    ownerName: string;
}> = ({ isOpen, onOpenChange, onSave, transaction, ownerName }) => {
    const [owner, setOwner] = useState(ownerName);
    const [sourceName, setSourceName] = useState('');
    const [mode, setMode] = useState<Transaction['mode']>('Purchase');
    const [year, setYear] = useState('');
    const [doc, setDoc] = useState('');

    useEffect(() => {
        if (transaction) {
            setOwner(transaction.owner);
            setSourceName(transaction.sourceName);
            setMode(transaction.mode);
            setYear(String(transaction.year));
            setDoc(transaction.doc);
        } else {
            // Reset form for new record, pre-filling the owner
            setOwner(ownerName);
            setSourceName('');
            setMode('Purchase');
            setYear('');
            setDoc('');
        }
    }, [transaction, isOpen, ownerName]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!owner || !sourceName || !year) return;

        onSave({
            owner,
            sourceName,
            mode,
            year: parseInt(year, 10),
            doc,
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{transaction ? 'Edit Transaction' : 'Add New Transaction'}</DialogTitle>
                        <DialogDescription>
                            Record a transaction for {ownerName}.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="owner" className="text-right">Owner</Label>
                            <Input id="owner" value={owner} onChange={e => setOwner(e.target.value)} className="col-span-3" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="sourceName" className="text-right">Source Name</Label>
                            <Input id="sourceName" value={sourceName} onChange={e => setSourceName(e.target.value)} className="col-span-3" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Source Mode</Label>
                            <Select onValueChange={(v: Transaction['mode']) => setMode(v)} value={mode}>
                                <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Purchase">Purchase</SelectItem>
                                    <SelectItem value="Legal Heir">Legal Heir</SelectItem>
                                    <SelectItem value="Gift">Gift</SelectItem>
                                    <SelectItem value="Settlement">Settlement</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                         <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="year" className="text-right">Year</Label>
                            <Input id="year" type="number" value={year} onChange={e => setYear(e.target.value)} className="col-span-3" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="doc" className="text-right">Doc Number</Label>
                            <Input id="doc" value={doc} onChange={e => setDoc(e.target.value)} className="col-span-3" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit">Save Record</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

// --- Financial Transaction Form Dialog ---
interface FinTxFormDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onSave: (transactionData: Omit<FinancialTransaction, 'id' | 'timestamp' | 'familyHeadId'>) => void;
    familyName: string;
    transaction: FinancialTransaction | null;
}

function FinTxFormDialog({ isOpen, onOpenChange, onSave, familyName, transaction }: FinTxFormDialogProps) {
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState('');
    const [purpose, setPurpose] = useState<FinancialTransaction['purpose']>('Token Advance');
    const { toast } = useToast();

    useEffect(() => {
        if (transaction) {
            setAmount(String(transaction.amount));
            setDate(transaction.date);
            setPurpose(transaction.purpose);
        } else {
            setAmount('');
            setDate('');
            setPurpose('Token Advance');
        }
    }, [transaction, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || !date || !purpose) {
            toast({ variant: 'destructive', title: 'Missing Information', description: 'Please fill out all fields.'});
            return;
        }

        onSave({
            amount: parseFloat(amount),
            date,
            purpose,
        });
        
        onOpenChange(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{transaction ? 'Edit Payment' : 'Record a Payment'} for {familyName}</DialogTitle>
                        <DialogDescription>
                            Enter the details for the financial transaction.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 p-4">
                        <div className="space-y-2">
                            <Label htmlFor="amount">Amount</Label>
                            <Input id="amount" type="number" value={amount} onChange={e => setAmount(e.target.value)} required />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="date">Date of Payment</Label>
                            <Input id="date" type="date" value={date} onChange={e => setDate(e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="purpose">Payment Purpose</Label>
                            <Select onValueChange={(v: FinancialTransaction['purpose']) => setPurpose(v)} value={purpose}>
                                <SelectTrigger id="purpose"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Token Advance">Token Advance</SelectItem>
                                    <SelectItem value="Part Payment">Part Payment</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit">Save Transaction</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

type AggregatedNote = Note & { surveyNumber: string };
type AggregatedLegalNote = LegalNote & { surveyNumber: string };

export const PersonCard: FC<PersonCardProps> = ({ 
    person, 
    onAddHeir, 
    onUpdatePerson, 
    isFamilyHead, 
    projectId, 
    currentUser,
    personFolders,
    onAddFolder,
    onDeleteFolder,
    onAddFile,
    onDeleteFile
}) => {
  const [isAddHeirOpen, setIsAddHeirOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const { toast } = useToast();

  const [version, setVersion] = useState(0);
  const refreshData = useCallback(() => setVersion(v => v + 1), []);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [financialTransactions, setFinancialTransactions] = useState<FinancialTransaction[]>([]);
  const [aggregatedNotes, setAggregatedNotes] = useState<AggregatedNote[]>([]);
  const [aggregatedLegalNotes, setAggregatedLegalNotes] = useState<AggregatedLegalNote[]>([]);

  const [isNoteDialogOpen, setNoteDialogOpen] = useState(false);
  const [isLegalNoteDialogOpen, setLegalNoteDialogOpen] = useState(false);
  const [isTxDialogOpen, setIsTxDialogOpen] = useState(false);
  const [isFinTxDialogOpen, setIsFinTxDialogOpen] = useState(false);

  const [editingNote, setEditingNote] = useState<AggregatedNote | null>(null);
  const [editingLegalNote, setEditingLegalNote] = useState<AggregatedLegalNote | null>(null);
  const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);
  const [finTxToEdit, setFinTxToEdit] = useState<FinancialTransaction | null>(null);

  const canDeleteLegalNote = currentUser?.role !== 'Lawyer';


  const surveyNumbers = useMemo(() => {
    const numbers = new Set<string>();
    const collect = (p: Person) => {
        (p.landRecords || []).forEach(lr => lr.surveyNumber && numbers.add(lr.surveyNumber));
        (p.heirs || []).forEach(collect);
    };
    collect(person);
    return Array.from(numbers);
  }, [person]);

  const txStorageKey = useMemo(() => `transactions-${projectId}`, [projectId]);
  const finTxStorageKey = `financial-transactions-${projectId}`;

  useEffect(() => {
    if (!isFamilyHead) return;

    try {
        // Load Ownership Transactions
        const allTransactions: Transaction[] = JSON.parse(localStorage.getItem(txStorageKey) || '[]');
        const personAndHeirsNames = new Set<string>();
        const collectNames = (p: Person) => {
            personAndHeirsNames.add(p.name);
            p.heirs.forEach(collectNames);
        };
        collectNames(person);
        setTransactions(allTransactions.filter(tx => personAndHeirsNames.has(tx.owner)));

        // Load Financial Transactions
        const allFinTxs: FinancialTransaction[] = JSON.parse(localStorage.getItem(finTxStorageKey) || '[]');
        setFinancialTransactions(allFinTxs.filter(tx => tx.familyHeadId === person.id));

    } catch (e) {
        console.error('Could not load transaction data', e);
    }
    

    // Load Notes, Tasks, Legal Notes
    if (surveyNumbers.length === 0) return;

    const allNotes: AggregatedNote[] = [];
    const allLegalNotes: AggregatedLegalNote[] = [];

    surveyNumbers.forEach(sn => {
        try {
            const notes: Note[] = JSON.parse(localStorage.getItem(`notes-${projectId}-${sn}`) || '[]');
            allNotes.push(...notes.map(n => ({ ...n, surveyNumber: sn })));
            
            const legalNotes: LegalNote[] = JSON.parse(localStorage.getItem(`legal-notes-${projectId}-${sn}`) || '[]');
            allLegalNotes.push(...legalNotes.map(ln => ({ ...ln, surveyNumber: sn })));
        } catch (e) {
            console.error(`Could not load data for S.No. ${sn}`, e);
        }
    });

    setAggregatedNotes(allNotes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    setAggregatedLegalNotes(allLegalNotes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));

  }, [projectId, person, surveyNumbers, txStorageKey, finTxStorageKey, isFamilyHead, version]);

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
  
  const handleSaveTransaction = useCallback((txData: Omit<Transaction, 'id'>) => {
    const allTransactions: Transaction[] = JSON.parse(localStorage.getItem(txStorageKey) || '[]');
    if (transactionToEdit) {
        const updated = allTransactions.map(tx => tx.id === transactionToEdit.id ? { ...transactionToEdit, ...txData } : tx);
        localStorage.setItem(txStorageKey, JSON.stringify(updated));
        toast({ title: 'Transaction Updated' });
    } else {
        const newTransaction: Transaction = { id: `tx-${Date.now()}`, ...txData };
        localStorage.setItem(txStorageKey, JSON.stringify([newTransaction, ...allTransactions]));
        toast({ title: 'Transaction Added' });
    }
    setTransactionToEdit(null);
    setIsTxDialogOpen(false);
    refreshData();
  }, [txStorageKey, transactionToEdit, refreshData, toast]);

  const handleDeleteTransaction = useCallback((txId: string) => {
    const allTransactions: Transaction[] = JSON.parse(localStorage.getItem(txStorageKey) || '[]');
    const updated = allTransactions.filter(tx => tx.id !== txId);
    localStorage.setItem(txStorageKey, JSON.stringify(updated));
    toast({ title: 'Transaction Deleted' });
    refreshData();
  }, [txStorageKey, refreshData, toast]);
  
  const handleSaveFinancialTx = useCallback((txData: Omit<FinancialTransaction, 'id' | 'timestamp' | 'familyHeadId'>) => {
        const allTxs: FinancialTransaction[] = JSON.parse(localStorage.getItem(finTxStorageKey) || '[]');

        if (finTxToEdit) {
            const updatedTxs = allTxs.map(tx => tx.id === finTxToEdit.id ? { ...finTxToEdit, ...txData, timestamp: new Date().toISOString() } : tx);
            localStorage.setItem(finTxStorageKey, JSON.stringify(updatedTxs));
            toast({ title: 'Payment Updated', description: 'The financial transaction has been updated.' });
        } else {
            const newTransaction: FinancialTransaction = {
                id: `fin-tx-${Date.now()}`,
                timestamp: new Date().toISOString(),
                familyHeadId: person.id,
                ...txData,
            };
            localStorage.setItem(finTxStorageKey, JSON.stringify([newTransaction, ...allTxs]));
            toast({ title: 'Payment Recorded', description: 'The financial transaction has been added.'});
        }
        
        setFinTxToEdit(null);
        refreshData();
    }, [finTxStorageKey, person.id, finTxToEdit, refreshData, toast]);

    const handleDeleteFinancialTx = useCallback((txId: string) => {
        const allTxs: FinancialTransaction[] = JSON.parse(localStorage.getItem(finTxStorageKey) || '[]');
        const updatedTxs = allTxs.filter(tx => tx.id !== txId);
        localStorage.setItem(finTxStorageKey, JSON.stringify(updatedTxs));
        toast({ title: 'Payment Deleted', description: 'The financial transaction has been removed.' });
        refreshData();
    }, [finTxStorageKey, refreshData, toast]);

  const handleSaveNote = useCallback((surveyNumber: string, data: Omit<Note, 'id'>) => {
    const storageKey = `notes-${projectId}-${surveyNumber}`;
    const items: Note[] = JSON.parse(localStorage.getItem(storageKey) || '[]');
    if (editingNote) {
        const updatedItems = items.map(i => i.id === editingNote.id ? { ...i, ...data, date: new Date().toISOString() } : i);
        localStorage.setItem(storageKey, JSON.stringify(updatedItems));
        toast({ title: 'Note Updated' });
    } else {
        const newItem: Note = { ...data, id: `note-${Date.now()}` };
        localStorage.setItem(storageKey, JSON.stringify([newItem, ...items]));
        toast({ title: 'Note Added' });
    }
    setEditingNote(null);
    setNoteDialogOpen(false);
    refreshData();
  }, [projectId, editingNote, refreshData, toast]);

  const handleDeleteNote = useCallback((note: AggregatedNote) => {
    const storageKey = `notes-${projectId}-${note.surveyNumber}`;
    const items: Note[] = JSON.parse(localStorage.getItem(storageKey) || '[]');
    const updatedItems = items.filter(i => i.id !== note.id);
    localStorage.setItem(storageKey, JSON.stringify(updatedItems));
    toast({ title: 'Note Deleted' });
    refreshData();
  }, [projectId, refreshData, toast]);

  const handleSaveLegalNote = useCallback((surveyNumber: string, data: Omit<LegalNote, 'id' | 'date' | 'author'>) => {
    if (!currentUser) return;
    const storageKey = `legal-notes-${projectId}-${surveyNumber}`;
    const items: LegalNote[] = JSON.parse(localStorage.getItem(storageKey) || '[]');

    if (editingLegalNote) {
        const updatedItems = items.map(i => i.id === editingLegalNote.id ? { ...i, ...data, date: new Date().toISOString() } : i);
        localStorage.setItem(storageKey, JSON.stringify(updatedItems));
        toast({ title: 'Legal Note Updated' });
    } else {
        const newItem: LegalNote = { ...data, id: `legal-note-${Date.now()}`, date: new Date().toISOString(), author: { id: currentUser.id, name: currentUser.name } };
        localStorage.setItem(storageKey, JSON.stringify([newItem, ...items]));
        toast({ title: 'Legal Note Added' });
    }
    setEditingLegalNote(null);
    setLegalNoteDialogOpen(false);
    refreshData();
  }, [projectId, currentUser, editingLegalNote, refreshData, toast]);

  const handleDeleteLegalNote = useCallback((note: AggregatedLegalNote) => {
    const storageKey = `legal-notes-${projectId}-${note.surveyNumber}`;
    const items: LegalNote[] = JSON.parse(localStorage.getItem(storageKey) || '[]');
    const updatedItems = items.filter(i => i.id !== note.id);
    localStorage.setItem(storageKey, JSON.stringify(updatedItems));
    toast({ title: 'Legal Note Deleted' });
    refreshData();
  }, [projectId, refreshData, toast]);

  const openAddDialog = (type: 'note' | 'legal-note') => {
    if (surveyNumbers.length === 0) {
      toast({ variant: 'destructive', title: 'No Survey Numbers', description: 'This family has no land records to attach items to.' });
      return;
    }
    switch (type) {
      case 'note': setEditingNote(null); setNoteDialogOpen(true); break;
      case 'legal-note': setEditingLegalNote(null); setLegalNoteDialogOpen(true); break;
    }
  };

  const openEditDialog = (item: any, type: 'note' | 'legal-note' | 'transaction' | 'financial-transaction') => {
    switch(type) {
        case 'note': setEditingNote(item); setNoteDialogOpen(true); break;
        case 'legal-note': setEditingLegalNote(item); setLegalNoteDialogOpen(true); break;
        case 'transaction': setTransactionToEdit(item); setIsTxDialogOpen(true); break;
        case 'financial-transaction': setFinTxToEdit(item); setIsFinTxDialogOpen(true); break;
    }
  }

  return (
    <>
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
            {person.holdingPattern && <div><span className="font-semibold">Holding Pattern:</span> {person.holdingPattern}</div>}
        </div>
        
        {person.landRecords && person.landRecords.length > 0 && (
            <div className="space-y-2 pt-2">
                <h4 className="font-semibold text-sm">Land Records</h4>
                <div className="border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Survey No.</TableHead>
                                <TableHead>Extent</TableHead>
                                <TableHead>Class</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                           {person.landRecords.map(rec => (
                                <TableRow key={rec.id}>
                                    <TableCell>{rec.surveyNumber}</TableCell>
                                    <TableCell>{rec.acres || '0'}ac {rec.cents || '0'}c</TableCell>
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
              <PersonCard 
                key={heir.id} 
                person={heir} 
                onAddHeir={onAddHeir} 
                onUpdatePerson={onUpdatePerson} 
                projectId={projectId} 
                currentUser={currentUser}
                personFolders={[]}
                onAddFolder={onAddFolder}
                onDeleteFolder={onDeleteFolder}
                onAddFile={onAddFile}
                onDeleteFile={onDeleteFile}
              />
            ))}
          </div>
        </div>
      )}

      {isFamilyHead && (
        <div className="border-t p-4">
            <Accordion type="multiple" className="w-full space-y-4">
                 {/* Transaction History Section */}
                <AccordionItem value="transactions" className="border-b-0">
                    <AccordionTrigger className="text-lg font-medium hover:no-underline rounded-md p-2 hover:bg-muted/50">
                        <div className="flex items-center gap-2"><ScrollText /> Transaction History</div>
                    </AccordionTrigger>
                    <AccordionContent className="p-4 border-t">
                        <div className="flex justify-end mb-4">
                           <Button size="sm" onClick={() => { setTransactionToEdit(null); setIsTxDialogOpen(true); }}><Plus className="mr-2 h-4 w-4" />Add Transaction</Button>
                        </div>
                        <div className="rounded-md border">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Owner</TableHead>
                                <TableHead>Source Name</TableHead>
                                <TableHead>Mode</TableHead>
                                <TableHead>Year</TableHead>
                                <TableHead>Doc No.</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {transactions.length > 0 ? (
                                transactions.map((tx) => (
                                  <TableRow key={tx.id}>
                                    <TableCell className="font-medium">{tx.owner}</TableCell>
                                    <TableCell>{tx.sourceName}</TableCell>
                                    <TableCell><Badge variant={tx.mode === 'Purchase' ? 'default' : 'secondary'}>{tx.mode}</Badge></TableCell>
                                    <TableCell>{tx.year}</TableCell>
                                    <TableCell>{tx.doc}</TableCell>
                                    <TableCell className="text-right space-x-1">
                                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditDialog(tx, 'transaction')}><Edit className="h-4 w-4" /></Button>
                                      <AlertDialog>
                                        <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                                        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete this transaction record.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => handleDeleteTransaction(tx.id)}>Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
                                      </AlertDialog>
                                    </TableCell>
                                  </TableRow>
                                ))
                              ) : (
                                <TableRow>
                                  <TableCell colSpan={6} className="h-24 text-center">No transaction history for this family.</TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </div>
                    </AccordionContent>
                </AccordionItem>
                {/* Financial Transactions Section */}
                <AccordionItem value="financials" className="border-b-0">
                    <AccordionTrigger className="text-lg font-medium hover:no-underline rounded-md p-2 hover:bg-muted/50">
                        <div className="flex items-center gap-2"><Wallet /> Financial Transactions</div>
                    </AccordionTrigger>
                    <AccordionContent className="p-4 border-t">
                        <div className="flex justify-end mb-4">
                           <Button size="sm" onClick={() => { setFinTxToEdit(null); setIsFinTxDialogOpen(true); }}><Plus className="mr-2 h-4 w-4" />Add Payment</Button>
                        </div>
                        <div className="rounded-md border">
                            <Table>
                              <TableHeader>
                                  <TableRow>
                                      <TableHead>Amount</TableHead>
                                      <TableHead>Purpose</TableHead>
                                      <TableHead>Date of Payment</TableHead>
                                      <TableHead>Recorded At</TableHead>
                                      <TableHead className="text-right">Actions</TableHead>
                                  </TableRow>
                              </TableHeader>
                              <TableBody>
                                  {financialTransactions.length > 0 ? financialTransactions.map((tx) => (
                                      <TableRow key={tx.id}>
                                          <TableCell>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(tx.amount)}</TableCell>
                                          <TableCell><Badge variant={tx.purpose === 'Token Advance' ? 'secondary' : 'default'}>{tx.purpose}</Badge></TableCell>
                                          <TableCell>{format(new Date(tx.date), 'PPP')}</TableCell>
                                          <TableCell>{format(new Date(tx.timestamp), 'PP pp')}</TableCell>
                                           <TableCell className="text-right space-x-1">
                                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditDialog(tx, 'financial-transaction')}><Edit className="h-4 w-4" /></Button>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                                                    <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete this financial record.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => handleDeleteFinancialTx(tx.id)}>Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
                                                </AlertDialog>
                                            </TableCell>
                                      </TableRow>
                                  )) : (
                                      <TableRow>
                                          <TableCell colSpan={5} className="h-24 text-center">
                                              No financial transactions recorded for this family.
                                          </TableCell>
                                      </TableRow>
                                  )}
                              </TableBody>
                            </Table>
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* Title Documents Section */}
                 <AccordionItem value="documents" className="border-b-0">
                    <AccordionTrigger className="text-lg font-medium hover:no-underline rounded-md p-2 hover:bg-muted/50">
                        <div className="flex items-center gap-2"><FolderArchive /> Title Documents</div>
                    </AccordionTrigger>
                    <AccordionContent className="p-4 border-t">
                         {personFolders.length > 0 ? (
                            personFolders.map((folder) => (
                                <FolderView 
                                    key={folder.id} 
                                    folder={folder} 
                                    onAddFolder={onAddFolder} 
                                    onDeleteFolder={onDeleteFolder} 
                                    onAddFile={onAddFile} 
                                    onDeleteFile={onDeleteFile} 
                                    level={0} 
                                />
                            ))
                            ) : (
                            <div className="text-center text-muted-foreground p-8">
                                No document folders found for this family head.
                            </div>
                            )}
                    </AccordionContent>
                </AccordionItem>
                {/* Notes Section */}
                <AccordionItem value="notes" className="border-b-0">
                    <AccordionTrigger className="text-lg font-medium hover:no-underline rounded-md p-2 hover:bg-muted/50">
                        <div className="flex items-center gap-2"><StickyNote /> General Notes</div>
                    </AccordionTrigger>
                    <AccordionContent className="p-4 border-t">
                        <div className="flex justify-end mb-4">
                           <Button size="sm" onClick={() => openAddDialog('note')}><Plus className="mr-2 h-4 w-4" />Add Note</Button>
                        </div>
                        <div className="space-y-2">
                           {aggregatedNotes.length > 0 ? aggregatedNotes.map(note => (
                                <Card key={note.id} className="bg-background/70">
                                    <CardHeader className="flex flex-row justify-between items-start p-3">
                                        <div className="space-y-1">
                                            <CardTitle className="text-sm">Note for S.No: {note.surveyNumber}</CardTitle>
                                            <CardDescription className="text-xs">{format(new Date(note.date), 'PPP p')}</CardDescription>
                                        </div>
                                        <div>
                                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditDialog(note, 'note')}><Edit className="h-4 w-4" /></Button>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                                                <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete this note.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => handleDeleteNote(note)}>Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-3 pt-0"><p className="text-sm whitespace-pre-wrap">{note.content}</p>
                                    {note.urls.length > 0 && (<div className="flex flex-wrap gap-2 pt-2">{note.urls.map((url, i) => (<a key={i} href={url} target="_blank" rel="noopener noreferrer"><Badge><LinkIcon className="mr-1.5 h-3 w-3" />{url}</Badge></a>))}</div>)}
                                    </CardContent>
                                </Card>
                           )) : <p className="text-sm text-muted-foreground text-center p-4">No notes for this family.</p>}
                        </div>
                    </AccordionContent>
                </AccordionItem>
                {/* Legal Notes Section */}
                <AccordionItem value="legal-notes" className="border-b-0">
                    <AccordionTrigger className="text-lg font-medium hover:no-underline rounded-md p-2 hover:bg-muted/50">
                       <div className="flex items-center gap-2"><Gavel /> Legal Notes</div>
                    </AccordionTrigger>
                    <AccordionContent className="p-4 border-t">
                       <div className="flex justify-end mb-4">
                           <Button size="sm" onClick={() => openAddDialog('legal-note')}><Plus className="mr-2 h-4 w-4" />Add Legal Note</Button>
                        </div>
                        <div className="space-y-2">
                           {aggregatedLegalNotes.length > 0 ? aggregatedLegalNotes.map(note => (
                                <Card key={note.id} className="bg-background/70">
                                    <CardHeader className="flex flex-row justify-between items-start p-3">
                                        <div className="space-y-1">
                                            <CardTitle className="text-sm">Note by {note.author.name} for S.No: {note.surveyNumber}</CardTitle>
                                            <CardDescription className="text-xs">{format(new Date(note.date), 'PPP p')}</CardDescription>
                                        </div>
                                        <div>
                                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditDialog(note, 'legal-note')}><Edit className="h-4 w-4" /></Button>
                                            {canDeleteLegalNote && (
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                                                    <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete this legal note.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => handleDeleteLegalNote(note)}>Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
                                                </AlertDialog>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-3 pt-0"><p className="text-sm whitespace-pre-wrap">{note.content}</p></CardContent>
                                </Card>
                           )) : <p className="text-sm text-muted-foreground text-center p-4">No legal notes for this family.</p>}
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
      )}
    </Card>

    <TransactionFormDialog 
        isOpen={isTxDialogOpen}
        onOpenChange={setIsTxDialogOpen}
        onSave={handleSaveTransaction}
        transaction={transactionToEdit}
        ownerName={person.name}
    />

    <FinTxFormDialog 
        isOpen={isFinTxDialogOpen}
        onOpenChange={setIsFinTxDialogOpen}
        onSave={handleSaveFinancialTx}
        familyName={person.name}
        transaction={finTxToEdit}
    />

    {/* Note Dialog */}
    <FormDialog
        isOpen={isNoteDialogOpen}
        onOpenChange={setNoteDialogOpen}
        title={editingNote ? 'Edit Note' : 'Add Note'}
        surveyNumbers={surveyNumbers}
        onSave={handleSaveNote}
        initialData={editingNote}
        fields={[
            { name: 'content', label: 'Note Content', type: 'textarea' },
            { name: 'urls', label: 'Related URLs', type: 'urls' },
        ]}
    />

    {/* Legal Note Dialog */}
     <FormDialog
        isOpen={isLegalNoteDialogOpen}
        onOpenChange={setLegalNoteDialogOpen}
        title={editingLegalNote ? 'Edit Legal Note' : 'Add Legal Note'}
        surveyNumbers={surveyNumbers}
        onSave={handleSaveLegalNote}
        initialData={editingLegalNote}
        fields={[
            { name: 'content', label: 'Legal Note Content', type: 'textarea' },
        ]}
    />
    </>
  );
};


// Generic Form Dialog
type FormFieldType = {
  name: string;
  label: string;
  type: 'input' | 'textarea' | 'urls';
  inputType?: string;
}

interface FormDialogProps<T> {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  title: string;
  surveyNumbers: string[];
  onSave: (surveyNumber: string, data: Partial<T>) => void;
  initialData: (T & { surveyNumber?: string }) | null;
  fields: FormFieldType[];
}

function FormDialog<T>(
    { isOpen, onOpenChange, title, surveyNumbers, onSave, initialData, fields }: FormDialogProps<T>
) {
    const [formData, setFormData] = useState<Partial<T>>({});
    const [selectedSurveyNumber, setSelectedSurveyNumber] = useState('');
    
    // For URL field
    const [urls, setUrls] = useState<string[]>([]);
    const [currentUrl, setCurrentUrl] = useState('');

    useEffect(() => {
        if (isOpen) {
            setFormData(initialData || {});
            setSelectedSurveyNumber(initialData?.surveyNumber || (surveyNumbers.length > 0 ? surveyNumbers[0] : ''));
            if ('urls' in (initialData || {})) {
                setUrls((initialData as any).urls || []);
            } else {
                setUrls([]);
            }
        }
    }, [initialData, isOpen, surveyNumbers]);

    const handleAddUrl = () => {
        if (currentUrl.trim()) {
            setUrls([...urls, currentUrl.trim()]);
            setCurrentUrl('');
        }
    };

    const handleRemoveUrl = (urlToRemove: string) => {
        setUrls(urls.filter(url => url !== urlToRemove));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const finalData = fields.some(f => f.type === 'urls') ? { ...formData, urls } : formData;
        onSave(selectedSurveyNumber, finalData);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-xl">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{title}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto px-2">
                        <div className="space-y-2">
                            <Label htmlFor="survey-number-select">Survey Number</Label>
                            <Select value={selectedSurveyNumber} onValueChange={setSelectedSurveyNumber} disabled={!!initialData}>
                                <SelectTrigger id="survey-number-select"><SelectValue /></SelectTrigger>
                                <SelectContent>{surveyNumbers.map(sn => <SelectItem key={sn} value={sn}>{sn}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        {fields.map(field => (
                             <div key={field.name} className="space-y-2">
                                <Label htmlFor={field.name}>{field.label}</Label>
                                {field.type === 'input' && <Input id={field.name} type={field.inputType} value={(formData as any)[field.name] || ''} onChange={e => setFormData(f => ({...f, [field.name]: e.target.value }))} required />}
                                {field.type === 'textarea' && <Textarea id={field.name} value={(formData as any)[field.name] || ''} onChange={e => setFormData(f => ({...f, [field.name]: e.target.value }))} required rows={5} />}
                                {field.type === 'urls' && (
                                    <div className="space-y-2">
                                        <div className="flex gap-2"><Input placeholder="Add a URL" value={currentUrl} onChange={e => setCurrentUrl(e.target.value)} /><Button type="button" variant="outline" size="sm" onClick={handleAddUrl}>Add</Button></div>
                                        <div className="flex flex-wrap gap-1">{urls.map((url, i) => <Badge key={i} variant="secondary">{url}<button type="button" onClick={() => handleRemoveUrl(url)} className="ml-1 p-0.5 rounded-full hover:bg-muted-foreground/20"><X className="h-3 w-3"/></button></Badge>)}</div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    <DialogFooter className="border-t pt-4 mt-2">
                        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button type="submit">Save</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

