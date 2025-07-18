// src/components/sketch/site-sketch-view.tsx
'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { AcquisitionStatus, FinancialTransaction } from '@/types';
import { siteSketchData, type SiteSketchPlot } from '@/lib/site-sketch-data';

interface SiteSketchViewProps {
  acquisitionStatuses: AcquisitionStatus[];
  financialTransactions: FinancialTransaction[];
  onSelectSurvey: (statusId: string) => void;
}

const getStatusVariant = (status: AcquisitionStatus | undefined, isAdvancePaid: boolean): 'completed' | 'advancePaid' | 'inProgress' | 'pending' => {
    if (!status) return 'pending';
    if (status.legal.overallStatus === 'Cleared') return 'completed';
    if (isAdvancePaid) return 'advancePaid';
    if (status.legal.overallStatus === 'On-Progress' || status.legal.overallStatus === 'Awaiting') return 'inProgress';
    return 'pending';
}

const PlotCard = ({ status, isAdvancePaid, onSelectSurvey, plot }: { status?: AcquisitionStatus, isAdvancePaid: boolean, onSelectSurvey: (statusId: string) => void; plot: SiteSketchPlot }) => {
  const statusVariant = getStatusVariant(status, isAdvancePaid);

  const colorClasses = {
    completed: 'bg-green-100 text-green-800 border-green-400 hover:bg-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700 dark:hover:bg-green-800/50',
    advancePaid: 'bg-blue-100 text-blue-800 border-blue-400 hover:bg-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-700 dark:hover:bg-blue-800/50',
    inProgress: 'bg-yellow-100 text-yellow-800 border-yellow-400 hover:bg-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-700 dark:hover:bg-yellow-800/50',
    pending: 'bg-slate-100 text-slate-800 border-slate-400 hover:bg-slate-200 dark:bg-slate-900/50 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-800/50',
  };

  const isEmpty = !status;

  const style: React.CSSProperties = {
    gridColumn: plot.colSpan ? `span ${plot.colSpan}` : 'span 1',
    gridRow: plot.rowSpan ? `span ${plot.rowSpan}` : 'span 1',
  };

  if (isEmpty) {
    return (
      <div
        style={style}
        className="w-full aspect-square flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 dark:border-slate-800"
      >
        <span className="text-xs text-muted-foreground">{plot.surveyNumber}</span>
      </div>
    );
  }

  return (
    <button
      onClick={() => status && onSelectSurvey(status.id)}
      style={style}
      className={cn(
        'w-full aspect-square flex flex-col items-center justify-center rounded-lg border p-1 text-xs font-semibold shadow-sm transition-all hover:shadow-md hover:scale-105',
        colorClasses[statusVariant]
      )}
    >
      <span className="text-center break-words">{status.surveyNumber}</span>
      <span className="text-xs font-normal text-center break-words">{status.familyHeadName}</span>
      <span className="text-xs font-normal text-muted-foreground text-center">
        {status.extent.acres || '0'}ac, {status.extent.cents || '0'}c
      </span>
    </button>
  );
};


export function SiteSketchView({ acquisitionStatuses, financialTransactions, onSelectSurvey }: SiteSketchViewProps) {
  
  if (!acquisitionStatuses || acquisitionStatuses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Acquisition Dashboard</CardTitle>
          <CardDescription>
            An interactive grid of all survey plots. Plots will appear here once you add them in the "Family Lineage" tab.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground p-8 border rounded-lg border-dashed">
            No land records found.
          </div>
        </CardContent>
      </Card>
    )
  }

  // Create a set of familyHeadIds for whom an advance has been paid
  const familyHeadsWithAdvance = new Set<string>();
  financialTransactions.forEach(tx => {
    if (tx.purpose === 'Token Advance' && tx.familyHeadId) {
      familyHeadsWithAdvance.add(tx.familyHeadId);
    }
  });
  
  const acquisitionStatusMap = useMemo(() => {
    return acquisitionStatuses.reduce((acc, status) => {
        acc[status.surveyNumber] = status;
        return acc;
    }, {} as Record<string, AcquisitionStatus>);
  }, [acquisitionStatuses]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Acquisition Dashboard</CardTitle>
        <CardDescription>
          An interactive grid of all survey plots. Click a plot to view and manage its acquisition details below.
        </CardDescription>
      </CardHeader>
      <CardContent>
         <div className="grid grid-cols-20 gap-2 p-2 border rounded-lg bg-background/50">
            {siteSketchData.map((plot, index) => {
              const status = acquisitionStatusMap[plot.surveyNumber];
              const isAdvancePaid = status ? familyHeadsWithAdvance.has(status.familyHeadId) : false;
              return (
                 <PlotCard 
                    key={`${plot.surveyNumber}-${index}`} 
                    plot={plot}
                    status={status} 
                    isAdvancePaid={isAdvancePaid}
                    onSelectSurvey={onSelectSurvey} 
                 />
              )
            })}
          </div>
      </CardContent>
       <CardFooter>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm bg-slate-100 border border-slate-400"></span>Pending</div>
          <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm bg-yellow-100 border border-yellow-400"></span>In Progress</div>
          <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm bg-blue-100 border border-blue-400"></span>Advance Paid</div>
          <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm bg-green-100 border border-green-400"></span>Completed</div>
        </div>
      </CardFooter>
    </Card>
  );
}
