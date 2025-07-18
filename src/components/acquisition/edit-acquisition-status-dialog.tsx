
'use client';

import { useState, useEffect } from 'react';
import type { AcquisitionStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Separator } from '../ui/separator';

interface EditAcquisitionStatusDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    status: AcquisitionStatus;
    onSave: (updatedStatus: AcquisitionStatus) => void;
}

export function EditAcquisitionStatusDialog({ isOpen, onOpenChange, status, onSave }: EditAcquisitionStatusDialogProps) {
    const [formData, setFormData] = useState(status);
    const [calendarOpen, setCalendarOpen] = useState(false);

    useEffect(() => {
        setFormData(status);
    }, [status, isOpen]);

    const handleOperationsChange = (field: 'documentCollection', value: string) => {
         setFormData(prev => ({
            ...prev,
            operations: { ...prev.operations, [field]: value },
        }));
    };

    const handleDateSelect = (date: Date | undefined) => {
        setFormData(prev => ({
            ...prev,
            operations: { ...prev.operations, meetingDate: date ? date.toISOString() : null },
        }));
        setCalendarOpen(false);
    };

    const handleLegalChange = (field: 'overallStatus', value: string) => {
        setFormData(prev => ({
            ...prev,
            legal: { ...prev.legal, [field]: value },
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl">
                 <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Edit Acquisition Status for S.No: {status.surveyNumber}</DialogTitle>
                        <DialogDescription>
                           Update the status for each stage of the acquisition process. Click save when you're done.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4 space-y-6 max-h-[70vh] overflow-y-auto pr-2">
                        
                        {/* Operations Section */}
                        <div className="space-y-4">
                             <h4 className="font-semibold text-lg">Operational Information</h4>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>In-person Meeting Date</Label>
                                    <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full justify-start text-left font-normal",
                                                    !formData.operations.meetingDate && "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {formData.operations.meetingDate ? format(new Date(formData.operations.meetingDate), "PPP") : <span>Pick a date</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={formData.operations.meetingDate ? new Date(formData.operations.meetingDate) : undefined}
                                                onSelect={handleDateSelect}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <div className="space-y-2">
                                    <Label>Document Collection Status</Label>
                                     <Select 
                                        value={formData.operations.documentCollection}
                                        onValueChange={(value) => handleOperationsChange('documentCollection', value)}
                                    >
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Pending">Pending</SelectItem>
                                            <SelectItem value="Partially Collected">Partially Collected</SelectItem>
                                            <SelectItem value="Fully Collected">Fully Collected</SelectItem>
                                        </SelectContent>
                                    </Select>
                                 </div>
                             </div>
                        </div>
                        
                        <Separator />

                        {/* Legal Section */}
                        <div className="space-y-4">
                             <h4 className="font-semibold text-lg">Legal Status</h4>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                 <div className="space-y-2">
                                    <Label>Overall Legal Status</Label>
                                    <Select 
                                        value={formData.legal.overallStatus}
                                        onValueChange={(value) => handleLegalChange('overallStatus', value)}
                                    >
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Not Started">Not Started</SelectItem>
                                            <SelectItem value="On-Progress">On-Progress</SelectItem>
                                            <SelectItem value="Awaiting">Awaiting</SelectItem>
                                            <SelectItem value="Cleared">Cleared</SelectItem>
                                        </SelectContent>
                                    </Select>
                                 </div>
                             </div>
                             <p className="text-xs text-muted-foreground">Note: Detailed legal queries are managed within the Acquisition Card itself.</p>
                        </div>

                    </div>
                    <DialogFooter className="pt-4 border-t">
                        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button type="submit">Save Changes</Button>
                    </DialogFooter>
                 </form>
            </DialogContent>
        </Dialog>
    );
}
