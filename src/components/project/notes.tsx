'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Save, Plus, Trash2, Edit, Link as LinkIcon, X } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

// Define the type for a single note
type Note = {
  id: string;
  date: string;
  content: string;
  urls: string[];
};

interface NotesProps {
    projectId: string;
}

export function Notes({ projectId }: NotesProps) {
    const [notes, setNotes] = useState<Note[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const { toast } = useToast();
    const storageKey = `notes-${projectId}`;

    // Form state for new notes
    const [newContent, setNewContent] = useState('');
    const [newUrls, setNewUrls] = useState<string[]>([]);
    const [currentUrl, setCurrentUrl] = useState('');

    // State for editing a note
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [noteToEdit, setNoteToEdit] = useState<Note | null>(null);

    // Load notes from local storage
    useEffect(() => {
        if (!projectId) return;
        try {
            const savedNotes = localStorage.getItem(storageKey);
            if (savedNotes) {
                setNotes(JSON.parse(savedNotes));
            }
        } catch (e) {
            console.error('Could not load notes', e);
        }
        setIsLoaded(true);
    }, [projectId, storageKey]);

    // Save notes to local storage
    useEffect(() => {
        if (isLoaded) {
            try {
                localStorage.setItem(storageKey, JSON.stringify(notes));
            } catch (e) {
                console.error('Could not save notes', e);
            }
        }
    }, [notes, isLoaded, storageKey]);

    const handleAddUrl = () => {
        if (currentUrl.trim()) {
            try {
                // Basic URL validation
                new URL(currentUrl);
                setNewUrls([...newUrls, currentUrl.trim()]);
                setCurrentUrl('');
            } catch (_) {
                toast({
                    variant: 'destructive',
                    title: 'Invalid URL',
                    description: 'Please enter a valid URL (e.g., https://example.com).',
                });
            }
        }
    };

    const handleRemoveUrl = (urlToRemove: string) => {
        setNewUrls(newUrls.filter(url => url !== urlToRemove));
    };

    const handleSaveNote = () => {
        if (!newContent.trim()) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Note content cannot be empty.',
            });
            return;
        }

        const newNote: Note = {
            id: `note-${Date.now()}`,
            date: new Date().toISOString(),
            content: newContent,
            urls: newUrls,
        };

        setNotes([newNote, ...notes]);
        
        // Reset form
        setNewContent('');
        setNewUrls([]);
        setCurrentUrl('');
        
        toast({
            title: 'Note Saved',
            description: 'Your new note has been added.',
        });
    };

    const handleDeleteNote = (noteId: string) => {
        setNotes(notes.filter(note => note.id !== noteId));
        toast({
            title: 'Note Deleted',
            description: 'The note has been removed.',
        });
    };

    const handleEditNote = (note: Note) => {
        setNoteToEdit(note);
        setIsEditDialogOpen(true);
    };
    
    const sortedNotes = [...notes].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Add New Note</CardTitle>
                    <CardDescription>Create a new date-stamped note. You can also add relevant URLs.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="note-content">Note Details</Label>
                        <Textarea
                            id="note-content"
                            placeholder="Type your notes here..."
                            value={newContent}
                            onChange={(e) => setNewContent(e.target.value)}
                            rows={5}
                            className="w-full"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="note-url">Add URL (optional)</Label>
                        <div className="flex gap-2">
                            <Input
                                id="note-url"
                                type="url"
                                placeholder="https://example.com"
                                value={currentUrl}
                                onChange={(e) => setCurrentUrl(e.target.value)}
                                onKeyDown={(e) => {
                                    if(e.key === 'Enter') {
                                        e.preventDefault();
                                        handleAddUrl();
                                    }
                                }}
                            />
                            <Button variant="outline" onClick={handleAddUrl}>
                                <Plus className="mr-2 h-4 w-4" /> Add
                            </Button>
                        </div>
                    </div>
                    {newUrls.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {newUrls.map((url, index) => (
                                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                                    {url}
                                    <button onClick={() => handleRemoveUrl(url)} className="rounded-full hover:bg-muted-foreground/20 p-0.5">
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            ))}
                        </div>
                    )}
                </CardContent>
                <CardFooter>
                    <Button onClick={handleSaveNote}>
                        <Save className="mr-2 h-4 w-4" />
                        Save Note
                    </Button>
                </CardFooter>
            </Card>

            <div className="space-y-4">
                 <h2 className="text-2xl font-semibold tracking-tight">Saved Notes</h2>
                 {sortedNotes.length > 0 ? (
                    sortedNotes.map(note => (
                        <Card key={note.id}>
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-lg">{format(new Date(note.date), 'PPP p')}</CardTitle>
                                        <CardDescription>Note ID: {note.id}</CardDescription>
                                    </div>
                                    <div className="flex gap-1">
                                        <Button variant="ghost" size="icon" onClick={() => handleEditNote(note)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This will permanently delete this note. This action cannot be undone.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => handleDeleteNote(note.id)}>Delete</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="whitespace-pre-wrap">{note.content}</p>
                            </CardContent>
                            {note.urls.length > 0 && (
                                <CardFooter className="flex flex-wrap gap-2">
                                    {note.urls.map((url, index) => (
                                        <a href={url} target="_blank" rel="noopener noreferrer" key={index}>
                                            <Badge>
                                                <LinkIcon className="mr-1.5 h-3 w-3" />
                                                {url}
                                            </Badge>
                                        </a>
                                    ))}
                                </CardFooter>
                            )}
                        </Card>
                    ))
                 ) : (
                    <div className="text-center text-muted-foreground p-8 border rounded-lg">
                        No notes found for this project.
                    </div>
                 )}
            </div>

            {noteToEdit && (
                <EditNoteDialog
                    key={noteToEdit.id}
                    isOpen={isEditDialogOpen}
                    onOpenChange={setIsEditDialogOpen}
                    note={noteToEdit}
                    onSave={(updatedNote) => {
                        setNotes(notes.map(n => n.id === updatedNote.id ? updatedNote : n));
                        setIsEditDialogOpen(false);
                        setNoteToEdit(null);
                        toast({ title: 'Note Updated', description: 'Your changes have been saved.' });
                    }}
                />
            )}
        </div>
    );
}

// Edit Note Dialog Component
interface EditNoteDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    note: Note;
    onSave: (updatedNote: Note) => void;
}

function EditNoteDialog({ isOpen, onOpenChange, note, onSave }: EditNoteDialogProps) {
    const [content, setContent] = useState(note.content);
    const [urls, setUrls] = useState(note.urls);
    const [currentUrl, setCurrentUrl] = useState('');
    const { toast } = useToast();

    const handleAddUrl = () => {
         if (currentUrl.trim()) {
            try {
                new URL(currentUrl);
                setUrls([...urls, currentUrl.trim()]);
                setCurrentUrl('');
            } catch (_) {
                toast({
                    variant: 'destructive',
                    title: 'Invalid URL',
                    description: 'Please enter a valid URL.',
                });
            }
        }
    };
    
    const handleRemoveUrl = (urlToRemove: string) => {
        setUrls(urls.filter(url => url !== urlToRemove));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...note, content, urls });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[625px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Edit Note</DialogTitle>
                        <DialogDescription>
                            Editing note from {format(new Date(note.date), 'PPP')}. Click save when you're done.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <Textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows={8}
                        />
                         <div className="space-y-2">
                            <Label>URLs</Label>
                            <div className="flex gap-2">
                                <Input
                                    type="url"
                                    placeholder="Add another URL"
                                    value={currentUrl}
                                    onChange={(e) => setCurrentUrl(e.target.value)}
                                     onKeyDown={(e) => {
                                        if(e.key === 'Enter') {
                                            e.preventDefault();
                                            handleAddUrl();
                                        }
                                    }}
                                />
                                <Button type="button" variant="outline" onClick={handleAddUrl}>
                                    <Plus className="mr-2 h-4 w-4" /> Add
                                </Button>
                            </div>
                         </div>
                         <div className="flex flex-wrap gap-2">
                            {urls.map((url, index) => (
                                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                                    {url}
                                    <button onClick={() => handleRemoveUrl(url)} className="rounded-full hover:bg-muted-foreground/20 p-0.5">
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            ))}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit">Save Changes</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
