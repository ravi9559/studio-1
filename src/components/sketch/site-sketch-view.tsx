
// src/components/sketch/site-sketch-view.tsx
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { AcquisitionStatus } from '@/types';
import { Users, HandCoins, FileCheck, CircleDashed } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '@/components/ui/button';

interface SiteSketchViewProps {
  acquisitionStatuses: AcquisitionStatus[];
  onSelectSurvey: (surveyNumber: string) => void;
}

// This defines the visual layout based on the provided sketch.
// The grid is 20 columns wide and 10 rows high for better accuracy.
const sketchLayout = [
  // Top Row
  { sNo: '10/1', gridClass: 'col-start-1 col-span-2 row-start-1' },
  { sNo: '10/2', gridClass: 'col-start-3 col-span-1 row-start-1' },
  { sNo: '10/3A1', gridClass: 'col-start-4 col-span-1 row-start-1' },
  { sNo: '10/3A2', gridClass: 'col-start-5 col-span-1 row-start-1' },
  { sNo: '10/3B', gridClass: 'col-start-6 col-span-1 row-start-1' },
  { sNo: '9/1', gridClass: 'col-start-7 col-span-2 row-start-1' },
  { sNo: '9/2', gridClass: 'col-start-9 col-span-1 row-start-1' },
  { sNo: '9/3', gridClass: 'col-start-10 col-span-2 row-start-1' },
  { sNo: '9/4', gridClass: 'col-start-12 col-span-1 row-start-1' },
  { sNo: '7/3A', gridClass: 'col-start-13 col-span-2 row-start-1' },
  { sNo: '8', gridClass: 'col-start-15 col-span-2 row-start-1' },
  { sNo: '34/1', gridClass: 'col-start-17 col-span-2 row-start-1' },
  { sNo: '34/2', gridClass: 'col-start-19 col-span-2 row-start-1' },

  // Second Row
  { sNo: '7/1A', gridClass: 'col-start-1 col-span-1 row-start-2' },
  { sNo: '7/1B', gridClass: 'col-start-2 col-span-1 row-start-2' },
  { sNo: '7/1C', gridClass: 'col-start-3 col-span-1 row-start-2' },
  { sNo: '7/1D', gridClass: 'col-start-4 col-span-1 row-start-2' },
  { sNo: '7/1E', gridClass: 'col-start-5 col-span-1 row-start-2' },
  { sNo: '7/2A', gridClass: 'col-start-6 col-span-1 row-start-2' },
  { sNo: '7/2B', gridClass: 'col-start-7 col-span-1 row-start-2' },
  { sNo: '7/2C', gridClass: 'col-start-8 col-span-1 row-start-2' },
  { sNo: '7/3B2', gridClass: 'col-start-9 col-span-2 row-start-2' },
  { sNo: '7/3C1', gridClass: 'col-start-11 col-span-1 row-start-2' },
  { sNo: '7/3D', gridClass: 'col-start-12 col-span-1 row-start-2' },
  { sNo: '7/3B1', gridClass: 'col-start-13 col-span-1 row-start-2' },
  { sNo: '6', gridClass: 'col-start-14 col-span-2 row-start-2' },
  { sNo: '6/3C2', gridClass: 'col-start-16 col-span-1 row-start-2' },
  { sNo: '33/1A2', gridClass: 'col-start-17 col-span-1 row-start-2' },
  
  // Middle Rows (3-5)
  { sNo: '3/1A', gridClass: 'col-start-1 col-span-2 row-start-4' },
  { sNo: '3/1B', gridClass: 'col-start-3 col-span-2 row-start-4' },
  { sNo: '3/1C', gridClass: 'col-start-5 col-span-2 row-start-4' },
  { sNo: '4/3A', gridClass: 'col-start-1 col-span-3 row-start-5' },
  { sNo: '4/3B', gridClass: 'col-start-4 col-span-3 row-start-5' },
  { sNo: '4/1A', gridClass: 'col-start-1 col-span-2 row-start-6' },
  { sNo: '4/1B', gridClass: 'col-start-3 col-span-2 row-start-6' },
  { sNo: '4/2', gridClass: 'col-start-5 col-span-2 row-start-6' },
  { sNo: '5/3A', gridClass: 'col-start-1 col-span-2 row-start-7' },
  { sNo: '5/3B', gridClass: 'col-start-3 col-span-2 row-start-7' },
  { sNo: '5/1A', gridClass: 'col-start-5 col-span-2 row-start-7' },
  
  // Right side block (col 17+)
  { sNo: '30/1A', gridClass: 'col-start-17 col-span-2 row-start-3' },
  { sNo: '30/2', gridClass: 'col-start-19 col-span-2 row-start-3' },
  { sNo: '30/3A', gridClass: 'col-start-17 col-span-2 row-start-4' },
  { sNo: '30/4A', gridClass: 'col-start-19 col-span-2 row-start-4' },
  { sNo: '30/4B', gridClass: 'col-start-17 col-span-2 row-start-5' },
  { sNo: '30/1B', gridClass: 'col-start-19 col-span-2 row-start-5' },
  { sNo: '30/3B', gridClass: 'col-start-17 col-span-2 row-start-6' },
  { sNo: '31/1', gridClass: 'col-start-19 col-span-2 row-start-6' },
  { sNo: '31/2', gridClass: 'col-start-17 col-span-2 row-start-7' },
  { sNo: '32', gridClass: 'col-start-19 col-span-2 row-start-7' },
  { sNo: '33/2', gridClass: 'col-start-17 col-span-2 row-start-8' },
  { sNo: '35/3B', gridClass: 'col-start-19 col-span-2 row-start-8' },
  
  // Bottom Rows
  { sNo: '35/1', gridClass: 'col-start-13 col-span-2 row-start-4' },
  { sNo: '35/3A', gridClass: 'col-start-15 col-span-2 row-start-4' },
  { sNo: '35/2', gridClass: 'col-start-13 col-span-2 row-start-5' },
  { sNo: '36/1', gridClass: 'col-start-13 col-span-1 row-start-6' },
  { sNo: '36/2', gridClass: 'col-start-14 col-span-1 row-start-6' },
  { sNo: '36/3', gridClass: 'col-start-15 col-span-1 row-start-6' },
  { sNo: '37/3A', gridClass: 'col-start-16 col-span-1 row-start-6' },
  { sNo: '37/1', gridClass: 'col-start-13 col-span-1 row-start-7' },
  { sNo: '37/2A', gridClass: 'col-start-14 col-span-1 row-start-7' },
  { sNo: '37/2B', gridClass: 'col-start-15 col-span-1 row-start-7' },
  { sNo: '37/3B1', gridClass: 'col-start-16 col-span-1 row-start-7' },
  { sNo: '37/3B2', gridClass: 'col-start-13 col-span-2 row-start-8' },

  { sNo: '5/1B1', gridClass: 'col-start-7 col-span-1 row-start-7' },
  { sNo: '5/1B2', gridClass: 'col-start-8 col-span-1 row-start-7' },
  { sNo: '5/1B3', gridClass: 'col-start-9 col-span-1 row-start-7' },
  { sNo: '38/1', gridClass: 'col-start-10 col-span-1 row-start-7' },
  
  { sNo: '38/3', gridClass: 'col-start-7 col-span-2 row-start-8' },
  { sNo: '39', gridClass: 'col-start-9 col-span-2 row-start-8' },
  { sNo: '38/4', gridClass: 'col-start-7 col-span-4 row-start-9' },

  { sNo: '41/1', gridClass: 'col-start-7 col-span-1 row-start-10' },
  { sNo: '41/2', gridClass: 'col-start-8 col-span-1 row-start-10' },
  { sNo: '41/3', gridClass: 'col-start-9 col-span-1 row-start-10' },
  { sNo: '41/4', gridClass: 'col-start-10 col-span-1 row-start-10' },

  { sNo: '33/1A1', gridClass: 'col-start-13 col-span-2 row-start-3' },
  { sNo: '33/1B', gridClass: 'col-start-15 col-span-2 row-start-3' },
];


const getStatusVariant = (status: AcquisitionStatus): 'default' | 'secondary' | 'destructive' => {
    if (status.legal.queryStatus === 'Cleared') return 'default'; // Green for completed
    if (status.financials.advancePayment === 'Paid' || status.financials.agreementStatus === 'Signed') return 'secondary'; // Blue for in-progress
    return 'destructive'; // Red for pending/not started
}

const getStatusText = (status: AcquisitionStatus) => {
    if (status.legal.queryStatus === 'Cleared') return 'Completed';
    if (status.financials.advancePayment === 'Paid' || status.financials.agreementStatus === 'Signed') return 'In Progress';
    return 'Pending';
}


const PlotCard = ({ data, onSelectSurvey }: { data: AcquisitionStatus, onSelectSurvey: (surveyNumber: string) => void; }) => {
  const statusVariant = getStatusVariant(data);
  const statusText = getStatusText(data);
  
  return (
    <div
      className={cn(
        'flex h-full flex-col justify-between rounded-lg border p-2 text-xs shadow-sm transition-all hover:shadow-md hover:scale-[1.03] hover:z-10',
        statusVariant === 'default' && 'bg-green-100 dark:bg-green-900/50 border-green-400',
        statusVariant === 'secondary' && 'bg-blue-100 dark:bg-blue-900/50 border-blue-400',
        statusVariant === 'destructive' && 'bg-red-100 dark:bg-red-900/50 border-red-400',
      )}
    >
      <div>
        <div className="flex justify-between items-center">
            <h3 className="font-bold text-sm truncate">{data.surveyNumber}</h3>
            <Badge variant={statusVariant} className="text-xs">{statusText}</Badge>
        </div>
        <div className="space-y-1 mt-1 text-muted-foreground">
            <div className="flex items-center gap-1">
                <Users className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{data.familyHeadName}</span>
            </div>
            <div className="flex items-center gap-1">
                <HandCoins className="h-3 w-3 flex-shrink-0" />
                <span>{data.extent.acres} Ac, {data.extent.cents} C</span>
            </div>
        </div>
      </div>
       <Button variant="ghost" size="sm" className="w-full h-6 mt-1 text-xs" onClick={() => onSelectSurvey(data.surveyNumber)}>
            View Details
        </Button>
    </div>
  );
};

export function SiteSketchView({ acquisitionStatuses, onSelectSurvey }: SiteSketchViewProps) {
  const statusMap = new Map(acquisitionStatuses.map(s => [s.surveyNumber, s]));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Site Sketch Layout</CardTitle>
        <CardDescription>
          A visual, interactive representation of the project site. Click "View Details" on a plot to see its acquisition status.
        </CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto p-2">
        <div className="relative w-[1600px] h-[800px] rounded-lg border bg-gray-50 dark:bg-background/30 p-4">
           {/* Main Road */}
           <div className="absolute bottom-0 left-0 right-0 h-16 bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                <p className="font-bold text-gray-600 dark:text-gray-300">MAIN ROAD</p>
           </div>
           
           <div className="relative h-full w-full grid grid-cols-20 grid-rows-10 gap-1 mb-16">
            {sketchLayout.map(({ sNo, gridClass }) => {
              const data = statusMap.get(sNo);
              return (
              <div key={sNo} className={cn(gridClass)}>
                {data ? (
                    <PlotCard data={data} onSelectSurvey={onSelectSurvey} />
                ) : (
                    <div className="flex h-full items-center justify-center rounded-lg border border-dashed bg-muted/50 p-2 text-center text-xs text-muted-foreground">
                        <p>{sNo}</p>
                    </div>
                )}
              </div>
            )})}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
