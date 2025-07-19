
'use client';

import { useMemo } from 'react';
import type { Person, FinancialTransaction, SurveyRecord, LandClassification } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Coins, PiggyBank, Scale, User, TrendingUp } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, parseISO, startOfMonth } from 'date-fns';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

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
  const { paidPlots, duePlots, chartData } = useMemo(() => {
    const paidFamilyHeadIds = new Set(
      financialTransactions
        .filter(tx => tx.purpose === 'Token Advance')
        .map(tx => tx.familyHeadId)
    );

    const paid: PlotInfo[] = [];
    const due: PlotInfo[] = [];
    const allPlots: PlotInfo[] = [];

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
      allPlots.push(...plotsForFamily);

      if (isPaid) {
        paid.push(...plotsForFamily);
      } else {
        due.push(...plotsForFamily);
      }
    });

    const totalPlotsCount = allPlots.length;

    // Process data for the chart
    const advanceTransactions = financialTransactions
        .filter(tx => tx.purpose === 'Token Advance')
        .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const paymentsByMonth: Record<string, number> = {};
    const paidHeadIdsByMonth: Record<string, Set<string>> = {};

    advanceTransactions.forEach(tx => {
        const month = format(startOfMonth(parseISO(tx.date)), 'MMM yyyy');
        if (!paidHeadIdsByMonth[month]) {
            paidHeadIdsByMonth[month] = new Set();
        }
        paidHeadIdsByMonth[month].add(tx.familyHeadId);
    });

    const sortedMonths = Object.keys(paidHeadIdsByMonth).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    const cumulativePaidIds = new Set<string>();
    const cumulativeChartData = [];

    for (const month of sortedMonths) {
        paidHeadIdsByMonth[month].forEach(id => cumulativePaidIds.add(id));
        
        let plotsPaidThisMonth = 0;
        familyHeads.forEach(head => {
            if (cumulativePaidIds.has(head.id)) {
                plotsPaidThisMonth += head.landRecords.length;
                head.heirs.forEach(h => plotsPaidThisMonth += h.landRecords.length);
            }
        });

        const percentage = totalPlotsCount > 0 ? Math.round((plotsPaidThisMonth / totalPlotsCount) * 100) : 0;
        cumulativeChartData.push({ month, percentage });
    }

    return { paidPlots: paid, duePlots: due, chartData: cumulativeChartData };
  }, [familyHeads, financialTransactions]);

  const totalPlots = paidPlots.length + duePlots.length;
  const advancePaidPercentage = totalPlots > 0 ? Math.round((paidPlots.length / totalPlots) * 100) : 0;
  
  const chartConfig = {
    percentage: {
      label: "Progress (%)",
      color: "hsl(var(--primary))",
    },
  };

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
      {/* Summary Section */}
      <Card>
        <CardHeader>
          <CardTitle>Advance Payment Summary</CardTitle>
          <CardDescription>
            An overview of the advance payment status for this project, including progress over time.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="flex flex-col items-center justify-center p-6 text-center">
             <p className="text-6xl font-bold text-primary">{advancePaidPercentage}%</p>
             <p className="text-muted-foreground mt-2">of advances have been paid for {totalPlots} total plots.</p>
             <Progress value={advancePaidPercentage} className="mt-4 w-full max-w-sm" />
          </div>

          <div className="h-64">
             <ChartContainer config={chartConfig}>
              <LineChart
                data={chartData}
                margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
              >
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis unit="%" tickLine={false} axisLine={false} tickMargin={8} domain={[0, 100]} />
                <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dot" />}
                />
                <Line
                  dataKey="percentage"
                  type="monotone"
                  stroke="var(--color-percentage)"
                  strokeWidth={2}
                  dot={true}
                />
              </LineChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>

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
