
// src/components/sketch/site-sketch-view.tsx
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { AcquisitionStatus } from '@/types';
import { Users, HandCoins } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '@/components/ui/button';
import { siteSketchData } from '@/lib/site-sketch-data';

interface SiteSketchViewProps {
  acquisitionStatuses: AcquisitionStatus[];
  onSelectSurvey: (statusId: string) => void;
}

const getStatusVariant = (status?: AcquisitionStatus): 'default' | 'secondary' | 'destructive' => {
    if (!status) return 'destructive';
    if (status.legal.queryStatus === 'Cleared') return 'default'; // Green for completed
    if (status.financials.advancePayment === 'Paid' || status.financials.agreementStatus === 'Signed' || status.legal.queryStatus === 'On-Progress') return 'secondary'; // Blue for in-progress
    return 'destructive'; // Pink for pending/not started
}

const getStatusText = (status?: AcquisitionStatus) => {
    if (!status) return 'Pending';
    if (status.legal.queryStatus === 'Cleared') return 'Completed';
    if (status.financials.advancePayment === 'Paid' || status.financials.agreementStatus === 'Signed' || status.legal.queryStatus === 'On-Progress') return 'In Progress';
    return 'Pending';
}


const PlotCard = ({ plot, status, onSelectSurvey }: { plot: typeof siteSketchData[0], status?: AcquisitionStatus, onSelectSurvey: (statusId: string) => void; }) => {
  const statusVariant = getStatusVariant(status);
  const statusText = getStatusText(status);
  
  const ownerName = status ? status.familyHeadName : plot.ownerName;
  const extentAcres = status ? status.extent.acres : plot.acres;
  const extentCents = status ? status.extent.cents : plot.cents;

  return (
    <div
      className={cn(
        'flex h-full flex-col justify-between rounded-lg border p-2 text-xs shadow-sm transition-all hover:shadow-md hover:scale-[1.03] hover:z-10 overflow-hidden',
        statusVariant === 'default' && 'bg-green-100 dark:bg-green-900/50 border-green-400',
        statusVariant === 'secondary' && 'bg-blue-100 dark:bg-blue-900/50 border-blue-400',
        statusVariant === 'destructive' && 'bg-pink-100 dark:bg-pink-900/50 border-pink-400',
      )}
    >
      <div>
        <div className="flex justify-between items-center">
            <h3 className="font-bold text-sm truncate">{plot.surveyNumber}</h3>
            <Badge variant={statusVariant} className="text-xs">{statusText}</Badge>
        </div>
        <div className="space-y-1 mt-1 text-muted-foreground">
            <div className="flex items-center gap-1">
                <Users className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{ownerName}</span>
            </div>
            <div className="flex items-center gap-1">
                <HandCoins className="h-3 w-3 flex-shrink-0" />
                <span>{extentAcres} Ac, {extentCents} C</span>
            </div>
        </div>
      </div>
       <Button variant="ghost" size="sm" className="w-full h-6 mt-1 text-xs" onClick={() => status && onSelectSurvey(status.id)}>
            View Details
        </Button>
    </div>
  );
};

export function SiteSketchView({ acquisitionStatuses, onSelectSurvey }: SiteSketchViewProps) {
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Site Sketch Layout</CardTitle>
        <CardDescription>
          A visual, interactive representation of the project site. Click "View Details" on a plot to see its acquisition status. The sketch will auto-update as you make changes.
        </CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto p-2">
        <div className="relative w-[1600px] h-[900px] rounded-lg border bg-gray-50 dark:bg-background/30 p-4">
           {/* Main Road */}
           <div className="absolute bottom-0 left-0 right-0 h-16 bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                <p className="font-bold text-gray-600 dark:text-gray-300">MAIN ROAD</p>
           </div>
           
           <div className="relative h-full w-full grid grid-cols-20 grid-rows-10 gap-1 mb-20">
            {siteSketchData.map((plot, index) => {
              const status = acquisitionStatuses[index];
              return (
              <div key={`${plot.surveyNumber}-${index}`} className={cn(plot.gridClass)}>
                <PlotCard plot={plot} status={status} onSelectSurvey={onSelectSurvey} />
              </div>
            )})}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
