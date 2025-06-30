'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { PlusCircle, Edit, Trash2, Bell, BellOff } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { Badge } from '../ui/badge';
import { format, isPast } from 'date-fns';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import type { User } from '@/types';

export type Task = {
  id: string;
  text: string;
  dueDate: string;
  completed: boolean;
  reminder: boolean;
};

interface TasksProps {
    projectId: string;
    surveyNumbers: string[];
    currentUser: User | null;
}

interface TaskFormDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onSave: (taskData: Omit<Task, 'id' | 'completed' | 'reminder'>) => void;
    task: Task | null;
}

function TaskFormDialog({ isOpen, onOpenChange, onSave, task }: TaskFormDialogProps) {
    const [text, setText] = useState('');
    const [dueDate, setDueDate] = useState('');

    useEffect(() => {
        if (task) {
            setText(task.text);
            setDueDate(task.dueDate);
        } else {
            setText('');
            setDueDate('');
        }
    }, [task, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ text, dueDate });
    };
    
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{task ? 'Edit Task' : 'Add New Task'}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="text" className="text-right">Task</Label>
                            <Input id="text" value={text} onChange={e => setText(e.target.value)} className="col-span-3" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="dueDate" className="text-right">Due Date</Label>
                            <Input id="dueDate" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="col-span-3" required />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit">Save Task</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export function Tasks({ projectId, surveyNumbers, currentUser }: TasksProps) {
    const { toast } = useToast();
    const [tasksBySurvey, setTasksBySurvey] = useState<Record<string, Task[]>>({});
    const [version, setVersion] = useState(0);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
    const [activeSurveyNumber, setActiveSurveyNumber] = useState<string | null>(null);

    useEffect(() => {
        const allTasks: Record<string, Task[]> = {};
        surveyNumbers.forEach(sn => {
            try {
                const storageKey = `tasks-${projectId}-${sn}`;
                const savedTasks = localStorage.getItem(storageKey);
                allTasks[sn] = savedTasks ? JSON.parse(savedTasks) : [];
            } catch (e) {
                console.error(`Could not load tasks for S.No. ${sn}`, e);
                allTasks[sn] = [];
            }
        });
        setTasksBySurvey(allTasks);
    }, [projectId, surveyNumbers, version]);

    const refreshTasks = () => setVersion(v => v + 1);

    const handleAddTask = (surveyNumber: string) => {
        setTaskToEdit(null);
        setActiveSurveyNumber(surveyNumber);
        setIsDialogOpen(true);
    };

    const handleEditTask = (task: Task, surveyNumber: string) => {
        setTaskToEdit(task);
        setActiveSurveyNumber(surveyNumber);
        setIsDialogOpen(true);
    };

    const handleDeleteTask = (surveyNumber: string, taskId: string) => {
        const storageKey = `tasks-${projectId}-${surveyNumber}`;
        const updatedTasks = (tasksBySurvey[surveyNumber] || []).filter(task => task.id !== taskId);
        localStorage.setItem(storageKey, JSON.stringify(updatedTasks));
        refreshTasks();
        toast({ title: "Task Deleted", description: "The task has been removed." });
    };

    const handleSaveTask = (taskData: Omit<Task, 'id' | 'completed' | 'reminder'>) => {
        if (!activeSurveyNumber) return;
        const storageKey = `tasks-${projectId}-${activeSurveyNumber}`;
        const currentTasks = tasksBySurvey[activeSurveyNumber] || [];
        let updatedTasks;

        if (taskToEdit) {
            updatedTasks = currentTasks.map(task => task.id === taskToEdit.id ? { ...taskToEdit, ...taskData } : task);
            toast({ title: "Task Updated" });
        } else {
            const newTask: Task = { id: `task-${Date.now()}`, ...taskData, completed: false, reminder: false };
            updatedTasks = [...currentTasks, newTask];
            toast({ title: "Task Added" });
        }
        localStorage.setItem(storageKey, JSON.stringify(updatedTasks));
        refreshTasks();
        setIsDialogOpen(false);
        setActiveSurveyNumber(null);
        setTaskToEdit(null);
    };
    
    const toggleCompletion = (surveyNumber: string, taskId: string) => {
        const storageKey = `tasks-${projectId}-${surveyNumber}`;
        const updatedTasks = (tasksBySurvey[surveyNumber] || []).map(task => 
            task.id === taskId ? { ...task, completed: !task.completed } : task
        );
        localStorage.setItem(storageKey, JSON.stringify(updatedTasks));
        refreshTasks();
    };
    
    const toggleReminder = (surveyNumber: string, taskId: string) => {
        const storageKey = `tasks-${projectId}-${surveyNumber}`;
        const updatedTasks = (tasksBySurvey[surveyNumber] || []).map(task => 
            task.id === taskId ? { ...task, reminder: !task.reminder } : task
        );
        localStorage.setItem(storageKey, JSON.stringify(updatedTasks));
        refreshTasks();
    };

    if (!currentUser) return null;

    if (surveyNumbers.length === 0) {
        return (
            <Card>
                <CardHeader><CardTitle>Tasks & Schedule</CardTitle></CardHeader>
                <CardContent className="text-center text-muted-foreground p-8">
                    No survey records found for this project. Add land records in the "Family Lineage" tab to enable tasks.
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
                           Tasks for Survey No: {sn}
                        </AccordionTrigger>
                        <AccordionContent className="p-4 border-t">
                            <div className="flex justify-end mb-4">
                                <Button onClick={() => handleAddTask(sn)}>
                                    <PlusCircle className="mr-2 h-4 w-4" /> Add Task for S.No. {sn}
                                </Button>
                            </div>
                            <Card>
                                <CardContent className="p-0">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-[50px]">Done</TableHead>
                                                <TableHead>Task</TableHead>
                                                <TableHead>Due Date</TableHead>
                                                <TableHead>Reminder</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {tasksBySurvey[sn]?.length > 0 ? (
                                                tasksBySurvey[sn].map(task => (
                                                    <TableRow key={task.id} className={task.completed ? 'text-muted-foreground line-through' : ''}>
                                                        <TableCell><Checkbox checked={task.completed} onCheckedChange={() => toggleCompletion(sn, task.id)} /></TableCell>
                                                        <TableCell className="font-medium">{task.text}</TableCell>
                                                        <TableCell>
                                                            <Badge variant={!task.completed && task.dueDate && isPast(new Date(task.dueDate)) ? 'destructive' : 'outline'}>
                                                                {task.dueDate ? format(new Date(task.dueDate), 'PPP') : 'No Date'}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Button variant="ghost" size="icon" onClick={() => toggleReminder(sn, task.id)}>
                                                                {task.reminder ? <Bell className="h-4 w-4 text-primary" /> : <BellOff className="h-4 w-4 text-muted-foreground" />}
                                                            </Button>
                                                        </TableCell>
                                                        <TableCell className="text-right space-x-2">
                                                            <Button variant="ghost" size="icon" onClick={() => handleEditTask(task, sn)} disabled={task.completed}><Edit className="h-4 w-4" /></Button>
                                                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDeleteTask(sn, task.id)}><Trash2 className="h-4 w-4" /></Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow><TableCell colSpan={5} className="h-24 text-center">No tasks found for this survey number.</TableCell></TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
            <TaskFormDialog
                isOpen={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                onSave={handleSaveTask}
                task={taskToEdit}
            />
        </>
    );
}
