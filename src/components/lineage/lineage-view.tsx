
'use client';

import { useState } from 'react';
import { PersonCard } from './person-card';
import { LineageSuggestion } from './lineage-suggestion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Loader2, Search, FileInput } from 'lucide-react';
import type { Person } from '@/types';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { ImportSheetDialog } from './import-sheet-dialog';

interface LineageViewProps {
    familyHeads: Person[];
    onAddHeir: (parentId: string, heirData: Omit<Person, 'id' | 'heirs' | 'landRecords'>) => void;
    onUpdatePerson: (personId: string, personData: Omit<Person, 'id' | 'heirs'>) => void;
    onImport: (newOwners: Person[]) => void;
}

export function LineageView({ familyHeads, onAddHeir, onUpdatePerson, onImport }: LineageViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isImportOpen, setIsImportOpen] = useState(false);

  if (!Array.isArray(familyHeads)) {
    return (
        <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="ml-4">Loading Owner Data...</p>
        </div>
    )
  }

  const filteredHeads = familyHeads.filter(person => 
    person.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const allOwnersDataString = JSON.stringify(familyHeads, null, 2);

  return (
    <>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Owner & Lineage Management</CardTitle>
                  <CardDescription>
                      A list of all landowners for this project. 
                      You can search by name, manage details, add heirs, or import from a Google Sheet.
                  </CardDescription>
                </div>
                 <Button variant="outline" onClick={() => setIsImportOpen(true)}>
                    <FileInput className="mr-2 h-4 w-4" />
                    Import from Sheet
                 </Button>
              </div>
            </CardHeader>
            <CardContent>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search for an owner by name..."
                    className="w-full pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
            </CardContent>
          </Card>
          
          {filteredHeads.length > 0 ? (
            filteredHeads.map(person => (
              <PersonCard 
                  key={person.id} 
                  person={person} 
                  onAddHeir={onAddHeir} 
                  onUpdatePerson={onUpdatePerson} 
                  isFamilyHead={true}
              />
            ))
          ) : (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                No owners found matching your search.
              </CardContent>
            </Card>
          )}

        </div>
        <div>
          <LineageSuggestion existingData={allOwnersDataString} />
        </div>
      </div>
      <ImportSheetDialog 
        isOpen={isImportOpen} 
        onOpenChange={setIsImportOpen} 
        onImportSuccess={(newOwners) => {
          onImport(newOwners);
          setIsImportOpen(false);
        }}
      />
    </>
  );
}
