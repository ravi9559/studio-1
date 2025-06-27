
// src/components/lineage/import-sheet-dialog.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, FileUp, AlertCircle } from 'lucide-react';
import type { Person } from '@/types';
import { importFromSheet } from '@/ai/flows/import-from-sheet';
import { useToast } from '@/hooks/use-toast';

interface ImportSheetDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onImportSuccess: (newOwners: Person[]) => void;
}

export function ImportSheetDialog({ isOpen, onOpenChange, onImportSuccess }: ImportSheetDialogProps) {
  const [csvData, setCsvData] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setCsvData(null);
      setFileName('');
      return;
    }
    
    setFileName(file.name);
    setError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result;
      if (typeof text === 'string') {
        setCsvData(text);
      } else {
        setError("Could not read the file content.");
      }
    };
    reader.onerror = () => {
        setError("Error reading the file.");
    };
    reader.readAsText(file);
  };


  const handleImport = async () => {
    if (!csvData) {
      setError('Please select a CSV file to upload.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await importFromSheet({ csvData });
      if (result && result.familyHeads) {
        onImportSuccess(result.familyHeads);
        toast({
          title: 'Import Successful',
          description: `Successfully imported ${result.familyHeads.length} family trees.`,
        });
        // Reset state and close dialog on success
        setCsvData(null);
        setFileName('');
        onOpenChange(false);
      } else {
        throw new Error('The import process returned no data.');
      }
    } catch (e: any) {
      console.error(e);
      setError(`Failed to import from sheet: ${e.message}. Please check the file format.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
        if (!open) {
            // Reset state on close
            setCsvData(null);
            setFileName('');
            setError(null);
        }
        onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileUp /> Import Family Lineage from CSV
          </DialogTitle>
          <DialogDescription>
            Upload a CSV file to automatically build the family tree.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Instructions</AlertTitle>
            <AlertDescription>
              <p className="text-xs">
              Your CSV file must contain the following headers: <code className="font-mono bg-muted p-1 rounded">Name, Relation, Gender, Age, MaritalStatus, Status, SourceOfLand, HoldingPattern, ParentName, SurveyNumber, Acres, Cents, Classification</code>
              </p>
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="csv-file">CSV File</Label>
            <Input
              id="csv-file"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              disabled={isLoading}
              className="pt-2 text-sm"
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertTitle>Import Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={isLoading || !csvData}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Importing...
              </>
            ) : (
              'Start Import'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
