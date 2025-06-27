'use client';

import { useState, FC } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Folder as FolderIcon, FolderPlus, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '../ui/label';

// Define the type for a Folder
export type Folder = {
  id: string;
  name: string;
  children: Folder[];
};

// Recursive component to render folders
const FolderView: FC<{
  folder: Folder;
  onAddFolder: (parentId: string, name: string) => void;
  onDeleteFolder: (folderId: string) => void;
  level: number;
}> = ({ folder, onAddFolder, onDeleteFolder, level }) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFolderName.trim()) {
      onAddFolder(folder.id, newFolderName.trim());
      setNewFolderName('');
      setIsAddDialogOpen(false);
    }
  };

  return (
    <div style={{ marginLeft: `${level * 20}px` }} className="mt-2">
      <div className="flex items-center gap-2 p-2 rounded-md hover:bg-accent">
        <FolderIcon className="h-5 w-5 text-primary" />
        <span className="flex-grow font-medium">{folder.name}</span>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <FolderPlus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <form onSubmit={handleAddSubmit}>
              <DialogHeader>
                <DialogTitle>Add New Folder</DialogTitle>
                <DialogDescription>
                  Enter a name for the new folder inside "{folder.name}".
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="folder-name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="folder-name"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    className="col-span-3"
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Add Folder</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => onDeleteFolder(folder.id)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      {folder.children.map((child) => (
        <FolderView key={child.id} folder={child} onAddFolder={onAddFolder} onDeleteFolder={onDeleteFolder} level={level + 1} />
      ))}
    </div>
  );
};

// Main component
interface TitleDocumentsViewProps {
  folders: Folder[];
  onAddFolder: (parentId: string, name: string) => void;
  onDeleteFolder: (folderId: string) => void;
}

export function TitleDocumentsView({ folders, onAddFolder, onDeleteFolder }: TitleDocumentsViewProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
            <CardTitle>Title Documents</CardTitle>
            <CardDescription>
            Folders are auto-generated when you add land records in the Family Lineage tab. You can add or remove sub-folders here.
            </CardDescription>
        </div>
        <Button onClick={() => onAddFolder('root', 'New Root Folder')}>
            <FolderPlus className="mr-2 h-4 w-4" /> Add Root Folder
        </Button>
      </CardHeader>
      <CardContent>
        {folders.length > 0 ? (
          folders.map((folder) => (
            <FolderView key={folder.id} folder={folder} onAddFolder={onAddFolder} onDeleteFolder={onDeleteFolder} level={0} />
          ))
        ) : (
          <div className="text-center text-muted-foreground p-8">
            No survey records found for this project. Add land records in the "Family Lineage" tab to automatically create document folders.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
