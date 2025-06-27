'use client';

import { useState, useEffect } from 'react';
import type { LegalNote, User } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Edit, Save, Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface LegalNotesProps {
    projectId: string;
    surveyNumbers: string[];
    currentUser: User | null;
}

interface NoteEditorProps {
    surveyNumber: string;
    projectId: string;
    currentUser: User | null;
    onNoteAdded: () => void;
}

function NoteEditor({ surveyNumber, projectId, currentUser, onNoteAdded }: NoteEditorProps) {
    const [content, setContent] = useState('');
    const { toast } = useToast();
    const storageKey = `legal-notes-${projectId}-${surveyNumber}`;

    const handleSaveNote = () => {
        if (!content.trim() || !currentUser) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Note content cannot be empty.',
            });
            return;
        }

        const newNote: LegalNote = {
            id: `legal-note-${Date.now()}`,
            date: new Date().toISOString(),
            content: content,
            author: {
                id: currentUser.id,
                name: currentUser.name,
            },
        };

        try {
            const savedNotes = localStorage.getItem(storageKey);
            const notes: LegalNote[] = savedNotes ? JSON.parse(savedNotes) : [];
            const updatedNotes = [newNote, ...notes];
            localStorage.setItem(storageKey, JSON.stringify(updatedNotes));
            onNoteAdded(); // Trigger re-render in parent
            setContent('');
            toast({ title: 'Note Saved', description: 'Your new legal note has been added.' });
        } catch (e) {
            console.error('Could not save legal note', e);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to save note.' });
        }
    };

    return (
        <Card className="mt-4 bg-background/50">
            <CardHeader>
                <CardTitle className="text-lg">Add a New Note for S.No. {surveyNumber}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid w-full gap-1.5">
                    <Label htmlFor={`note-${surveyNumber}`}>Note Details</Label>
                    <Textarea
                        id={`note-${surveyNumber}`}
                        placeholder="Type your legal observations here..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows={4}
                    />
                </div>
            </CardContent>
            <CardFooter>
                <Button onClick={handleSaveNote}>
                    <Save className="mr-2 h-4 w-4" />
                    Save Note
                </Button>
            </CardFooter>
        </Card>
    );
}

interface EditNoteDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    note: LegalNote;
    onSave: (updatedNote: LegalNote) => void;
}

function EditNoteDialog({ isOpen, onOpenChange, note, onSave }: EditNoteDialogProps) {
    const [content, setContent] = useState(note.content);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...note, content, date: new Date().toISOString() }); // Update timestamp on edit
    };

    return (
         <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[625px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Edit Legal Note</DialogTitle>
                        <DialogDescription>
                           Last updated on {format(new Date(note.date), 'PPP p')}. Click save when you're done.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <Textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows={8}
                        />
                    </div>
                    <DialogFooter>
                        <Button type="submit">Save Changes</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export function LegalNotes({ projectId, surveyNumbers, currentUser }: LegalNotesProps) {
    const [notesBySurvey, setNotesBySurvey] = useState<Record<string, LegalNote[]>>({});
    const [noteToEdit, setNoteToEdit] = useState<LegalNote | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [version, setVersion] = useState(0); // Used to force re-renders
    const { toast } = useToast();

    useEffect(() => {
        const allNotes: Record<string, LegalNote[]> = {};
        surveyNumbers.forEach(sn => {
            try {
                const storageKey = `legal-notes-${projectId}-${sn}`;
                const savedNotes = localStorage.getItem(storageKey);
                const notes: LegalNote[] = savedNotes ? JSON.parse(savedNotes) : [];
                allNotes[sn] = notes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            } catch (e) {
                 console.error(`Could not load notes for S.No. ${sn}`, e);
                 allNotes[sn] = [];
            }
        });
        setNotesBySurvey(allNotes);
    }, [projectId, surveyNumbers, version]);

    const refreshNotes = () => setVersion(v => v + 1);

    const canDelete = currentUser?.role !== 'Lawyer';

    const handleEditNote = (note: LegalNote) => {
        setNoteToEdit(note);
        setIsEditDialogOpen(true);
    };

    const handleSaveEditedNote = (surveyNumber: string, updatedNote: LegalNote) => {
        const storageKey = `legal-notes-${projectId}-${surveyNumber}`;
        const currentNotes = notesBySurvey[surveyNumber] || [];
        const updatedNotes = currentNotes.map(n => n.id === updatedNote.id ? updatedNote : n);
        localStorage.setItem(storageKey, JSON.stringify(updatedNotes));
        setIsEditDialogOpen(false);
        setNoteToEdit(null);
        refreshNotes();
        toast({ title: 'Note Updated' });
    };

    const handleDeleteNote = (surveyNumber: string, noteId: string) => {
        const storageKey = `legal-notes-${projectId}-${surveyNumber}`;
        const currentNotes = notesBySurvey[surveyNumber] || [];
        const updatedNotes = currentNotes.filter(n => n.id !== noteId);
        localStorage.setItem(storageKey, JSON.stringify(updatedNotes));
        refreshNotes();
        toast({ title: 'Note Deleted' });
    };

    if (!currentUser) return null;

    return (
        <>
            <Accordion type="multiple" className="w-full space-y-4">
                {surveyNumbers.map(sn => (
                    <AccordionItem value={sn} key={sn} className="border rounded-lg">
                        <AccordionTrigger className="p-4 text-lg font-medium hover:no-underline">
                            Notes for Survey No: {sn}
                        </AccordionTrigger>
                        <AccordionContent className="p-4 border-t">
                            <NoteEditor
                                surveyNumber={sn}
                                projectId={projectId}
                                currentUser={currentUser}
                                onNoteAdded={refreshNotes}
                            />
                            <div className="mt-6 space-y-4">
                                {notesBySurvey[sn]?.map(note => (
                                    <Card key={note.id}>
                                        <CardHeader>
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <CardTitle className="text-base">
                                                        Note by {note.author.name}
                                                    </CardTitle>
                                                    <CardDescription>
                                                        {format(new Date(note.date), 'PPP p')}
                                                    </CardDescription>
                                                </div>
                                                 <div className="flex gap-1">
                                                    <Button variant="ghost" size="icon" onClick={() => handleEditNote(note)}>
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    {canDelete && (
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
                                                                        This will permanently delete this note.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                    <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => handleDeleteNote(sn, note.id)}>Delete</AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    )}
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="whitespace-pre-wrap text-sm">{note.content}</p>
                                        </CardContent>
                                    </Card>
                                ))}
                                {(!notesBySurvey[sn] || notesBySurvey[sn].length === 0) && (
                                     <div className="text-center text-muted-foreground p-8 border rounded-lg border-dashed">
                                        No legal notes found for this survey number.
                                    </div>
                                )}
                            </div>
                             {noteToEdit && (
                                <EditNoteDialog
                                    key={noteToEdit.id}
                                    isOpen={isEditDialogOpen}
                                    onOpenChange={setIsEditDialogOpen}
                                    note={noteToEdit}
                                    onSave={(updatedNote) => handleSaveEditedNote(sn, updatedNote)}
                                />
                            )}
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </>
    );
}
