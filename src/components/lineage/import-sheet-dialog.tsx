
// src/components/lineage/import-sheet-dialog.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, FileInput, AlertCircle } from 'lucide-react';
import type { Person } from '@/types';
import { importFromSheet } from '@/ai/flows/import-from-sheet';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

interface ImportSheetDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onImportSuccess: (newOwners: Person[]) => void;
}

export function ImportSheetDialog({ isOpen, onOpenChange, onImportSuccess }: ImportSheetDialogProps) {
  const [sheetUrl, setSheetUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleImport = async () => {
    if (!sheetUrl.trim()) {
      setError('Please enter a valid Google Sheet URL.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await importFromSheet({ sheetUrl });
      if (result && result.familyHeads) {
        onImportSuccess(result.familyHeads);
        toast({
          title: 'Import Successful',
          description: `Successfully imported ${result.familyHeads.length} family trees.`,
        });
      } else {
        throw new Error('The import process returned no data.');
      }
    } catch (e: any) {
      console.error(e);
      setError(`Failed to import from sheet: ${e.message}. Please check the URL and the sheet format.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileInput /> Import Family Lineage from Google Sheet
          </DialogTitle>
          <DialogDescription>
            Paste the public URL of a Google Sheet (published as a CSV) to automatically build the family tree.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Instructions</AlertTitle>
            <AlertDescription>
              <ol className="list-decimal list-inside space-y-1 text-xs">
                <li>In Google Sheets, go to <strong>File &gt; Share &gt; Publish to web</strong>.</li>
                <li>Select the specific sheet, and choose <strong>Comma-separated values (.csv)</strong>.</li>
                <li>Click <strong>Publish</strong> and copy the generated URL.</li>
                <li>Your sheet must contain the following headers: <code className="font-mono bg-muted p-1 rounded">Name, Relation, Gender, Age, MaritalStatus, Status, SourceOfLand, HoldingPattern, ParentName, SurveyNumber, Acres, Cents, Classification</code></li>
              </ol>
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="sheet-url">Published Google Sheet URL</Label>
            <Input
              id="sheet-url"
              placeholder="https://docs.google.com/spreadsheets/d/e/.../pub?output=csv"
              value={sheetUrl}
              onChange={(e) => setSheetUrl(e.target.value)}
              disabled={isLoading}
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
          <Button onClick={handleImport} disabled={isLoading}>
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
