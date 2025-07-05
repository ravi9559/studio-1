// src/components/sketch/site-sketch-view.tsx
'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { AcquisitionStatus } from '@/types';
import { siteSketchData, type SiteSketchPlot } from '@/lib/site-sketch-data';

interface SiteSketchViewProps {
  acquisitionStatuses: AcquisitionStatus[];
  onSelectSurvey: (statusId: string) => void;
}

const getStatusVariant = (status?: AcquisitionStatus): 'completed' | 'inProgress' | 'pending' => {
    if (!status) return 'pending';
    if (status.legal.queryStatus === 'Cleared') return 'completed';
    if (status.financials.advancePayment === 'Paid' || status.financials.agreementStatus === 'Signed' || status.legal.queryStatus === 'On-Progress') return 'inProgress';
    return 'pending';
}

const PlotCard = ({ plot, status, onSelectSurvey }: { plot: SiteSketchPlot, status?: AcquisitionStatus, onSelectSurvey: (statusId: string) => void; }) => {
  const statusVariant = getStatusVariant(status);

  const colorClasses = {
    completed: 'bg-green-100 text-green-800 border-green-400 hover:bg-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700 dark:hover:bg-green-800/50',
    inProgress: 'bg-yellow-100 text-yellow-800 border-yellow-400 hover:bg-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-700 dark:hover:bg-yellow-800/50',
    pending: 'bg-slate-100 text-slate-800 border-slate-400 hover:bg-slate-200 dark:bg-slate-900/50 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-800/50',
  };

  const surveyNumber = status ? status.surveyNumber : plot.surveyNumber;

  return (
    <button
      onClick={() => status && onSelectSurvey(status.id)}
      disabled={!status}
      className={cn(
        'w-full aspect-square flex items-center justify-center rounded-lg border p-2 text-sm font-bold shadow-sm transition-all hover:shadow-md hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed',
        statusVariant === 'completed' && colorClasses.completed,
        statusVariant === 'inProgress' && colorClasses.inProgress,
        statusVariant === 'pending' && colorClasses.pending,
        statusVariant === 'pending' && 'opacity-50 hover:opacity-100'
      )}
    >
      {surveyNumber}
    </button>
  );
};


export function SiteSketchView({ acquisitionStatuses, onSelectSurvey }: SiteSketchViewProps) {
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Acquisition Dashboard</CardTitle>
        <CardDescription>
          An interactive grid of all survey plots. Click a plot to view and manage its acquisition details.
        </CardDescription>
      </CardHeader>
      <CardContent>
         <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-3 p-2 border rounded-lg bg-background/50">
            {siteSketchData.map((plot, index) => {
              // The status ID includes the index to ensure uniqueness for plots that might be part of a larger survey number but are distinct entries.
              const status = acquisitionStatuses.find(s => s.id.endsWith(`-${plot.surveyNumber}-${index}`));
              return (
                 <PlotCard key={`${plot.surveyNumber}-${index}`} plot={plot} status={status} onSelectSurvey={onSelectSurvey} />
              )
            })}
          </div>
      </CardContent>
       <CardFooter>
        <p className="text-xs text-muted-foreground">Colour indicates ‘Advance Paid’.</p>
      </CardFooter>
    </Card>
  );
}
