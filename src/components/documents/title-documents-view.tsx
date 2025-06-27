'use client';

import { useState, useEffect, useMemo, FC } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Trash2, Scale } from "lucide-react";

// Define the type for a Survey Record
type SurveyRecord = {
  id: string;
  surveyNumber: string;
  acres: string; // Using string to handle form inputs easily
  cents: string;
};

// Initial mock data for new projects
const initialSurveyRecords: SurveyRecord[] = [
    { id: 'survey-1', surveyNumber: '123/A1', acres: '2', cents: '50' },
    { id: 'survey-2', surveyNumber: '123/A2', acres: '1', cents: '75' },
];


interface TitleDocumentsViewProps {
  projectId: string;
}

export function TitleDocumentsView({ projectId }: TitleDocumentsViewProps) {
  const [surveyRecords, setSurveyRecords] = useState<SurveyRecord[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // State for the form inputs
  const [newSurveyNumber, setNewSurveyNumber] = useState('');
  const [newAcres, setNewAcres] = useState('');
  const [newCents, setNewCents] = useState('');

  const storageKey = `survey-records-${projectId}`;

  // Load records from localStorage
  useEffect(() => {
    if (!projectId) return;
    try {
      const savedRecords = localStorage.getItem(storageKey);
      if (savedRecords) {
        setSurveyRecords(JSON.parse(savedRecords));
      } else {
        setSurveyRecords(initialSurveyRecords);
      }
    } catch (e) {
      console.error("Could not load survey records", e);
      setSurveyRecords(initialSurveyRecords);
    }
    setIsLoaded(true);
  }, [projectId, storageKey]);

  // Save records to localStorage
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(surveyRecords));
      } catch (e) {
        console.error("Could not save survey records", e);
      }
    }
  }, [surveyRecords, isLoaded, storageKey]);

  const handleAddRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSurveyNumber.trim() || (!newAcres.trim() && !newCents.trim())) {
        // Basic validation
        return;
    }

    const newRecord: SurveyRecord = {
        id: `survey-${Date.now()}`,
        surveyNumber: newSurveyNumber,
        acres: newAcres,
        cents: newCents,
    };

    setSurveyRecords(prevRecords => [...prevRecords, newRecord]);

    // Reset form
    setNewSurveyNumber('');
    setNewAcres('');
    setNewCents('');
  };

  const handleDeleteRecord = (recordId: string) => {
    setSurveyRecords(records => records.filter(r => r.id !== recordId));
  };
  
  const totalExtent = useMemo(() => {
    let totalAcres = 0;
    let totalCents = 0;

    surveyRecords.forEach(record => {
        totalAcres += parseFloat(record.acres) || 0;
        totalCents += parseFloat(record.cents) || 0;
    });

    // Convert cents to acres (assuming 100 cents = 1 acre)
    if (totalCents >= 100) {
        totalAcres += Math.floor(totalCents / 100);
        totalCents = totalCents % 100;
    }

    return { acres: totalAcres, cents: parseFloat(totalCents.toFixed(2)) };
  }, [surveyRecords]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Title Documents & Survey Details</CardTitle>
        <CardDescription>Manage survey and sub-division records. The total extent is calculated automatically.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Form for adding new records */}
        <form onSubmit={handleAddRecord} className="p-4 border rounded-lg space-y-4">
            <h4 className="font-medium text-lg">Add New Survey Record</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="space-y-2">
                    <Label htmlFor="survey-number">Survey/Sub-Div No.</Label>
                    <Input id="survey-number" value={newSurveyNumber} onChange={e => setNewSurveyNumber(e.target.value)} placeholder="e.g., 256/2B" required />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="acres">Acres</Label>
                    <Input id="acres" type="number" step="any" value={newAcres} onChange={e => setNewAcres(e.target.value)} placeholder="e.g., 5" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="cents">Cents</Label>
                    <Input id="cents" type="number" step="any" value={newCents} onChange={e => setNewCents(e.target.value)} placeholder="e.g., 50" />
                </div>
                <Button type="submit" className="w-full md:w-auto">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Record
                </Button>
            </div>
        </form>

        {/* Table of existing records */}
        <div>
            <h4 className="font-medium text-lg mb-4">Survey Records</h4>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Survey/Sub-Div No.</TableHead>
                            <TableHead className="text-right">Acres</TableHead>
                            <TableHead className="text-right">Cents</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {surveyRecords.length > 0 ? (
                            surveyRecords.map((record) => (
                                <TableRow key={record.id}>
                                    <TableCell className="font-medium">{record.surveyNumber}</TableCell>
                                    <TableCell className="text-right">{record.acres || '0'}</TableCell>
                                    <TableCell className="text-right">{record.cents || '0'}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => handleDeleteRecord(record.id)}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    No survey records added yet.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
      </CardContent>
      <CardFooter className="bg-muted/50 p-4 rounded-b-lg flex items-center justify-end space-x-4">
        <div className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-muted-foreground" />
            <span className="font-semibold text-lg">Total Extent:</span>
        </div>
        <p className="text-xl font-bold text-primary">{totalExtent.acres} Acres, {totalExtent.cents} Cents</p>
      </CardFooter>
    </Card>
  );
}
