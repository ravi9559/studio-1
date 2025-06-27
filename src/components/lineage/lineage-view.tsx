'use client';

import { PersonCard } from './person-card';
import { LineageSuggestion } from './lineage-suggestion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Loader2 } from 'lucide-react';
import type { Person } from '@/types';

interface LineageViewProps {
    familyHead: Person | null;
    onAddHeir: (parentId: string, heirData: Omit<Person, 'id' | 'heirs' | 'landRecords'>) => void;
    onUpdatePerson: (personId: string, personData: Omit<Person, 'id' | 'heirs'>) => void;
}

export function LineageView({ familyHead, onAddHeir, onUpdatePerson }: LineageViewProps) {

  if (!familyHead) {
    return (
        <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="ml-4">Loading Lineage Data...</p>
        </div>
    )
  }

  const familyDataString = JSON.stringify(familyHead, null, 2);

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Family Tree</CardTitle>
            <CardDescription>Visual representation of the family lineage. Edit a person to manage their land details.</CardDescription>
          </CardHeader>
          <CardContent>
            <PersonCard person={familyHead} onAddHeir={onAddHeir} onUpdatePerson={onUpdatePerson} />
          </CardContent>
        </Card>
      </div>
      <div>
        <LineageSuggestion existingData={familyDataString} />
      </div>
    </div>
  );
}
