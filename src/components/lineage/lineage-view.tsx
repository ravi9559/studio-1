'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { PersonCard, type Person } from './person-card';
import { LineageSuggestion } from './lineage-suggestion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Loader2 } from 'lucide-react';

// Mock data to be used as a default for new projects
const defaultFamilyHead: Person = {
  id: '1',
  name: 'Kandasamy Gounder',
  relation: 'Family Head',
  gender: 'Male',
  age: 85,
  maritalStatus: 'Married',
  status: 'Died',
  sourceOfLand: 'Purchase',
  landDetails: 'Survey 123/A, 5.2 Acres',
  heirs: [
    {
      id: '1.1',
      name: 'Ramasamy Gounder',
      relation: 'Son',
      gender: 'Male',
      age: 60,
      maritalStatus: 'Married',
      status: 'Alive',
      sourceOfLand: 'Legal Heir',
      landDetails: 'Survey 123/A, 2.6 Acres',
      heirs: [
        {
          id: '1.1.1',
          name: 'Palanisamy',
          relation: 'Son',
          gender: 'Male',
          age: 35,
          maritalStatus: 'Married',
          status: 'Alive',
          sourceOfLand: 'Legal Heir',
          heirs: [],
        },
        {
          id: '1.1.2',
          name: 'Saraswathi',
          relation: 'Daughter',
          gender: 'Female',
          age: 32,
          maritalStatus: 'Married',
          status: 'Alive',
          sourceOfLand: 'Legal Heir',
          heirs: [],
        },
      ],
    },
    {
      id: '1.2',
      name: 'Kamalam',
      relation: 'Daughter',
      gender: 'Female',
      age: 58,
      maritalStatus: 'Married',
      status: 'Alive',
      sourceOfLand: 'Gift',
      landDetails: 'Survey 123/B, 2.6 Acres',
      heirs: [],
    },
  ],
};

// Recursive function to add an heir
const addHeirToFamily = (family: Person, parentId: string, newHeirData: Omit<Person, 'id' | 'heirs'>): Person => {
  if (family.id === parentId) {
    const newHeir: Person = {
      ...newHeirData,
      id: `${parentId}.${family.heirs.length + 1}`,
      heirs: [],
    };
    return {
      ...family,
      heirs: [...family.heirs, newHeir],
    };
  }
  return {
    ...family,
    heirs: family.heirs.map(h => addHeirToFamily(h, parentId, newHeirData)),
  };
};

// Recursive function to update a person
const updatePersonInFamily = (family: Person, personId: string, updatedData: Omit<Person, 'id' | 'heirs'>): Person => {
  if (family.id === personId) {
    return {
      ...family,
      ...updatedData,
    };
  }
  return {
    ...family,
    heirs: family.heirs.map(h => updatePersonInFamily(h, personId, updatedData)),
  };
};

export function LineageView() {
  const params = useParams();
  const projectId = params.projectId as string;
  const [familyHead, setFamilyHead] = useState<Person | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const storageKey = `lineage-data-${projectId}`;

  useEffect(() => {
    if (!projectId) return;
    try {
      const savedData = localStorage.getItem(storageKey);
      if (savedData) {
        setFamilyHead(JSON.parse(savedData));
      } else {
        // If no data, start with the default mock data
        setFamilyHead(defaultFamilyHead);
      }
    } catch (e) {
      console.error("Could not load lineage data", e);
      setFamilyHead(defaultFamilyHead); // Fallback to default
    }
    setIsLoaded(true);
  }, [projectId, storageKey]);

  useEffect(() => {
    if (isLoaded && familyHead) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(familyHead));
      } catch (e) {
        console.error("Could not save lineage data", e);
      }
    }
  }, [familyHead, isLoaded, storageKey]);

  const handleAddHeir = (parentId: string, heirData: Omit<Person, 'id' | 'heirs'>) => {
    if (!familyHead) return;
    const updatedFamilyHead = addHeirToFamily(familyHead, parentId, heirData);
    setFamilyHead(updatedFamilyHead);
  };
  
  const handleUpdatePerson = (personId: string, personData: Omit<Person, 'id' | 'heirs'>) => {
    if (!familyHead) return;
    const updatedFamilyHead = updatePersonInFamily(familyHead, personId, personData);
    setFamilyHead(updatedFamilyHead);
  };

  if (!familyHead || !isLoaded) {
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
            <CardDescription>Visual representation of the family lineage. Click "Add Heir" to expand the tree.</CardDescription>
          </CardHeader>
          <CardContent>
            <PersonCard person={familyHead} onAddHeir={handleAddHeir} onUpdatePerson={handleUpdatePerson} />
          </CardContent>
        </Card>
      </div>
      <div>
        <LineageSuggestion existingData={familyDataString} />
      </div>
    </div>
  );
}
