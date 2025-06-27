'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UploadCloud, FileText, Download, Trash2, HardDrive } from "lucide-react";

// Define the type for a file
type File = {
  id: string;
  name: string;
  type: string;
  size: string;
  uploaded: string;
};

// Initial mock data for new projects
const initialFiles: File[] = [
    { id: 'file-1', name: 'Sale_Deed_1980.pdf', type: 'PDF', size: '2.3 MB', uploaded: '2023-05-10' },
    { id: 'file-2', name: 'Patta_Copy.jpeg', type: 'Image', size: '800 KB', uploaded: '2023-05-11' },
    { id: 'file-3', name: 'EC_1980-2023.pdf', type: 'PDF', size: '5.1 MB', uploaded: '2023-06-01' },
];

interface FileManagerProps {
    projectId: string;
}

export function FileManager({ projectId }: FileManagerProps) {
    const [files, setFiles] = useState<File[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const storageKey = `files-${projectId}`;

    // Load files from localStorage
    useEffect(() => {
        if (!projectId) return;
        try {
            const savedFiles = localStorage.getItem(storageKey);
            if (savedFiles) {
                setFiles(JSON.parse(savedFiles));
            } else {
                setFiles(initialFiles);
            }
        } catch (e) {
            console.error("Could not load files", e);
            setFiles(initialFiles);
        }
        setIsLoaded(true);
    }, [projectId, storageKey]);

    // Save files to localStorage
    useEffect(() => {
        if (isLoaded) {
            try {
                localStorage.setItem(storageKey, JSON.stringify(files));
            } catch (e) {
                console.error("Could not save files", e);
            }
        }
    }, [files, isLoaded, storageKey]);

    const handleDeleteFile = (fileId: string) => {
        setFiles(files.filter(f => f.id !== fileId));
    };

    const handleSaveFile = (fileName: string) => {
        const getFileExtension = (filename: string) => {
            return filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2);
        }

        const newFile: File = {
            id: `file-${Date.now()}`,
            name: fileName,
            type: getFileExtension(fileName).toUpperCase() || 'File',
            size: `${(Math.random() * 8 + 0.5).toFixed(1)} MB`,
            uploaded: new Date().toISOString().split('T')[0],
        };
        setFiles([newFile, ...files]);
        setIsDialogOpen(false);
    };

    return (
        <>
            <Card>
                <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <CardTitle>Files &amp; Documents</CardTitle>
                        <CardDescription>Manage all related project documents.</CardDescription>
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                        <Button variant="outline" className="flex-1 md:flex-initial" disabled><HardDrive className="mr-2 h-4 w-4" /> Connect Google Drive</Button>
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="flex-1 md:flex-initial"><UploadCloud className="mr-2 h-4 w-4" /> Upload File</Button>
                            </DialogTrigger>
                            <FileFormDialog onSave={handleSaveFile} />
                        </Dialog>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>File Name</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Size</TableHead>
                                <TableHead>Date Uploaded</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {files.length > 0 ? (
                                files.map((file) => (
                                    <TableRow key={file.id}>
                                        <TableCell className="font-medium flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-muted-foreground" />
                                            {file.name}
                                        </TableCell>
                                        <TableCell>{file.type}</TableCell>
                                        <TableCell>{file.size}</TableCell>
                                        <TableCell>{file.uploaded}</TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Button variant="ghost" size="icon" disabled><Download className="h-4 w-4" /></Button>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            This action cannot be undone. This will permanently delete this file record.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => handleDeleteFile(file.id)}>Delete</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                        No files found. Click "Upload File" to add documents.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </>
    );
}

// File Form Dialog Component
interface FileFormDialogProps {
    onSave: (fileName: string) => void;
}

function FileFormDialog({ onSave }: FileFormDialogProps) {
    const [name, setName] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name) return;
        onSave(name);
    };

    return (
        <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleSubmit}>
                <DialogHeader>
                    <DialogTitle>Add New File Record</DialogTitle>
                    <DialogDescription>
                        Enter a file name to create a record. This is a simulation and no file will actually be uploaded.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">File Name</Label>
                        <Input id="name" value={name} onChange={e => setName(e.target.value)} className="col-span-3" placeholder="e.g., LegalOpinion.pdf" required />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit">Save File Record</Button>
                </DialogFooter>
            </form>
        </DialogContent>
    );
}
