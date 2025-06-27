
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AcquisitionCard } from './acquisition-card';
import type { AcquisitionStatus } from '@/types';

interface AcquisitionTrackerViewProps {
  statuses: AcquisitionStatus[];
}

export function AcquisitionTrackerView({ statuses }: AcquisitionTrackerViewProps) {
  const [selectedSurvey, setSelectedSurvey] = useState<string | undefined>(statuses[0]?.surveyNumber);

  const selectedStatus = statuses.find(s => s.surveyNumber === selectedSurvey);

  if (statuses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Acquisition Tracker</CardTitle>
        </CardHeader>
        <CardContent className="text-center text-muted-foreground p-8">
          No survey records found for this project. Add land records in the "Family Lineage" tab to begin tracking acquisition.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Acquisition Tracker</CardTitle>
          <CardDescription>
            Select a survey number to view its acquisition progress. Data is auto-filled from the Family Lineage tab.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select onValueChange={setSelectedSurvey} defaultValue={selectedSurvey}>
            <SelectTrigger className="w-full md:w-1/3">
              <SelectValue placeholder="Select a Survey Number..." />
            </SelectTrigger>
            <SelectContent>
              {statuses.map(status => (
                <SelectItem key={status.id} value={status.surveyNumber}>
                  Survey No: {status.surveyNumber}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
      
      {selectedStatus ? (
        <AcquisitionCard status={selectedStatus} />
      ) : (
        <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
                Please select a survey number to view its tracking details.
            </CardContent>
        </Card>
      )}
    </div>
  );
}
