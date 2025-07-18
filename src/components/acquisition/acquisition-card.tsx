
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Circle, CircleDashed, FileCheck, FileClock, FileQuestion, FileX, Landmark, LandPlot, Scale, SquareUserRound, Users, Calendar as CalendarIcon, Wallet, FilePen, Microscope, Gavel, Plus, MessageSquare } from 'lucide-react';
import type { AcquisitionStatus, User, LegalQuery, LegalQueryStatus } from '@/types';
import { cn } from '@/lib/utils';
import { format, isValid } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Separator } from '../ui/separator';

interface AcquisitionCardProps {
  status: AcquisitionStatus;
  onEdit: (status: AcquisitionStatus) => void;
  currentUser: User | null;
}

const statusMap = {
  // Operations
  'Fully Collected': { icon: FileCheck, color: 'text-green-500' },
  'Partially Collected': { icon: FileClock, color: 'text-yellow-500' },
  // Legal
  'Cleared': { icon: CheckCircle2, color: 'text-green-500' },
  'Awaiting': { icon: FileQuestion, color: 'text-blue-500' },
  'On-Progress': { icon: FileClock, color: 'text-yellow-500' },
  // Generic Pending
  Pending: { icon: CircleDashed, color: 'text-muted-foreground' },
  'Not Started': { icon: FileX, color: 'text-red-500' },
};

const StepperNode = ({ stage, status, isLast = false }: { stage: string, status: 'completed' | 'active' | 'pending', isLast?: boolean }) => {
  const isCompleted = status === 'completed';
  const isActive = status === 'active';
  
  return (
    <div className="flex items-center w-full">
      <div className="flex flex-col items-center">
        {isCompleted ? <CheckCircle2 className="h-8 w-8 text-green-500" /> : (isActive ? <CircleDashed className="h-8 w-8 text-primary animate-pulse" /> : <Circle className="h-8 w-8 text-muted-foreground" />)}
        <p className={cn("text-xs mt-1 text-center", isActive && "font-bold text-primary")}>{stage}</p>
      </div>
      {!isLast && <div className={cn("flex-auto border-t-2 mx-4", isCompleted ? 'border-green-500' : 'border-border' )}></div>}
    </div>
  )
}

const InfoRow = ({ label, value, icon: Icon, valueComponent }: { label: string, value: string, icon: React.ElementType, valueComponent?: React.ReactNode }) => (
    <div className="flex items-start justify-between">
        <div className="flex items-center gap-2 text-sm font-medium">
            <Icon className="h-4 w-4 text-muted-foreground" />
            <span>{label}</span>
        </div>
        {valueComponent || <span className="text-sm text-muted-foreground">{value}</span>}
    </div>
);

const StatusBadge = ({ status }: { status: keyof typeof statusMap }) => {
    const Icon = statusMap[status]?.icon || Circle;
    const color = statusMap[status]?.color || 'text-muted-foreground';
    return (
        <Badge variant="outline" className="text-sm">
            <Icon className={cn("mr-1.5 h-3.5 w-3.5", color)} />
            {status}
        </Badge>
    );
};


export function AcquisitionCard({ status, onEdit, currentUser }: AcquisitionCardProps) {
  const [queries, setQueries] = useState<LegalQuery[]>([]);
  const [newQueryText, setNewQueryText] = useState('');
  const [isAddingQuery, setIsAddingQuery] = useState(false);
  const { toast } = useToast();
  const queryStorageKey = `legal-queries-${status.projectId}-${status.surveyNumber}`;

  useEffect(() => {
    try {
        const savedQueries = localStorage.getItem(queryStorageKey);
        setQueries(savedQueries ? JSON.parse(savedQueries) : []);
    } catch (e) {
        console.error("Could not load legal queries", e);
        setQueries([]);
    }
  }, [queryStorageKey]);

  const saveQueries = (updatedQueries: LegalQuery[]) => {
      setQueries(updatedQueries);
      localStorage.setItem(queryStorageKey, JSON.stringify(updatedQueries));
  };
  
  const handleAddQuery = () => {
    if (!newQueryText.trim() || !currentUser) {
        toast({ variant: 'destructive', title: 'Error', description: 'Query text cannot be empty.' });
        return;
    }
    const newQuery: LegalQuery = {
        id: `query-${Date.now()}`,
        query: newQueryText.trim(),
        raisedBy: { id: currentUser.id, name: currentUser.name },
        date: new Date().toISOString(),
        status: 'Not Started',
    };
    saveQueries([newQuery, ...queries]);
    setNewQueryText('');
    setIsAddingQuery(false);
    toast({ title: 'Query Raised', description: 'The new legal query has been added.' });
  };

  const handleStatusChange = (queryId: string, newStatus: LegalQueryStatus) => {
    const updatedQueries = queries.map(q => q.id === queryId ? { ...q, status: newStatus } : q);
    saveQueries(updatedQueries);
  };

  const getStageStatus = (stage: 'operations' | 'legal') => {
      if (stage === 'operations') {
          return status.operations.documentCollection === 'Fully Collected' && status.operations.meetingDate ? 'completed' : 'active';
      }
      if (stage === 'legal') {
           const opsCompleted = getStageStatus('operations') === 'completed';
           if (!opsCompleted) return 'pending';
           return status.legal.overallStatus === 'Cleared' ? 'completed' : 'active';
      }
      return 'pending';
  }

  const overallStatus = getStageStatus('legal');

  const canAddQuery = currentUser?.role === 'Lawyer';

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Acquisition Status for S.No: {status.surveyNumber}</CardTitle>
            <CardDescription>
              A visual overview of the acquisition process for this land parcel.
            </CardDescription>
          </div>
          <Button variant="outline" onClick={() => onEdit(status)}>
            <FilePen className="mr-2 h-4 w-4" />
            Edit Status
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Stepper */}
        <div className="p-4 border rounded-lg bg-background/50">
            <div className="flex items-start">
                <StepperNode stage="Operations" status={getStageStatus('operations')} />
                <StepperNode stage="Legal" status={getStageStatus('legal')} />
                <StepperNode stage="Completed" status={overallStatus} isLast />
            </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Land Details */}
            <Card>
                <CardHeader><CardTitle className="text-xl flex items-center gap-2"><LandPlot /> Land Details</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                    <InfoRow icon={Users} label="Family Head" value={status.familyHeadName} />
                    <InfoRow icon={Scale} label="Total Extent" value={`${status.extent.acres} Acres, ${status.extent.cents} Cents`} />
                    <InfoRow icon={Microscope} label="Classification" value={status.landClassification} />
                </CardContent>
            </Card>
            {/* Operational Information */}
             <Card>
                <CardHeader><CardTitle className="text-xl flex items-center gap-2"><SquareUserRound /> Operational Information</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                     <InfoRow icon={CalendarIcon} label="In-person meeting" value={status.operations.meetingDate && isValid(new Date(status.operations.meetingDate)) ? format(new Date(status.operations.meetingDate), 'PPP') : 'Pending'} />
                     <InfoRow icon={FileCheck} label="Document Collection" value="" valueComponent={<StatusBadge status={status.operations.documentCollection} />} />
                </CardContent>
            </Card>
        </div>
        {/* Legal Queries Section */}
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle className="text-xl flex items-center gap-2"><Gavel /> Legal Queries</CardTitle>
                    {canAddQuery && (
                        <Button size="sm" onClick={() => setIsAddingQuery(!isAddingQuery)}>
                            <Plus className="mr-2 h-4 w-4" />
                            {isAddingQuery ? 'Cancel' : 'Raise Query'}
                        </Button>
                    )}
                </div>
                <CardDescription>Track and manage legal queries for this parcel.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <InfoRow icon={MessageSquare} label="Overall Legal Status" value="" valueComponent={<StatusBadge status={status.legal.overallStatus} />} />
                 <Separator />

                {isAddingQuery && (
                    <div className="p-4 border rounded-md bg-muted/50 space-y-3">
                        <h4 className="font-semibold">New Legal Query</h4>
                        <Textarea placeholder="Type your query here..." value={newQueryText} onChange={(e) => setNewQueryText(e.target.value)} />
                        <Button onClick={handleAddQuery}>Submit Query</Button>
                    </div>
                )}
                
                <div className="space-y-3">
                    {queries.map(query => (
                        <div key={query.id} className="p-3 border rounded-lg">
                            <p className="text-sm font-medium whitespace-pre-wrap">{query.query}</p>
                            <div className="flex items-center justify-between mt-2">
                                <p className="text-xs text-muted-foreground">
                                    Raised by {query.raisedBy.name} on {format(new Date(query.date), 'PP')}
                                </p>
                                <div className="w-40">
                                    <Select value={query.status} onValueChange={(value: LegalQueryStatus) => handleStatusChange(query.id, value)}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Not Started">Not Started</SelectItem>
                                            <SelectItem value="In-Progress">In-Progress</SelectItem>
                                            <SelectItem value="Awaiting">Awaiting</SelectItem>
                                            <SelectItem value="Resolved">Resolved</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    ))}
                    {queries.length === 0 && !isAddingQuery && (
                        <p className="text-sm text-muted-foreground text-center p-4">No legal queries raised for this parcel yet.</p>
                    )}
                </div>
            </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}
