
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { AggregationProgress, User, AggregationDocumentStatus, AggregationCollectionStatus, Person } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, User as UserIcon } from 'lucide-react';

interface DocumentCollectionStatusProps {
    projectId: string;
    familyHeads: Person[];
    currentUser: User | null;
}

const defaultProgress: Omit<AggregationProgress, 'id'> = {
    titleDeed: { status: 'Un-Available', collection: 'Pending' },
    parentDocument: { status: 'Un-Available', collection: 'Pending' },
    deathCertificate: { status: 'Un-Available', collection: 'Pending' },
    legalHeirCertificate: { status: 'Un-Available', collection: 'Pending' },
    patta: { status: 'Un-Available', collection: 'Pending' },
    saleAgreement: { status: 'Pending' },
};

function ProgressEditor({ surveyNumber, projectId, onProgressUpdated, isReadOnly }: { surveyNumber: string, projectId: string, onProgressUpdated: () => void, isReadOnly: boolean }) {
    const [progress, setProgress] = useState<AggregationProgress>({ id: surveyNumber, ...defaultProgress });
    const { toast } = useToast();
    const storageKey = `aggregation-${projectId}-${surveyNumber}`;

    useEffect(() => {
        try {
            const savedData = localStorage.getItem(storageKey);
            if (savedData) {
                setProgress(JSON.parse(savedData));
            } else {
                setProgress({ id: surveyNumber, ...defaultProgress });
            }
        } catch (e) {
            console.error("Could not load aggregation progress", e);
            setProgress({ id: surveyNumber, ...defaultProgress });
        }
    }, [storageKey, surveyNumber]);

    const handleFieldChange = (
        docType: keyof Omit<AggregationProgress, 'id' | 'saleAgreement'>,
        field: 'status' | 'collection',
        value: AggregationDocumentStatus | AggregationCollectionStatus
    ) => {
        setProgress(prev => ({
            ...prev,
            [docType]: { ...prev[docType], [field]: value },
        }));
    };

    const handleSaleAgreementChange = (value: 'Signed' | 'Pending') => {
        setProgress(prev => ({
            ...prev,
            saleAgreement: { status: value },
        }));
    };

    const handleSave = () => {
        try {
            localStorage.setItem(storageKey, JSON.stringify(progress));
            toast({ title: 'Progress Saved', description: `Data for S.No. ${surveyNumber} has been updated.` });
            onProgressUpdated();
        } catch (e) {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to save progress.' });
            console.error(e);
        }
    };
    
    const documentFields: { key: keyof Omit<AggregationProgress, 'id' | 'saleAgreement'>, label: string }[] = [
        { key: 'titleDeed', label: 'Title Deed' },
        { key: 'parentDocument', label: 'Parent Document' },
        { key: 'deathCertificate', label: 'Death Certificate' },
        { key: 'legalHeirCertificate', label: 'Legal-Heir Certificate' },
        { key: 'patta', label: 'Patta' },
    ];

    return (
        <Card className="mt-4 bg-background/50">
            <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {documentFields.map(({ key, label }) => (
                    <div key={key} className="p-4 border rounded-lg space-y-4">
                        <h4 className="font-semibold">{label}</h4>
                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select
                                value={progress[key].status}
                                onValueChange={(v: AggregationDocumentStatus) => handleFieldChange(key, 'status', v)}
                                disabled={isReadOnly}
                            >
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Available">Available</SelectItem>
                                    <SelectItem value="Un-Available">Un-Available</SelectItem>
                                    <SelectItem value="Applied">Applied</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Collection by Aggregator</Label>
                            <Select
                                value={progress[key].collection}
                                onValueChange={(v: AggregationCollectionStatus) => handleFieldChange(key, 'collection', v)}
                                disabled={isReadOnly}
                            >
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Collected">Collected</SelectItem>
                                    <SelectItem value="Pending">Pending</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                ))}
                <div className="p-4 border rounded-lg space-y-4">
                    <h4 className="font-semibold">Sale Agreement</h4>
                    <div className="space-y-2">
                        <Label>Status</Label>
                        <Select
                            value={progress.saleAgreement.status}
                            onValueChange={handleSaleAgreementChange}
                            disabled={isReadOnly}
                        >
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Signed">Signed</SelectItem>
                                <SelectItem value="Pending">Pending</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardContent>
            {!isReadOnly && (
                <CardFooter>
                    <Button onClick={handleSave}><Save className="mr-2 h-4 w-4" />Save Progress for S.No. {surveyNumber}</Button>
                </CardFooter>
            )}
        </Card>
    );
}


export function DocumentCollectionStatusView({ projectId, familyHeads, currentUser }: DocumentCollectionStatusProps) {
    const [version, setVersion] = useState(0);
    const refreshData = useCallback(() => setVersion(v => v + 1), []);

    if (!currentUser) return null;

    const isReadOnly = currentUser.role === 'Lawyer';

    if (familyHeads.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Document Collection Status</CardTitle>
                    <CardDescription>Track document collection for each survey number, grouped by family head.</CardDescription>
                </CardHeader>
                <CardContent className="text-center text-muted-foreground p-8">
                    No family heads found. Add families and land records in "Family Lineage" to track progress.
                </CardContent>
            </Card>
        );
    }
    
    return (
        <Accordion type="multiple" className="w-full space-y-4">
            {familyHeads.map(head => (
                <AccordionItem value={head.id} key={head.id} className="border rounded-lg">
                    <AccordionTrigger className="p-4 text-lg font-medium hover:no-underline">
                        <div className="flex items-center gap-2">
                           <UserIcon className="h-5 w-5 text-primary" />
                           {head.name}
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="p-4 border-t">
                        {head.landRecords.length > 0 ? (
                             <Accordion type="multiple" className="w-full space-y-2">
                                {head.landRecords.map(record => (
                                     <AccordionItem value={record.id} key={record.id} className="border rounded-md">
                                        <AccordionTrigger className="px-4 py-3 text-base font-medium hover:no-underline">
                                           Progress for Survey No: {record.surveyNumber}
                                        </AccordionTrigger>
                                        <AccordionContent className="p-4 border-t">
                                            <ProgressEditor
                                                surveyNumber={record.surveyNumber}
                                                projectId={projectId}
                                                onProgressUpdated={refreshData}
                                                isReadOnly={isReadOnly}
                                            />
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                             </Accordion>
                        ): (
                            <p className="text-center text-muted-foreground p-4">
                                This family head has no land records assigned.
                            </p>
                        )}
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
    );
}
