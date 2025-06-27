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

export type Task = {
  id: string;
  text: string;
  dueDate: string;
  completed: boolean;
  reminder: boolean;
};

const initialTasks: Task[] = [
    { id: 'task-1', text: 'Review initial land documents', dueDate: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString().split('T')[0], completed: true, reminder: false },
    { id: 'task-2', text: 'Contact legal counsel for opinion', dueDate: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split('T')[0], completed: false, reminder: true },
    { id: 'task-3', text: 'Schedule site visit', dueDate: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0], completed: false, reminder: false },
];

interface TasksProps {
    projectId: string;
}

export function Tasks({ projectId }: TasksProps) {
    const { toast } = useToast();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
    const storageKey = `tasks-${projectId}`;

    useEffect(() => {
        if (!projectId) return;
        try {
            const savedTasks = localStorage.getItem(storageKey);
            if (savedTasks) {
                setTasks(JSON.parse(savedTasks));
            } else {
                setTasks(initialTasks);
            }
        } catch (e) {
            console.error("Could not load tasks", e);
            setTasks(initialTasks);
        }
        setIsLoaded(true);
    }, [projectId, storageKey]);

    useEffect(() => {
        if (isLoaded) {
            try {
                localStorage.setItem(storageKey, JSON.stringify(tasks));
            } catch (e) {
                console.error("Could not save tasks", e);
            }
        }
    }, [tasks, isLoaded, storageKey]);

    const handleAddTask = () => {
        setTaskToEdit(null);
        setIsDialogOpen(true);
    };

    const handleEditTask = (task: Task) => {
        setTaskToEdit(task);
        setIsDialogOpen(true);
    };

    const handleDeleteTask = (taskId: string) => {
        setTasks(tasks.filter(task => task.id !== taskId));
        toast({ title: "Task Deleted", description: "The task has been removed." });
    };

    const handleSaveTask = (taskData: Omit<Task, 'id' | 'completed' | 'reminder'>) => {
        if (taskToEdit) {
            setTasks(tasks.map(task => task.id === taskToEdit.id ? { ...taskToEdit, ...taskData } : task));
            toast({ title: "Task Updated", description: "The task details have been saved." });
        } else {
            const newTask: Task = {
                id: `task-${Date.now()}`,
                ...taskData,
                completed: false,
                reminder: false,
            };
            setTasks([...tasks, newTask]);
            toast({ title: "Task Added", description: "The new task has been created." });
        }
        setIsDialogOpen(false);
    };
    
    const toggleCompletion = (taskId: string) => {
        setTasks(tasks.map(task => task.id === taskId ? { ...task, completed: !task.completed } : task));
    };
    
    const toggleReminder = (taskId: string) => {
        setTasks(tasks.map(task => task.id === taskId ? { ...task, reminder: !task.reminder } : task));
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Tasks & Schedule</CardTitle>
                    <CardDescription>Manage your to-do list for this project.</CardDescription>
                </div>
                <Button onClick={handleAddTask}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Task
                </Button>
            </CardHeader>
            <CardContent>
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
                        {tasks.map(task => (
                            <TableRow key={task.id} className={task.completed ? 'text-muted-foreground line-through' : ''}>
                                <TableCell>
                                    <Checkbox checked={task.completed} onCheckedChange={() => toggleCompletion(task.id)} />
                                </TableCell>
                                <TableCell className="font-medium">{task.text}</TableCell>
                                <TableCell>
                                    <Badge variant={!task.completed && task.dueDate && isPast(new Date(task.dueDate)) ? 'destructive' : 'outline'}>
                                        {task.dueDate ? format(new Date(task.dueDate), 'PPP') : 'No Date'}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Button variant="ghost" size="icon" onClick={() => toggleReminder(task.id)}>
                                        {task.reminder ? <Bell className="h-4 w-4 text-primary" /> : <BellOff className="h-4 w-4 text-muted-foreground" />}
                                    </Button>
                                </TableCell>
                                <TableCell className="text-right space-x-2">
                                    <Button variant="ghost" size="icon" onClick={() => handleEditTask(task)} disabled={task.completed}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDeleteTask(task.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
            <TaskFormDialog
                isOpen={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                onSave={handleSaveTask}
                task={taskToEdit}
            />
        </Card>
    );
}

// Task Form Dialog
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
