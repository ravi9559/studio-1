
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

    useEffect(() => {
        setFormData(status);
    }, [status, isOpen]);

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
            <DialogContent className="sm:max-w-md">
                 <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Edit Acquisition Status for S.No: {status.surveyNumber}</DialogTitle>
                        <DialogDescription>
                           Update the status for the acquisition process. Click save when you're done.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4 space-y-6 max-h-[70vh] overflow-y-auto pr-2">
                        {/* Legal Section */}
                        <div className="space-y-4">
                             <h4 className="font-semibold text-lg">Legal Status</h4>
                             <div className="grid grid-cols-1 gap-4">
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
