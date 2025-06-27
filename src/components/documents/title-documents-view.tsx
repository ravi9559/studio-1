
'use client';

import { useState, FC } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Folder as FolderIcon, FolderPlus, File as FileIcon, FilePlus, Trash2, Download } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '../ui/label';
import type { Folder, DocumentFile } from '@/types';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

// --- DIALOGS ---

// Dialog for adding a new folder
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
  const [fileName, setFileName] = useState('');
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fileName.trim()) {
        const getFileExtension = (filename: string) => {
            return filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2);
        }
        const dummyContent = `This is a dummy file named ${fileName.trim()}.`;
        const dataUrl = `data:text/plain;base64,${btoa(dummyContent)}`;

      onSave({
        name: fileName.trim(),
        type: getFileExtension(fileName.trim()).toUpperCase() || 'File',
        size: `${(Math.random() * 8 + 0.5).toFixed(1)} MB`,
        uploaded: new Date().toISOString(),
        url: dataUrl,
      });
      setFileName('');
      onOpenChange(false);
    }
  };

  return (
    <DialogContent className="sm:max-w-md">
      <form onSubmit={handleSubmit}>
        <DialogHeader>
          <DialogTitle>Add New File Record</DialogTitle>
          <DialogDescription>
            Enter a file name to create a new record in "{folderName}".
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="file-name" className="text-right">File Name</Label>
            <Input id="file-name" value={fileName} onChange={(e) => setFileName(e.target.value)} className="col-span-3" placeholder="e.g., SaleDeed.pdf" required />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit">Add File</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
};

// --- VIEWS ---

// Recursive component to render folders and files
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


// Main component
interface TitleDocumentsViewProps {
  folders: Folder[];
  onAddFolder: (parentId: string, name: string) => void;
  onDeleteFolder: (folderId: string) => void;
  onAddFile: (folderId: string, fileData: Omit<DocumentFile, 'id'>) => void;
  onDeleteFile: (folderId: string, fileId: string) => void;
}

export function TitleDocumentsView({ folders, onAddFolder, onDeleteFolder, onAddFile, onDeleteFile }: TitleDocumentsViewProps) {
  return (
    <Card>
      <CardHeader>
        <div>
            <CardTitle>Title Documents</CardTitle>
            <CardDescription>
            Folders are automatically generated based on family heads and their land records. You can add file records and create sub-folders within this structure.
            </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {folders.length > 0 ? (
          folders.map((folder) => (
            <FolderView key={folder.id} folder={folder} onAddFolder={onAddFolder} onDeleteFolder={onDeleteFolder} onAddFile={onAddFile} onDeleteFile={onDeleteFile} level={0} />
          ))
        ) : (
          <div className="text-center text-muted-foreground p-8">
            No survey records found. Add land records in the "Family Lineage" tab to auto-create document folders.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
