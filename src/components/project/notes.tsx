'use client';

import { useState, useEffect } from 'react';
import type { Note, User } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Edit, Save, Trash2, Link as LinkIcon, Plus, X } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

interface NotesProps {
    projectId: string;
    surveyNumbers: string[];
    currentUser: User | null;
}

function NoteEditor({ surveyNumber, projectId, onNoteAdded }: NoteEditorProps) {
    const [content, setContent] = useState('');
    const [urls, setUrls] = useState<string[]>([]);
    const [currentUrl, setCurrentUrl] = useState('');
    const { toast } = useToast();
    const storageKey = `notes-${projectId}-${surveyNumber}`;

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

    const handleSaveNote = () => {
        if (!content.trim()) {
            toast({ variant: 'destructive', title: 'Error', description: 'Note content cannot be empty.' });
            return;
        }

        const newNote: Note = {
            id: `note-${Date.now()}`,
            date: new Date().toISOString(),
            content: content,
            urls: urls,
        };

        try {
            const savedNotes = localStorage.getItem(storageKey);
            const notes: Note[] = savedNotes ? JSON.parse(savedNotes) : [];
            const updatedNotes = [newNote, ...notes];
            localStorage.setItem(storageKey, JSON.stringify(updatedNotes));
            onNoteAdded();
            setContent('');
            setUrls([]);
            setCurrentUrl('');
            toast({ title: 'Note Saved', description: 'Your new note has been added.' });
        } catch (e) {
            console.error('Could not save note', e);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to save note.' });
        }
    };

    return (
        <Card className="mt-4 bg-background/50">
            <CardHeader>
                <CardTitle className="text-lg">Add a New Note for S.No. {surveyNumber}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor={`note-content-${surveyNumber}`}>Note Details</Label>
                    <Textarea
                        id={`note-content-${surveyNumber}`}
                        placeholder="Type your notes here..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows={4}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor={`note-url-${surveyNumber}`}>Add URL (optional)</Label>
                    <div className="flex gap-2">
                        <Input
                            id={`note-url-${surveyNumber}`}
                            type="url"
                            placeholder="https://example.com"
                            value={currentUrl}
                            onChange={(e) => setCurrentUrl(e.target.value)}
                        />
                        <Button type="button" variant="outline" onClick={handleAddUrl}><Plus className="mr-2 h-4 w-4" /> Add</Button>
                    </div>
                </div>
                {urls.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {urls.map((url, index) => (
                            <Badge key={index} variant="secondary" className="flex items-center gap-1">
                                {url}
                                <button onClick={() => handleRemoveUrl(url)} className="rounded-full hover:bg-muted-foreground/20 p-0.5"><X className="h-3 w-3" /></button>
                            </Badge>
                        ))}
                    </div>
                )}
            </CardContent>
            <CardFooter>
                <Button onClick={handleSaveNote}><Save className="mr-2 h-4 w-4" />Save Note</Button>
            </CardFooter>
        </Card>
    );
}

interface NoteEditorProps {
    surveyNumber: string;
    projectId: string;
    onNoteAdded: () => void;
}

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
                toast({ variant: 'destructive', title: 'Invalid URL', description: 'Please enter a valid URL.' });
            }
        }
    };

    const handleRemoveUrl = (urlToRemove: string) => {
        setUrls(urls.filter(url => url !== urlToRemove));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...note, content, urls, date: new Date().toISOString() });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[625px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Edit Note</DialogTitle>
                        <DialogDescription>
                            Last updated on {format(new Date(note.date), 'PPP p')}. Click save when you're done.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <Textarea value={content} onChange={(e) => setContent(e.target.value)} rows={8} />
                        <div className="space-y-2">
                            <Label>URLs</Label>
                            <div className="flex gap-2">
                                <Input type="url" placeholder="Add another URL" value={currentUrl} onChange={(e) => setCurrentUrl(e.target.value)} />
                                <Button type="button" variant="outline" onClick={handleAddUrl}><Plus className="mr-2 h-4 w-4" /> Add</Button>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {urls.map((url, index) => (
                                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                                    {url}
                                    <button onClick={() => handleRemoveUrl(url)} className="rounded-full hover:bg-muted-foreground/20 p-0.5"><X className="h-3 w-3" /></button>
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

export function Notes({ projectId, surveyNumbers, currentUser }: NotesProps) {
    const [notesBySurvey, setNotesBySurvey] = useState<Record<string, Note[]>>({});
    const [noteToEdit, setNoteToEdit] = useState<{ note: Note; surveyNumber: string } | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [version, setVersion] = useState(0);
    const { toast } = useToast();

    useEffect(() => {
        const allNotes: Record<string, Note[]> = {};
        surveyNumbers.forEach(sn => {
            try {
                const storageKey = `notes-${projectId}-${sn}`;
                const savedNotes = localStorage.getItem(storageKey);
                allNotes[sn] = savedNotes ? JSON.parse(savedNotes) : [];
            } catch (e) {
                console.error(`Could not load notes for S.No. ${sn}`, e);
                allNotes[sn] = [];
            }
        });
        setNotesBySurvey(allNotes);
    }, [projectId, surveyNumbers, version]);

    const refreshNotes = () => setVersion(v => v + 1);

    const handleEditNote = (note: Note, surveyNumber: string) => {
        setNoteToEdit({ note, surveyNumber });
        setIsEditDialogOpen(true);
    };

    const handleSaveEditedNote = (updatedNote: Note) => {
        if (!noteToEdit) return;
        const { surveyNumber } = noteToEdit;
        const storageKey = `notes-${projectId}-${surveyNumber}`;
        const currentNotes = notesBySurvey[surveyNumber] || [];
        const updatedNotes = currentNotes.map(n => n.id === updatedNote.id ? updatedNote : n);
        localStorage.setItem(storageKey, JSON.stringify(updatedNotes));
        setIsEditDialogOpen(false);
        setNoteToEdit(null);
        refreshNotes();
        toast({ title: 'Note Updated' });
    };

    const handleDeleteNote = (surveyNumber: string, noteId: string) => {
        const storageKey = `notes-${projectId}-${surveyNumber}`;
        const currentNotes = notesBySurvey[surveyNumber] || [];
        const updatedNotes = currentNotes.filter(n => n.id !== noteId);
        localStorage.setItem(storageKey, JSON.stringify(updatedNotes));
        refreshNotes();
        toast({ title: 'Note Deleted' });
    };

    if (!currentUser) return null;

    if (surveyNumbers.length === 0) {
        return (
            <Card>
                <CardHeader><CardTitle>Project Notes</CardTitle></CardHeader>
                <CardContent className="text-center text-muted-foreground p-8">
                    No survey records found for this project. Add land records in the "Family Lineage" tab to enable notes.
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            <Accordion type="multiple" className="w-full space-y-4">
                {surveyNumbers.map(sn => (
                    <AccordionItem value={sn} key={sn} className="border rounded-lg">
                        <AccordionTrigger className="p-4 text-lg font-medium hover:no-underline">
                            Notes for Survey No: {sn}
                        </AccordionTrigger>
                        <AccordionContent className="p-4 border-t">
                            <NoteEditor surveyNumber={sn} projectId={projectId} onNoteAdded={refreshNotes} />
                            <div className="mt-6 space-y-4">
                                {notesBySurvey[sn]?.map(note => (
                                    <Card key={note.id}>
                                        <CardHeader>
                                            <div className="flex justify-between items-start">
                                                <CardTitle className="text-base">Note from {format(new Date(note.date), 'PPP p')}</CardTitle>
                                                <div className="flex gap-1">
                                                    <Button variant="ghost" size="icon" onClick={() => handleEditNote(note, sn)}><Edit className="h-4 w-4" /></Button>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                                <AlertDialogDescription>This will permanently delete this note.</AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => handleDeleteNote(sn, note.id)}>Delete</AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="whitespace-pre-wrap text-sm">{note.content}</p>
                                            {note.urls.length > 0 && (
                                                <div className="flex flex-wrap gap-2 pt-4">
                                                    {note.urls.map((url, index) => (
                                                        <a href={url} target="_blank" rel="noopener noreferrer" key={index}>
                                                            <Badge><LinkIcon className="mr-1.5 h-3 w-3" />{url}</Badge>
                                                        </a>
                                                    ))}
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                                {(!notesBySurvey[sn] || notesBySurvey[sn].length === 0) && (
                                    <div className="text-center text-muted-foreground p-8 border rounded-lg border-dashed">
                                        No notes found for this survey number.
                                    </div>
                                )}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
            {noteToEdit && (
                <EditNoteDialog
                    key={noteToEdit.note.id}
                    isOpen={isEditDialogOpen}
                    onOpenChange={setIsEditDialogOpen}
                    note={noteToEdit.note}
                    onSave={handleSaveEditedNote}
                />
            )}
        </>
    );
}
