
'use client';

import { useState, useEffect, type FC } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import { initialTransactions } from '@/lib/initial-data';

// Define the type for a transaction
type Transaction = {
  id: string;
  owner: string;
  sourceName: string;
  mode: 'Purchase' | 'Legal Heir' | 'Gift' | 'Settlement';
  year: number;
  doc: string;
};

interface TransactionHistoryProps {
    projectId: string;
}

export function TransactionHistory({ projectId }: TransactionHistoryProps) {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);

    const storageKey = `transactions-${projectId}`;
    
    // Load transactions from localStorage
    useEffect(() => {
        if (!projectId) return;
        try {
            const savedTransactions = localStorage.getItem(storageKey);
            if (savedTransactions) {
                setTransactions(JSON.parse(savedTransactions));
            } else {
                 const transactionsWithIds: Transaction[] = initialTransactions.map((tx, i) => ({ ...tx, id: `tx-${Date.now()}-${i}`}));
                setTransactions(transactionsWithIds);
            }
        } catch (e) {
            console.error("Could not load transactions", e);
            const transactionsWithIds: Transaction[] = initialTransactions.map((tx, i) => ({ ...tx, id: `tx-${Date.now()}-${i}`}));
            setTransactions(transactionsWithIds);
        }
        setIsLoaded(true);
    }, [projectId, storageKey]);

    // Save transactions to localStorage
    useEffect(() => {
        if (isLoaded) {
            try {
                localStorage.setItem(storageKey, JSON.stringify(transactions));
            } catch (e) {
                console.error("Could not save transactions", e);
            }
        }
    }, [transactions, isLoaded, storageKey]);

    const handleAddRecord = () => {
        setTransactionToEdit(null);
        setIsDialogOpen(true);
    };

    const handleEditRecord = (transaction: Transaction) => {
        setTransactionToEdit(transaction);
        setIsDialogOpen(true);
    };

    const handleDeleteRecord = (transactionId: string) => {
        setTransactions(transactions.filter(tx => tx.id !== transactionId));
    };

    const handleSaveRecord = (transactionData: Omit<Transaction, 'id'>) => {
        if (transactionToEdit) {
            // Edit existing transaction
            setTransactions(transactions.map(tx => tx.id === transactionToEdit.id ? { ...transactionToEdit, ...transactionData } : tx));
        } else {
            // Add new transaction
            const newTransaction: Transaction = {
                id: `tx-${Date.now()}`,
                ...transactionData,
            };
            setTransactions([newTransaction, ...transactions]); // Add to the top
        }
        setIsDialogOpen(false);
    };


    return (
        <>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Transaction History</CardTitle>
                        <CardDescription>Chronological record of land ownership.</CardDescription>
                    </div>
                    <Button onClick={handleAddRecord}>
                        <PlusCircle className="mr-2 h-4 w-4"/>
                        Add Record
                    </Button>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                            <TableHead>Present Owner</TableHead>
                            <TableHead>Source Name</TableHead>
                            <TableHead>Source Mode</TableHead>
                            <TableHead>Year</TableHead>
                            <TableHead>Doc Number</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {transactions.length > 0 ? transactions.map((tx) => (
                            <TableRow key={tx.id}>
                                <TableCell className="font-medium">{tx.owner}</TableCell>
                                <TableCell>{tx.sourceName}</TableCell>
                                <TableCell>
                                <Badge variant={tx.mode === 'Purchase' ? 'default' : 'secondary'}>{tx.mode}</Badge>
                                </TableCell>
                                <TableCell>{tx.year}</TableCell>
                                <TableCell>{tx.doc}</TableCell>
                                <TableCell className="text-right space-x-2">
                                    <Button variant="ghost" size="icon" onClick={() => handleEditRecord(tx)}>
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
                                                    This will permanently delete this transaction record.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => handleDeleteRecord(tx.id)}>Delete</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </TableCell>
                            </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">
                                        No transaction records found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            <TransactionFormDialog
                isOpen={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                onSave={handleSaveRecord}
                transaction={transactionToEdit}
            />
        </>
    );
}

// Transaction Form Dialog Component
interface TransactionFormDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onSave: (transactionData: Omit<Transaction, 'id'>) => void;
    transaction: Transaction | null;
}

function TransactionFormDialog({ isOpen, onOpenChange, onSave, transaction }: TransactionFormDialogProps) {
    const [owner, setOwner] = useState('');
    const [sourceName, setSourceName] = useState('');
    const [mode, setMode] = useState<Transaction['mode']>('Purchase');
    const [year, setYear] = useState('');
    const [doc, setDoc] = useState('');

    useEffect(() => {
        if (transaction) {
            setOwner(transaction.owner);
            setSourceName(transaction.sourceName);
            setMode(transaction.mode);
            setYear(String(transaction.year));
            setDoc(transaction.doc);
        } else {
            // Reset form for new record
            setOwner('');
            setSourceName('');
            setMode('Purchase');
            setYear('');
            setDoc('');
        }
    }, [transaction, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!owner || !sourceName || !year) return;

        onSave({
            owner,
            sourceName,
            mode,
            year: parseInt(year, 10),
            doc,
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{transaction ? 'Edit Transaction Record' : 'Add New Transaction Record'}</DialogTitle>
                        <DialogDescription>
                            {transaction ? 'Update the record details below.' : 'Enter the details for the new record.'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="owner" className="text-right">Owner</Label>
                            <Input id="owner" value={owner} onChange={e => setOwner(e.target.value)} className="col-span-3" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="sourceName" className="text-right">Source Name</Label>
                            <Input id="sourceName" value={sourceName} onChange={e => setSourceName(e.target.value)} className="col-span-3" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Source Mode</Label>
                            <Select onValueChange={(v: Transaction['mode']) => setMode(v)} value={mode}>
                                <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Purchase">Purchase</SelectItem>
                                    <SelectItem value="Legal Heir">Legal Heir</SelectItem>
                                    <SelectItem value="Gift">Gift</SelectItem>
                                    <SelectItem value="Settlement">Settlement</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                         <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="year" className="text-right">Year</Label>
                            <Input id="year" type="number" value={year} onChange={e => setYear(e.target.value)} className="col-span-3" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="doc" className="text-right">Doc Number</Label>
                            <Input id="doc" value={doc} onChange={e => setDoc(e.target.value)} className="col-span-3" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit">Save Record</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
