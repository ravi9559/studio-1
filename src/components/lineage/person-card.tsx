'use client';

import type { FC } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, UserPlus, Edit, Trash2, Milestone } from 'lucide-react';
import { Separator } from '../ui/separator';

type Person = {
  id: string;
  name: string;
  relation: string;
  gender: string;
  age: number;
  maritalStatus: string;
  status: 'Alive' | 'Died' | 'Unknown' | 'Missing';
  sourceOfLand?: string;
  landDetails?: string;
  heirs: Person[];
};

interface PersonCardProps {
  person: Person;
}

const statusColors: { [key in Person['status']]: string } = {
  Alive: 'bg-green-500',
  Died: 'bg-gray-500',
  Missing: 'bg-yellow-500',
  Unknown: 'bg-blue-500',
};

export const PersonCard: FC<PersonCardProps> = ({ person }) => {
  return (
    <Card className="bg-card/50 shadow-md">
      <CardHeader>
        <div className="flex items-start justify-between">
            <div>
                <CardTitle className="flex items-center gap-2">
                    <User className="text-primary" />
                    {person.name} <span className="text-sm font-normal text-muted-foreground">({person.relation})</span>
                </CardTitle>
                <CardDescription>Record ID: {person.id}</CardDescription>
            </div>
             <Badge variant="secondary" className="whitespace-nowrap flex items-center gap-1.5">
                <span className={`h-2 w-2 rounded-full ${statusColors[person.status]}`} />
                {person.status}
            </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="font-semibold">Gender:</span> {person.gender}</div>
            <div><span className="font-semibold">Age:</span> {person.age}</div>
            <div><span className="font-semibold">Marital Status:</span> {person.maritalStatus}</div>
            {person.sourceOfLand && <div><span className="font-semibold">Source of Land:</span> {person.sourceOfLand}</div>}
            {person.landDetails && <div className="col-span-2"><span className="font-semibold">Land Details:</span> {person.landDetails}</div>}
        </div>
        
      </CardContent>
      <CardFooter className="flex items-center justify-end gap-2 p-3">
            <Button variant="ghost" size="sm"><Edit className="mr-1 h-3 w-3" /> Edit</Button>
            <Button variant="ghost" size="sm"><Trash2 className="mr-1 h-3 w-3" /> Delete</Button>
            <Button size="sm"><UserPlus className="mr-1 h-3 w-3" /> Add Heir</Button>
      </CardFooter>
      
      {person.heirs && person.heirs.length > 0 && (
        <div className="border-t">
          <div className="pl-6 border-l-2 border-primary/20 ml-4 my-4 space-y-4">
              <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2 pt-4 -ml-1"><Milestone className="h-4 w-4" />Heirs</h4>
            {person.heirs.map((heir) => (
              <PersonCard key={heir.id} person={heir} />
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};
