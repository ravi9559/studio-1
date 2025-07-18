
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AcquisitionCard } from './acquisition-card';
import { EditAcquisitionStatusDialog } from './edit-acquisition-status-dialog';
import type { AcquisitionStatus, User } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface AcquisitionTrackerViewProps {
  statuses: AcquisitionStatus[];
  onUpdateStatus: (updatedStatus: AcquisitionStatus) => void;
  activeStatusId?: string;
  onActiveStatusChange: (statusId: string) => void;
  currentUser: User | null;
}

export function AcquisitionTrackerView({ statuses, onUpdateStatus, activeStatusId, onActiveStatusChange, currentUser }: AcquisitionTrackerViewProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [statusToEdit, setStatusToEdit] = useState<AcquisitionStatus | null>(null);
  const { toast } = useToast();

  const selectedStatus = statuses.find(s => s.id === activeStatusId);
  
  // Effect to handle initial selection if none is provided
  useEffect(() => {
    if (!activeStatusId && statuses.length > 0) {
      onActiveStatusChange(statuses[0].id);
    }
  }, [activeStatusId, statuses, onActiveStatusChange]);


  const handleEditClick = (status: AcquisitionStatus) => {
    setStatusToEdit(status);
    setIsEditDialogOpen(true);
  };

  const handleSaveStatus = (updatedStatus: AcquisitionStatus) => {
    onUpdateStatus(updatedStatus);
    setIsEditDialogOpen(false);
    toast({
        title: "Status Updated",
        description: `Acquisition status for S.No. ${updatedStatus.surveyNumber} has been saved.`,
    });
  };

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
    <>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Acquisition Tracker</CardTitle>
            <CardDescription>
              Select a survey number to view its acquisition progress. Data is auto-filled from the Family Lineage tab.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select onValueChange={onActiveStatusChange} value={activeStatusId}>
              <SelectTrigger className="w-full md:w-1/3">
                <SelectValue placeholder="Select a Survey Number..." />
              </SelectTrigger>
              <SelectContent>
                {statuses.map(status => (
                  <SelectItem key={status.id} value={status.id}>
                    Survey No: {status.surveyNumber} ({status.familyHeadName})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
        
        {selectedStatus ? (
          <AcquisitionCard status={selectedStatus} onEdit={handleEditClick} currentUser={currentUser} />
        ) : (
          <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                  Please select a survey number to view its tracking details.
              </CardContent>
          </Card>
        )}
      </div>

      {statusToEdit && (
        <EditAcquisitionStatusDialog
          isOpen={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          status={statusToEdit}
          onSave={handleSaveStatus}
        />
      )}
    </>
  );
}
