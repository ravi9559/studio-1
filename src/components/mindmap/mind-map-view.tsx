
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import type { Person, SurveyRecord } from '@/types';
import { Building, LandPlot, Users, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

// Node for a single land record (SSD)
const SsdNode = ({ record }: { record: SurveyRecord }) => (
  <div className="relative pl-12 pt-4">
    {/* Connectors */}
    <div className="absolute left-6 -top-2 bottom-0 w-px -translate-x-1/2 bg-border/80"></div>
    <div className="absolute left-6 top-6 h-px w-6 -translate-y-px bg-border/80"></div>
    <Card className="w-64 shrink-0 transition-shadow hover:shadow-md">
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

// Recursive node for a person (Family Head or Heir)
const PersonNode = ({ person, isFamilyHead = false }: { person: Person, isFamilyHead?: boolean }) => {
  const [isOpen, setIsOpen] = useState(isFamilyHead); // Family heads are open by default
  const hasChildren = person.heirs.length > 0 || person.landRecords.length > 0;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="relative pl-12 pt-6">
      {!isFamilyHead && (
        <>
          {/* Vertical connector from parent */}
          <div className="absolute left-6 -top-2 bottom-0 w-px -translate-x-1/2 bg-border"></div>
          {/* Horizontal connector to this node */}
          <div className="absolute left-6 top-9 h-px w-6 -translate-y-px bg-border"></div>
        </>
      )}

      <div className="flex items-center">
        <CollapsibleTrigger asChild disabled={!hasChildren}>
          <div className={cn("flex items-center gap-2", hasChildren ? "cursor-pointer" : "cursor-default")}>
            {hasChildren ? (
              <ChevronRight className={cn('h-5 w-5 shrink-0 transition-transform duration-200', isOpen && 'rotate-90')} />
            ) : (
              <div className="h-5 w-5 shrink-0" />
            )}
            <Card className="w-80 shrink-0 shadow-md transition-shadow hover:shadow-lg">
              <CardHeader className="flex flex-row items-center gap-3 p-4">
                <Avatar><AvatarFallback>{person.name.charAt(0)}</AvatarFallback></Avatar>
                <div>
                  <CardTitle>{person.name}</CardTitle>
                  <CardDescription>{person.relation}</CardDescription>
                </div>
              </CardHeader>
            </Card>
          </div>
        </CollapsibleTrigger>
      </div>

      <CollapsibleContent>
        <div className="relative">
          {person.heirs.length > 0 && person.heirs.map((heir) => (
            <PersonNode key={heir.id} person={heir} />
          ))}
          {person.landRecords.length > 0 && person.landRecords.map((record) => (
            <SsdNode key={record.id} record={record} />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

// Main Mind Map View component
export function MindMapView({ projectName, familyHeads }: { projectName: string; familyHeads: Person[] }) {
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
        <CardDescription>A visual, interactive hierarchy of the project's ownership structure. Click on a person to expand or collapse their heirs and land records.</CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto p-4">
        <div className="inline-block min-w-full align-middle font-sans">
          {/* Project Root Node */}
          <div className="flex items-center gap-4">
            <Card className="w-96 shrink-0 bg-primary/10">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-3"><Building className="h-8 w-8 text-primary" />{projectName}</CardTitle>
              </CardHeader>
            </Card>
            <div className="w-8 border-t border-border"></div>
            <div className="flex items-center gap-2 text-muted-foreground"><Users className="h-5 w-5"/> Family Heads</div>
          </div>

          {/* Branch to Family Heads */}
          <div className="relative pl-[18px]">
            {/* Main vertical line */}
            <div className="absolute left-0 top-0 h-full w-px bg-border"></div>
            {familyHeads.map((person) => (
              <PersonNode key={person.id} person={person} isFamilyHead={true} />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
