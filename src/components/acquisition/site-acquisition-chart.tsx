
'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { AcquisitionStatus } from '@/types';
import { siteSketchData, type SiteSketchPlot } from '@/lib/site-sketch-data';

// Type for the calculated display status
type DisplayStatus = 'Sale Deed Registered' | 'Sale Agreement' | 'Sale Advance' | 'Under Negotiation' | 'Pending' | 'Empty';

// All possible display statuses for the legend
const ALL_STATUSES: DisplayStatus[] = ['Sale Deed Registered', 'Sale Agreement', 'Sale Advance', 'Under Negotiation', 'Pending', 'Empty'];

// Color classes for different statuses
const statusClasses: Record<DisplayStatus, string> = {
    'Sale Deed Registered': 'bg-green-100 hover:bg-green-200 border-green-200 text-green-800 dark:bg-green-900/50 dark:text-green-300 dark:border-green-800 dark:hover:bg-green-800/60',
    'Sale Agreement': 'bg-yellow-100 hover:bg-yellow-200 border-yellow-200 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-800 dark:hover:bg-yellow-800/60',
    'Sale Advance': 'bg-orange-100 hover:bg-orange-200 border-orange-200 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300 dark:border-orange-800 dark:hover:bg-orange-800/60',
    'Under Negotiation': 'bg-blue-100 hover:bg-blue-200 border-blue-200 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-800 dark:hover:bg-blue-800/60',
    'Pending': 'bg-gray-200 hover:bg-gray-300 border-gray-300 text-gray-800 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700/80',
    'Empty': 'bg-background hover:bg-muted/50 border-border',
};


// Helper function to determine the display status from acquisition data
const getDisplayStatus = (status?: AcquisitionStatus): DisplayStatus => {
  if (!status || status.familyHeadName === 'N/A') return 'Empty';

  // Order of checks is important, from most complete to least
  if (status.legal.queryStatus === 'Cleared') return 'Sale Deed Registered';
  if (status.financials.agreementStatus === 'Signed') return 'Sale Agreement';
  if (status.financials.advancePayment === 'Paid') return 'Sale Advance';
  if (status.operations.meetingDate || status.operations.documentCollection !== 'Pending' || status.legal.queryStatus === 'On-Progress') return 'Under Negotiation';

  return 'Pending';
};

// Component for an individual plot in the chart
const ChartPlot = ({
    plot,
    status,
    displayStatus,
    onSelectSurvey,
}: {
    plot: SiteSketchPlot;
    status?: AcquisitionStatus;
    displayStatus: DisplayStatus;
    onSelectSurvey: (statusId: string) => void;
}) => {

    const plotInfo = status ? status : plot;
    
    return (
        <button
            onClick={() => status && onSelectSurvey(status.id)}
            disabled={!status || displayStatus === 'Empty'}
            className={cn(
                "w-full aspect-[4/3] flex flex-col items-center justify-center rounded-lg border p-2 text-xs text-center shadow-sm transition-all hover:shadow-md hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed",
                statusClasses[displayStatus]
            )}
        >
            {displayStatus !== 'Empty' && (
                <>
                    <span className="font-bold">{plotInfo.surveyNumber}</span>
                    <span className="text-ellipsis overflow-hidden whitespace-nowrap w-full">{plotInfo.familyHeadName}</span>
                    <span className="text-muted-foreground">{plotInfo.extent.acres}ac, {plotInfo.extent.cents}c</span>
                </>
            )}
        </button>
    );
};


// Main Chart Component
interface SiteAcquisitionChartProps {
    acquisitionStatuses: AcquisitionStatus[];
    onSelectSurvey: (statusId: string) => void;
}

export function SiteAcquisitionChart({ acquisitionStatuses, onSelectSurvey }: SiteAcquisitionChartProps) {
    
    const plotData = useMemo(() => {
        return siteSketchData.map((plot, index) => {
            // Reconstruct the potential ID suffix to find the matching status
            const statusIdSuffix = `-${plot.surveyNumber}-${index}`;
            const status = acquisitionStatuses.find(s => s.id.endsWith(statusIdSuffix));
            const displayStatus = getDisplayStatus(status);
            return {
                key: `${plot.surveyNumber}-${index}`,
                plot,
                status,
                displayStatus
            };
        });
    }, [acquisitionStatuses]);

    const summary = useMemo(() => {
        const counts = ALL_STATUSES.reduce((acc, status) => ({ ...acc, [status]: 0 }), {} as Record<DisplayStatus, number>);
        
        plotData.forEach(data => {
            counts[data.displayStatus]++;
        });
        return counts;
    }, [plotData]);

    if (!acquisitionStatuses || acquisitionStatuses.length === 0) {
        return (
            <Card>
                 <CardHeader>
                    <CardTitle>Site Acquisition Chart</CardTitle>
                 </CardHeader>
                 <CardContent className="p-12 text-center text-muted-foreground">
                    No acquisition data available. Add land records in the "Family Lineage" tab.
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Site Acquisition Chart</CardTitle>
                    <CardDescription>
                        Visual overview of acquisition progress, automatically updated from the Acquisition Tracker. Click a plot to view details.
                    </CardDescription>
                </CardHeader>
            </Card>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                 {ALL_STATUSES.map(status => (
                    <div key={status} className="bg-card p-3 rounded-lg shadow flex items-center gap-2">
                         <div className={cn("h-5 w-5 rounded-sm border", statusClasses[status])} />
                         <span className="text-sm font-medium">{status}: {summary[status]}</span>
                    </div>
                ))}
            </div>

            <div className="bg-card rounded-lg shadow p-4">
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-3 p-2 border rounded-lg bg-background/50">
                    {plotData.map(data => (
                        <ChartPlot
                            key={data.key}
                            plot={data.plot}
                            status={data.status}
                            displayStatus={data.displayStatus}
                            onSelectSurvey={onSelectSurvey}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
