// src/components/transactions/financial-transactions.tsx
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { PlusCircle } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import type { FinancialTransaction, User } from '@/types';
import { format } from 'date-fns';

interface FinancialTransactionsProps {
    projectId: string;
    surveyNumbers: string[];
    currentUser: User | null;
}

export function FinancialTransactions({ projectId, surveyNumbers, currentUser }: FinancialTransactionsProps) {
    const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { toast } = useToast();

    const storageKey = `financial-transactions-${projectId}`;

    // Load transactions from localStorage
    useEffect(() => {
        if (!projectId) return;
        try {
            const savedTransactions = localStorage.getItem(storageKey);
            setTransactions(savedTransactions ? JSON.parse(savedTransactions) : []);
        } catch (e) {
            console.error("Could not load financial transactions", e);
            setTransactions([]);
        }
        setIsLoaded(true);
    }, [projectId, storageKey]);

    // Save transactions to localStorage
    useEffect(() => {
        if (isLoaded) {
            try {
                localStorage.setItem(storageKey, JSON.stringify(transactions));
            } catch (e) {
                console.error("Could not save financial transactions", e);
            }
        }
    }, [transactions, isLoaded, storageKey]);

    const handleSaveRecord = (transactionData: Omit<FinancialTransaction, 'id' | 'timestamp'>) => {
        const newTransaction: FinancialTransaction = {
            id: `fin-tx-${Date.now()}`,
            timestamp: new Date().toISOString(),
            ...transactionData,
        };
        setTransactions(prev => [newTransaction, ...prev]);
        toast({ title: 'Payment Recorded', description: 'The financial transaction has been added.'});
        setIsDialogOpen(false);
    };

    return (
        <>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Financial Transactions</CardTitle>
                        <CardDescription>Record all payments like token advances and part payments.</CardDescription>
                    </div>
                    <Button onClick={() => setIsDialogOpen(true)}>
                        <PlusCircle className="mr-2 h-4 w-4"/>
                        Add Payment
                    </Button>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Survey No.</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Payment Purpose</TableHead>
                                <TableHead>Date of Payment</TableHead>
                                <TableHead>Recorded At (Timestamp)</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {transactions.length > 0 ? transactions.map((tx) => (
                                <TableRow key={tx.id}>
                                    <TableCell className="font-medium">{tx.surveyNumber}</TableCell>
                                    <TableCell>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(tx.amount)}</TableCell>
                                    <TableCell>
                                        <Badge variant={tx.purpose === 'Token Advance' ? 'secondary' : 'default'}>{tx.purpose}</Badge>
                                    </TableCell>
                                    <TableCell>{format(new Date(tx.date), 'PPP')}</TableCell>
                                    <TableCell>{format(new Date(tx.timestamp), 'PP pp')}</TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                        No financial transactions recorded yet.
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
                surveyNumbers={surveyNumbers}
            />
        </>
    );
}

// Transaction Form Dialog Component
interface TransactionFormDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onSave: (transactionData: Omit<FinancialTransaction, 'id' | 'timestamp'>) => void;
    surveyNumbers: string[];
}

function TransactionFormDialog({ isOpen, onOpenChange, onSave, surveyNumbers }: TransactionFormDialogProps) {
    const [surveyNumber, setSurveyNumber] = useState('');
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState('');
    const [purpose, setPurpose] = useState<FinancialTransaction['purpose']>('Token Advance');
    const { toast } = useToast();

    useEffect(() => {
        if (surveyNumbers.length > 0) {
            setSurveyNumber(surveyNumbers[0]);
        }
    }, [surveyNumbers]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!surveyNumber || !amount || !date || !purpose) {
            toast({ variant: 'destructive', title: 'Missing Information', description: 'Please fill out all fields.'});
            return;
        }

        onSave({
            surveyNumber,
            amount: parseFloat(amount),
            date,
            purpose,
        });
        
        // Reset form
        setAmount('');
        setDate('');
        setPurpose('Token Advance');
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Record a Payment</DialogTitle>
                        <DialogDescription>
                            Enter the details for the financial transaction. This record is immutable.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                         <div className="space-y-2">
                            <Label htmlFor="surveyNumber">Survey Number</Label>
                            <Select onValueChange={setSurveyNumber} value={surveyNumber}>
                                <SelectTrigger id="surveyNumber"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {surveyNumbers.map(sn => (
                                        <SelectItem key={sn} value={sn}>{sn}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="amount">Amount</Label>
                            <Input id="amount" type="number" value={amount} onChange={e => setAmount(e.target.value)} required />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="date">Date of Payment</Label>
                            <Input id="date" type="date" value={date} onChange={e => setDate(e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="purpose">Payment Purpose</Label>
                            <Select onValueChange={(v: FinancialTransaction['purpose']) => setPurpose(v)} value={purpose}>
                                <SelectTrigger id="purpose"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Token Advance">Token Advance</SelectItem>
                                    <SelectItem value="Part Payment">Part Payment</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit">Save Transaction</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
