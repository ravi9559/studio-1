
'use client';

import { useState } from 'react';
import { PersonCard } from './person-card';
import { LineageSuggestion } from './lineage-suggestion';
import { Card, CardContent } from '../ui/card';
import { Loader2, Search, FileInput } from 'lucide-react';
import type { Person, User } from '@/types';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { ImportSheetDialog } from './import-sheet-dialog';

interface LineageViewProps {
    familyHeads: Person[];
    onAddHeir: (parentId: string, heirData: Omit<Person, 'id' | 'heirs' | 'landRecords'>) => void;
    onUpdatePerson: (personId: string, personData: Omit<Person, 'id' | 'heirs'>) => void;
    onImport: (newOwners: Person[]) => void;
    projectId: string;
    currentUser: User | null;
}

const searchInFamily = (person: Person, query: string): boolean => {
    const lowerCaseQuery = query.toLowerCase();

    const checkPerson = (p: Person): boolean => {
        if (p.name.toLowerCase().includes(lowerCaseQuery)) return true;
        if (p.relation.toLowerCase().includes(lowerCaseQuery)) return true;
        if ((p.sourceOfLand || '').toLowerCase().includes(lowerCaseQuery)) return true;
        if ((p.holdingPattern || '').toLowerCase().includes(lowerCaseQuery)) return true;
        if (p.status.toLowerCase().includes(lowerCaseQuery)) return true;

        if (p.landRecords.some(lr => lr.surveyNumber.toLowerCase().includes(lowerCaseQuery))) {
            return true;
        }
        
        // Continue searching in heirs
        return p.heirs.some(heir => checkPerson(heir));
    }
    
    return checkPerson(person);
}

export function LineageView({ familyHeads, onAddHeir, onUpdatePerson, onImport, projectId, currentUser }: LineageViewProps) {
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

  const filteredHeads = searchQuery 
    ? familyHeads.filter(person => searchInFamily(person, searchQuery))
    : familyHeads;

  const allOwnersDataString = JSON.stringify(familyHeads, null, 2);

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Owner &amp; Lineage Management</h2>
            <p className="text-muted-foreground">
                Search records, manage details, add heirs, or import from a CSV file.
            </p>
          </div>
          <div className="flex items-center gap-2">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search full records..."
                  className="w-full pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
                <Button onClick={() => setIsImportOpen(true)}>
                  <FileInput className="mr-2 h-4 w-4" />
                  Import
                </Button>
          </div>
        </div>
        
        {filteredHeads.length > 0 ? (
          filteredHeads.map(person => (
            <PersonCard 
                key={person.id} 
                person={person} 
                onAddHeir={onAddHeir} 
                onUpdatePerson={onUpdatePerson} 
                isFamilyHead={true}
                projectId={projectId}
                currentUser={currentUser}
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
      
      <LineageSuggestion existingData={allOwnersDataString} />

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
