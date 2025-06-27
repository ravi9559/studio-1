'use client';

import { useState, useEffect, FC } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Folder as FolderIcon, FolderPlus, ChevronRight, ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

// Define the type for a Folder
export type Folder = {
  id: string;
  name: string;
  folders: Folder[];
};

// Initial folder structure for new projects
const initialFolders: Folder[] = [
  {
    id: 'survey',
    name: 'Survey/Sub-Div',
    folders: [
      {
        id: 'revenue',
        name: 'Revenue Record',
        folders: [
          {
            id: 'sro',
            name: 'SRO Records',
            folders: [
              {
                id: 'kyc',
                name: 'Seller KYC',
                folders: [],
              },
            ],
          },
        ],
      },
    ],
  },
];

interface TitleDocumentsViewProps {
  projectId: string;
}

// Recursive function to add a folder
const addFolderToTree = (folders: Folder[], parentId: string, newFolderName: string): Folder[] => {
  return folders.map(folder => {
    if (folder.id === parentId) {
      const newFolder: Folder = {
        id: `${parentId}-${Date.now()}`,
        name: newFolderName,
        folders: [],
      };
      return { ...folder, folders: [...folder.folders, newFolder] };
    }
    if (folder.folders.length > 0) {
      return { ...folder, folders: addFolderToTree(folder.folders, parentId, newFolderName) };
    }
    return folder;
  });
};


export function TitleDocumentsView({ projectId }: TitleDocumentsViewProps) {
  const [rootFolders, setRootFolders] = useState<Folder[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const storageKey = `title-documents-${projectId}`;

  // Load folders from localStorage
  useEffect(() => {
    if (!projectId) return;
    try {
      const savedFolders = localStorage.getItem(storageKey);
      if (savedFolders) {
        setRootFolders(JSON.parse(savedFolders));
      } else {
        setRootFolders(initialFolders);
      }
    } catch (e) {
      console.error("Could not load folders", e);
      setRootFolders(initialFolders);
    }
    setIsLoaded(true);
  }, [projectId, storageKey]);

  // Save folders to localStorage
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(rootFolders));
      } catch (e) {
        console.error("Could not save folders", e);
      }
    }
  }, [rootFolders, isLoaded, storageKey]);

  const handleAddFolder = (parentId: string | null, folderName: string) => {
    if (parentId) {
      setRootFolders(currentFolders => addFolderToTree(currentFolders, parentId, folderName));
    } else {
      // Adding a root folder
      const newRootFolder: Folder = {
        id: `root-${Date.now()}`,
        name: folderName,
        folders: [],
      };
      setRootFolders(currentFolders => [...currentFolders, newRootFolder]);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <CardTitle>Title Documents</CardTitle>
          <CardDescription>Organize and manage title documents in a folder structure.</CardDescription>
        </div>
        <AddFolderDialog onAddFolder={(name) => handleAddFolder(null, name)}>
            <Button><FolderPlus className="mr-2 h-4 w-4" /> Add Root Folder</Button>
        </AddFolderDialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
            {rootFolders.map(folder => (
                <FolderItem key={folder.id} folder={folder} onAddFolder={handleAddFolder} />
            ))}
             {rootFolders.length === 0 && (
                <div className="text-center text-muted-foreground p-8">
                    <p>No folders found. Add a root folder to get started.</p>
                </div>
            )}
        </div>
      </CardContent>
    </Card>
  );
}

interface FolderItemProps {
    folder: Folder;
    onAddFolder: (parentId: string, folderName: string) => void;
}

const FolderItem: FC<FolderItemProps> = ({ folder, onAddFolder }) => {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <div className="flex items-center gap-2">
                <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="flex-1 justify-start">
                        {isOpen ? <ChevronDown className="h-4 w-4 mr-2" /> : <ChevronRight className="h-4 w-4 mr-2" />}
                        <FolderIcon className="h-5 w-5 mr-2 text-primary" />
                        <span className="font-medium">{folder.name}</span>
                    </Button>
                </CollapsibleTrigger>
                <AddFolderDialog onAddFolder={(name) => onAddFolder(folder.id, name)}>
                    <Button variant="ghost" size="icon"><FolderPlus className="h-4 w-4" /></Button>
                </AddFolderDialog>
            </div>
            <CollapsibleContent>
                <div className="pl-8 pt-2 space-y-2 border-l-2 border-dashed ml-4">
                    {folder.folders.length > 0 ? folder.folders.map(subFolder => (
                        <FolderItem key={subFolder.id} folder={subFolder} onAddFolder={onAddFolder} />
                    )) : <p className="text-sm text-muted-foreground pl-5 py-1">No sub-folders.</p>}
                </div>
            </CollapsibleContent>
        </Collapsible>
    );
};

interface AddFolderDialogProps {
    onAddFolder: (name: string) => void;
    children: React.ReactNode;
}

const AddFolderDialog: FC<AddFolderDialogProps> = ({ onAddFolder, children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [name, setName] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        onAddFolder(name);
        setName('');
        setIsOpen(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Add New Folder</DialogTitle>
                        <DialogDescription>
                            Enter a name for the new folder.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="folder-name" className="text-right">Name</Label>
                            <Input
                                id="folder-name"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="col-span-3"
                                placeholder="e.g., Legal Documents"
                                required
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit">Create Folder</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
