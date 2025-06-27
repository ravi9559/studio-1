// src/components/sketch/site-sketch-view.tsx
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { SurveyRecordWithOwner } from '@/types';
import { Users, MapPin, LandPlot, HandCoins } from 'lucide-react';
import { Badge } from '../ui/badge';

interface SiteSketchViewProps {
  plotData: SurveyRecordWithOwner[];
}

// This defines the visual layout based on the provided sketch.
// The grid is 12 columns wide and 8 rows high.
const sketchLayout = [
  { surveyNumber: '34/1', gridClass: 'col-start-1 col-span-5 row-start-1 row-span-2' },
  { surveyNumber: '34/2', gridClass: 'col-start-6 col-span-3 row-start-1 row-span-2' },
  { surveyNumber: '35/1', gridClass: 'col-start-1 col-span-8 row-start-3 row-span-2' },
  { surveyNumber: '35/3A', gridClass: 'col-start-9 col-span-4 row-start-1 row-span-4' },
  { surveyNumber: '33/1A', gridClass: 'col-start-1 col-span-4 row-start-5 row-span-4' },
  { surveyNumber: '33/1B', gridClass: 'col-start-5 col-span-4 row-start-5 row-span-4' },
  { surveyNumber: '10/1A', gridClass: 'col-start-9 col-span-4 row-start-5 row-span-1' },
  { surveyNumber: '10/1B', gridClass: 'col-start-9 col-span-4 row-start-6 row-span-1' },
  { surveyNumber: '10/1C', gridClass: 'col-start-9 col-span-4 row-start-7 row-span-2' },
];

const PlotCard = ({ surveyNumber, data }: { surveyNumber: string, data?: SurveyRecordWithOwner }) => {
  const isAssigned = !!data;
  
  return (
    <div
      className={cn(
        'flex flex-col justify-between rounded-lg border p-3 shadow-sm transition-all hover:shadow-md hover:scale-[1.02]',
        isAssigned ? 'bg-card' : 'bg-muted/50 border-dashed'
      )}
    >
      <div>
        <div className="flex justify-between items-center">
            <h3 className="font-bold text-lg">{surveyNumber}</h3>
            {data && <Badge variant={data.landClassification === 'Wet' ? 'default' : 'secondary'}>{data.landClassification}</Badge>}
        </div>
        {isAssigned && data ? (
            <div className="space-y-2 mt-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>{data.ownerName}</span>
                </div>
                <div className="flex items-center gap-2">
                    <HandCoins className="h-4 w-4" />
                    <span>{data.acres} Acres, {data.cents} Cents</span>
                </div>
            </div>
        ) : (
             <p className="text-sm text-center text-muted-foreground mt-4">Unassigned</p>
        )}
      </div>
       <Button variant="ghost" size="sm" className="w-full mt-2" disabled={!isAssigned}>
            View Details
        </Button>
    </div>
  );
};

export function SiteSketchView({ plotData }: SiteSketchViewProps) {
  const plotDataMap = new Map(plotData.map(p => [p.surveyNumber, p]));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Site Sketch Layout</CardTitle>
        <CardDescription>
          A visual representation of the project site based on the sketch. Data is sourced from the Family Lineage tab.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative aspect-[4/3] w-full rounded-lg border bg-gray-50 p-4">
           {/* Main Road */}
           <div className="absolute bottom-0 left-0 right-0 h-16 bg-gray-300 flex items-center justify-center">
                <p className="font-bold text-gray-600">MAIN ROAD</p>
           </div>
           
           <div className="relative h-full w-full grid grid-cols-12 grid-rows-8 gap-2 mb-16">
            {sketchLayout.map(({ surveyNumber, gridClass }) => (
              <div key={surveyNumber} className={cn(gridClass)}>
                <PlotCard surveyNumber={surveyNumber} data={plotDataMap.get(surveyNumber)} />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
