
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { Person, SurveyRecord } from '@/types';
import { Building, LandPlot } from 'lucide-react';

interface MindMapViewProps {
  projectName: string;
  familyHeads: Person[];
}

const SsdNode = ({ record }: { record: SurveyRecord }) => (
  <div className="flex items-center">
    <div className="w-6 border-t border-dashed border-border"></div>
    <Card className="w-60 shrink-0">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3">
        <CardTitle className="text-sm font-medium">S.No: {record.surveyNumber}</CardTitle>
        <LandPlot className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="p-3 pt-0 text-xs text-muted-foreground">
        <p>{record.acres || '0'}ac, {record.cents || '0'}c</p>
        <p>{record.landClassification}</p>
      </CardContent>
    </Card>
  </div>
);

const PersonNode = ({ person }: { person: Person }) => {
  const allLandRecords: SurveyRecord[] = [];
  const collectLandRecords = (p: Person) => {
    allLandRecords.push(...p.landRecords);
    p.heirs.forEach(collectLandRecords);
  };
  collectLandRecords(person);

  return (
    <div className="relative flex items-start pl-12 pt-8">
      {/* Vertical connector line from parent */}
      <div className="absolute left-6 -top-4 bottom-0 w-px -translate-x-1/2 bg-border"></div>
      {/* Horizontal connector line to this node */}
      <div className="absolute left-6 top-8 h-px w-6 -translate-x-1/2 bg-border"></div>

      <div className="flex flex-col gap-4">
        <Card className="w-80 shrink-0 shadow-md">
          <CardHeader className="flex flex-row items-center gap-3 p-4">
            <Avatar>
              <AvatarFallback>{person.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>{person.name}</CardTitle>
              <CardDescription>{person.relation}</CardDescription>
            </div>
          </CardHeader>
        </Card>

        {/* Branch to SSDs */}
        {allLandRecords.length > 0 && (
          <div className="relative pl-12">
            <div className="absolute left-6 top-0 bottom-0 w-px -translate-x-1/2 bg-border"></div>
            <div className="flex flex-col gap-2">
              {allLandRecords.map((rec) => (
                <div key={rec.id} className="relative pt-4">
                  <div className="absolute left-0 top-6 h-px w-6 -translate-y-px bg-border"></div>
                  <SsdNode record={rec} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export function MindMapView({ projectName, familyHeads }: MindMapViewProps) {
  if (!familyHeads || familyHeads.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Project Mind Map</CardTitle>
          <CardDescription>A visual hierarchy of the project's structure.</CardDescription>
        </CardHeader>
        <CardContent className="p-8 text-center text-muted-foreground">
          No lineage data available to build the mind map. Please import data in the "Family Lineage" tab.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Mind Map</CardTitle>
        <CardDescription>A visual hierarchy of the project's ownership structure and land parcels.</CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto p-4">
        <div className="inline-block min-w-full align-middle">
          {/* Project Root Node */}
          <div className="flex items-center gap-4">
            <Card className="w-96 shrink-0 bg-primary/10">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-3">
                  <Building className="h-8 w-8 text-primary" />
                  {projectName}
                </CardTitle>
              </CardHeader>
            </Card>
            <div className="w-8 border-t border-border"></div>
            <div className="text-muted-foreground">Family Heads</div>
          </div>

          {/* Branch to Family Heads */}
          <div className="relative pl-6">
            <div className="absolute left-0 top-0 bottom-0 w-px bg-border"></div>
            {familyHeads.map(person => (
              <PersonNode key={person.id} person={person} />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
