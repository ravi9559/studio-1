'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Save } from 'lucide-react';

interface NotesProps {
    projectId: string;
}

export function Notes({ projectId }: NotesProps) {
    const [notes, setNotes] = useState('');
    const [isLoaded, setIsLoaded] = useState(false);
    const { toast } = useToast();
    const storageKey = `notes-${projectId}`;

    useEffect(() => {
        if (!projectId) return;
        try {
            const savedNotes = localStorage.getItem(storageKey);
            if (savedNotes) {
                setNotes(savedNotes);
            }
        } catch (e) {
            console.error('Could not load notes', e);
        }
        setIsLoaded(true);
    }, [projectId, storageKey]);

    const handleSave = () => {
        if (!isLoaded) return;
        try {
            localStorage.setItem(storageKey, notes);
            toast({
                title: 'Notes Saved',
                description: 'Your notes have been successfully saved.',
            });
        } catch (e) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Could not save your notes.',
            });
            console.error('Could not save notes', e);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Project Notes</CardTitle>
                <CardDescription>Jot down any important notes, reminders, or details for this project.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Textarea
                    placeholder="Type your notes here..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={15}
                    className="w-full"
                />
                <Button onClick={handleSave}>
                    <Save className="mr-2 h-4 w-4" />
                    Save Notes
                </Button>
            </CardContent>
        </Card>
    );
}
