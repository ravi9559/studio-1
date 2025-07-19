// src/components/sketch/site-sketch-view.tsx
'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { siteSketchData, type SiteSketchPlot } from '@/lib/site-sketch-data';

interface SiteSketchViewProps {
  onSelectSurvey: (surveyNumber: string) => void;
}


const PlotCard = ({ onSelectSurvey, plot }: { onSelectSurvey: (surveyNumber: string) => void; plot: SiteSketchPlot }) => {
  const style: React.CSSProperties = {
    gridColumn: plot.colSpan ? `span ${plot.colSpan}` : 'span 1',
    gridRow: plot.rowSpan ? `span ${plot.rowSpan}` : 'span 1',
  };

  if (!plot.ownerName) { // Assuming empty plots have no owner name
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
      onClick={() => onSelectSurvey(plot.surveyNumber)}
      style={style}
      className={cn(
        'w-full aspect-square flex flex-col items-center justify-center rounded-lg border p-1 text-xs font-semibold shadow-sm transition-all hover:shadow-md hover:scale-105',
        'bg-slate-100 text-slate-800 border-slate-400 hover:bg-slate-200 dark:bg-slate-900/50 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-800/50'
      )}
    >
      <span className="text-center break-words">{plot.surveyNumber}</span>
      <span className="text-xs font-normal text-center break-words">{plot.ownerName}</span>
      <span className="text-xs font-normal text-muted-foreground text-center">
        {plot.acres || '0'}ac, {plot.cents || '0'}c
      </span>
    </button>
  );
};


export function SiteSketchView({ onSelectSurvey }: SiteSketchViewProps) {
  
  if (siteSketchData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Site Layout</CardTitle>
          <CardDescription>
            A visual representation of the project site.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground p-8 border rounded-lg border-dashed">
            No site layout data available.
          </div>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Site Layout</CardTitle>
        <CardDescription>
          A visual representation of the project site.
        </CardDescription>
      </CardHeader>
      <CardContent>
         <div className="grid grid-cols-20 gap-2 p-2 border rounded-lg bg-background/50">
            {siteSketchData.map((plot, index) => {
              return (
                 <PlotCard 
                    key={`${plot.surveyNumber}-${index}`} 
                    plot={plot}
                    onSelectSurvey={onSelectSurvey} 
                 />
              )
            })}
          </div>
      </CardContent>
       <CardFooter>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm bg-slate-100 border border-slate-400"></span>Plot</div>
        </div>
      </CardFooter>
    </Card>
  );
}
