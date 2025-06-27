
'use client';

import { PersonCard } from './person-card';
import { LineageSuggestion } from './lineage-suggestion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Loader2 } from 'lucide-react';
import type { Person } from '@/types';

interface LineageViewProps {
    familyHeads: Person[];
    onAddHeir: (parentId: string, heirData: Omit<Person, 'id' | 'heirs' | 'landRecords'>) => void;
    onUpdatePerson: (personId: string, personData: Omit<Person, 'id' | 'heirs'>) => void;
}

export function LineageView({ familyHeads, onAddHeir, onUpdatePerson }: LineageViewProps) {

  if (!familyHeads || familyHeads.length === 0) {
    return (
        <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="ml-4">Loading Owner Data...</p>
        </div>
    )
  }

  const allOwnersDataString = JSON.stringify(familyHeads, null, 2);

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Owner & Lineage Management</CardTitle>
            <CardDescription>
                A list of all landowners for this project, generated from the site sketch data. 
                You can manage each owner's details, land records, and heirs below.
            </CardDescription>
          </CardHeader>
        </Card>
        
        {familyHeads.map(person => (
             <PersonCard 
                key={person.id} 
                person={person} 
                onAddHeir={onAddHeir} 
                onUpdatePerson={onUpdatePerson} 
                isFamilyHead={true}
             />
        ))}

      </div>
      <div>
        <LineageSuggestion existingData={allOwnersDataString} />
      </div>
    </div>
  );
}
