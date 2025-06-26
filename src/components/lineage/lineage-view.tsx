import { PersonCard } from './person-card';
import { LineageSuggestion } from './lineage-suggestion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';

// Mock data
const familyHead = {
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
      heirs: [],
    },
  ],
};

export function LineageView() {
  const familyDataString = JSON.stringify(familyHead, null, 2);

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Family Tree</CardTitle>
            <CardDescription>Visual representation of the family lineage.</CardDescription>
          </CardHeader>
          <CardContent>
            <PersonCard person={familyHead} />
          </CardContent>
        </Card>
      </div>
      <div>
        <LineageSuggestion existingData={familyDataString} />
      </div>
    </div>
  );
}
