'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Circle, CircleDashed, FileCheck, FileClock, FileQuestion, FileX, HandCoins, Landmark, LandPlot, Scale, SquareUserRound, Users, Calendar as CalendarIcon, Wallet, FilePen, Microscope } from 'lucide-react';
import type { AcquisitionStatus } from '@/types';
import { cn } from '@/lib/utils';
import { format, isValid } from 'date-fns';

interface AcquisitionCardProps {
  status: AcquisitionStatus;
  onEdit: (status: AcquisitionStatus) => void;
}

const statusMap = {
  // Financials
  Paid: { icon: CheckCircle2, color: 'text-green-500' },
  Signed: { icon: FileCheck, color: 'text-green-500' },
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


export function AcquisitionCard({ status, onEdit }: AcquisitionCardProps) {

  const getStageStatus = (stage: 'financials' | 'operations' | 'legal') => {
      if (stage === 'financials') {
          return status.financials.advancePayment === 'Paid' && status.financials.agreementStatus === 'Signed' ? 'completed' : 'active';
      }
      if (stage === 'operations') {
          const finCompleted = getStageStatus('financials') === 'completed';
          if (!finCompleted) return 'pending';
          return status.operations.documentCollection === 'Fully Collected' && status.operations.meetingDate ? 'completed' : 'active';
      }
      if (stage === 'legal') {
           const opsCompleted = getStageStatus('operations') === 'completed';
           if (!opsCompleted) return 'pending';
           return status.legal.queryStatus === 'Cleared' ? 'completed' : 'active';
      }
      return 'pending';
  }

  const overallStatus = getStageStatus('legal');
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Acquisition Status for S.No: {status.surveyNumber}</CardTitle>
            <CardDescription>
              A visual game-like overview of the acquisition process for this land parcel.
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
                <StepperNode stage="Financials" status={getStageStatus('financials')} />
                <StepperNode stage="Operations" status={getStageStatus('operations')} />
                <StepperNode stage="Legal" status={getStageStatus('legal')} />
                <StepperNode stage="Completed" status={overallStatus} isLast />
            </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Land Details */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2"><LandPlot /> Land Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <InfoRow icon={Users} label="Family Head" value={status.familyHeadName} />
                    <InfoRow icon={Scale} label="Total Extent" value={`${status.extent.acres} Acres, ${status.extent.cents} Cents`} />
                    <InfoRow icon={Microscope} label="Classification" value={status.landClassification} />
                </CardContent>
            </Card>

            {/* Financial Transaction */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2"><Wallet /> Financial Transaction</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <InfoRow
                        icon={HandCoins}
                        label="Advance Payment"
                        value=""
                        valueComponent={<StatusBadge status={status.financials.advancePayment} />}
                    />
                    <InfoRow
                        icon={FilePen}
                        label="Agreement Status"
                        value=""
                        valueComponent={<StatusBadge status={status.financials.agreementStatus} />}
                     />
                </CardContent>
            </Card>
            
            {/* Operational Information */}
             <Card>
                <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2"><SquareUserRound /> Operational Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                     <InfoRow
                        icon={CalendarIcon}
                        label="In-person meeting"
                        value={status.operations.meetingDate && isValid(new Date(status.operations.meetingDate))
                            ? format(new Date(status.operations.meetingDate), 'PPP')
                            : 'Pending'}
                    />
                     <InfoRow
                        icon={FileCheck}
                        label="Document Collection"
                        value=""
                        valueComponent={<StatusBadge status={status.operations.documentCollection} />}
                    />
                </CardContent>
            </Card>

            {/* Legal Queries */}
             <Card>
                <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2"><Landmark /> Legal Queries</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <InfoRow
                        icon={FileQuestion}
                        label="Reply to Legal Queries"
                        value=""
                        valueComponent={<StatusBadge status={status.legal.queryStatus} />}
                    />
                </CardContent>
            </Card>

        </div>
      </CardContent>
    </Card>
  );
}
