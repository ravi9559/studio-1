
'use client';

import { useMemo } from 'react';
import type { Person, FinancialTransaction, SurveyRecord, LandClassification } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Coins, PiggyBank, Scale, User } from 'lucide-react';

type PlotInfo = {
  surveyNumber: string;
  extent: { acres: string; cents: string };
  familyHeadName: string;
  classification: LandClassification;
};

// Card for a single plot in the grid
function PlotCard({ plot }: { plot: PlotInfo }) {
  return (
    <div className="rounded-lg bg-card p-3 shadow-sm transition-all hover:shadow-md hover:ring-2 hover:ring-primary">
      <div className="flex justify-between items-start">
        <p className="font-bold text-lg">{plot.surveyNumber}</p>
        <Badge variant="outline">{plot.classification}</Badge>
      </div>
      <div className="mt-4 space-y-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>{plot.familyHeadName}</span>
        </div>
        <div className="flex items-center gap-2">
            <Scale className="h-4 w-4" />
            <span>{plot.extent.acres || '0'}ac, {plot.extent.cents || '0'}c</span>
        </div>
      </div>
    </div>
  );
}

// Main grid component
interface AdvancePaymentGridProps {
  familyHeads: Person[];
  financialTransactions: FinancialTransaction[];
}

export function AdvancePaymentGrid({ familyHeads, financialTransactions }: AdvancePaymentGridProps) {
  const { paidPlots, duePlots } = useMemo(() => {
    const paidFamilyHeadIds = new Set(
      financialTransactions
        .filter(tx => tx.purpose === 'Token Advance')
        .map(tx => tx.familyHeadId)
    );

    const paid: PlotInfo[] = [];
    const due: PlotInfo[] = [];

    familyHeads.forEach(head => {
      const isPaid = paidFamilyHeadIds.has(head.id);
      
      const plotsForFamily: PlotInfo[] = [];
      
      const collectPlots = (person: Person, familyHead: Person) => {
        person.landRecords.forEach(lr => {
          plotsForFamily.push({
            surveyNumber: lr.surveyNumber,
            extent: { acres: lr.acres, cents: lr.cents },
            familyHeadName: familyHead.name,
            classification: lr.landClassification,
          });
        });
        person.heirs.forEach(heir => collectPlots(heir, familyHead));
      };
      
      collectPlots(head, head);

      if (isPaid) {
        paid.push(...plotsForFamily);
      } else {
        due.push(...plotsForFamily);
      }
    });

    return { paidPlots: paid, duePlots: due };
  }, [familyHeads, financialTransactions]);

  if (familyHeads.length === 0) {
     return (
        <Card>
            <CardHeader>
                <CardTitle>Advance Payment Status</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-center text-muted-foreground p-8 border rounded-lg border-dashed">
                No family lineage data found. Please add records in the "Family Lineage" tab.
                </div>
            </CardContent>
        </Card>
     );
  }

  return (
    <div className="space-y-8">
      {/* Advance Paid Section */}
      <Card className="border-green-500/30 bg-green-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
            <Coins />
            Advance Paid ({paidPlots.length} Plots)
          </CardTitle>
          <CardDescription>
            These are land parcels where a token advance has been paid to the family head.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {paidPlots.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {paidPlots.map(plot => <PlotCard key={plot.surveyNumber} plot={plot} />)}
            </div>
          ) : (
            <div className="text-center text-muted-foreground p-8 border rounded-lg border-dashed">
              No advance payments have been recorded yet.
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Advance Due Section */}
      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
            <PiggyBank />
            Advance Due ({duePlots.length} Plots)
          </CardTitle>
          <CardDescription>
            These are land parcels where advance payment is pending.
          </CardDescription>
        </CardHeader>
        <CardContent>
           {duePlots.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {duePlots.map(plot => <PlotCard key={plot.surveyNumber} plot={plot} />)}
            </div>
          ) : (
             <div className="text-center text-muted-foreground p-8 border rounded-lg border-dashed">
                All advances have been paid!
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
