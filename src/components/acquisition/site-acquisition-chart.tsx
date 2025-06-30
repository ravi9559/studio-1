
'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Papa from 'papaparse';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Upload, Download, Trash2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

// Types
type AcquisitionStatus = 'Empty' | 'Under Negotiation' | 'Sale Agreement' | 'Sale Advance' | 'POA' | 'Sale Deed Registered' | 'Pending';

const ALL_STATUSES: AcquisitionStatus[] = ['Sale Deed Registered', 'Sale Agreement', 'Sale Advance', 'Under Negotiation', 'POA', 'Pending', 'Empty'];

type PlotData = {
    surveyNumber: string;
    classification: string;
    owner: string;
    acquisitionStatus: AcquisitionStatus;
    extent: string;
    isEmpty: boolean;
};

type GridData = (PlotData | null)[][];

// Helper Functions
const statusClasses: Record<AcquisitionStatus, string> = {
    'Sale Deed Registered': 'bg-green-100 hover:bg-green-200 border-green-200 text-green-800 dark:bg-green-900/50 dark:text-green-300 dark:border-green-800 dark:hover:bg-green-800/60',
    'Sale Agreement': 'bg-yellow-100 hover:bg-yellow-200 border-yellow-200 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-800 dark:hover:bg-yellow-800/60',
    'Sale Advance': 'bg-orange-100 hover:bg-orange-200 border-orange-200 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300 dark:border-orange-800 dark:hover:bg-orange-800/60',
    'Under Negotiation': 'bg-blue-100 hover:bg-blue-200 border-blue-200 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-800 dark:hover:bg-blue-800/60',
    'POA': 'bg-purple-200 hover:bg-purple-300 border-purple-300 text-purple-800 dark:bg-purple-800/50 dark:text-purple-300 dark:border-purple-700 dark:hover:bg-purple-700/60',
    'Pending': 'bg-gray-200 hover:bg-gray-300 border-gray-300 text-gray-800 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700/80',
    'Empty': 'bg-lime-50 hover:bg-lime-100 border-lime-200 text-lime-800 dark:bg-lime-900/50 dark:text-lime-300 dark:border-lime-800 dark:hover:bg-lime-800/60',
};


const parseCell = (cell: string): PlotData | null => {
    if (!cell || typeof cell !== 'string' || !cell.trim()) return null;
    const parts = cell.split(' ').filter(part => part);
    if (parts.length === 0) return null;

    let surveyNumber = parts[0];
    let classification = parts[1] || 'N/A';
    let status: AcquisitionStatus = 'Pending';
    let owner = '';
    let extent = '';

    // The logic to find the status string is complex because it can contain spaces.
    // We prioritize longer matches (e.g., "Sale Deed Registered" over "Registered").
    let bestMatch = { status: 'Pending' as AcquisitionStatus, startIndex: -1, endIndex: -1 };
    const searchableParts = parts.slice(2).join(' ');

    for (const s of ALL_STATUSES) {
      if (s === 'Pending' || s === 'Empty') continue;
      const index = searchableParts.indexOf(s);
      if (index !== -1) {
          const statusParts = s.split(' ');
          // Logic to check if we found a better (longer) match
          if (statusParts.length > bestMatch.status.split(' ').length || bestMatch.startIndex === -1) {
              const preText = searchableParts.substring(0, index).trim();
              const ownerParts = preText.split(' ');
              bestMatch = { status: s, startIndex: 2 + ownerParts.length, endIndex: 2 + ownerParts.length + statusParts.length };
          }
      }
    }

    if (bestMatch.startIndex !== -1) {
        owner = parts.slice(2, bestMatch.startIndex).join(' ');
        status = bestMatch.status;
        extent = parts.slice(bestMatch.endIndex).join(' ');
    } else {
        // If no status is found, assume the rest of the string is owner and extent
        const potentialOwner: string[] = [];
        const potentialExtent: string[] = [];
        let foundNumber = false;
        for (let i = 2; i < parts.length; i++) {
            if (!isNaN(parseFloat(parts[i])) && !foundNumber) {
                foundNumber = true;
            }
            if (foundNumber) {
                potentialExtent.push(parts[i]);
            } else {
                potentialOwner.push(parts[i]);
            }
        }
        owner = potentialOwner.join(' ');
        extent = potentialExtent.join(' ');
    }
    
    owner = owner || 'N/A';
    extent = extent || 'N/A';
    
    const isEmpty = (surveyNumber === 'N/A' && owner === 'N/A') || cell.trim() === "N/A N/A N/A";

    return {
        surveyNumber,
        classification,
        owner,
        acquisitionStatus: isEmpty ? 'Empty' : status,
        extent,
        isEmpty: isEmpty || status === 'Empty'
    };
};


// Main Component
export function SiteAcquisitionChart({ projectId }: { projectId: string; }) {
    const [gridData, setGridData] = useState<GridData>([]);
    const [uploadTimestamp, setUploadTimestamp] = useState<Date | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentEditIndex, setCurrentEditIndex] = useState<{ rowIndex: number, colIndex: number } | null>(null);
    const [selectedStatus, setSelectedStatus] = useState<AcquisitionStatus | null>(null);
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();
    const storageKey = `acquisition-chart-data-${projectId}`;
    const timestampKey = `acquisition-chart-timestamp-${projectId}`;

    useEffect(() => {
        try {
            const savedData = localStorage.getItem(storageKey);
            const savedTimestamp = localStorage.getItem(timestampKey);
            if (savedData) {
                setGridData(JSON.parse(savedData));
            }
            if (savedTimestamp) {
                setUploadTimestamp(new Date(savedTimestamp));
            }
        } catch (e) {
            console.error("Failed to load chart data from local storage", e);
        }
    }, [projectId, storageKey, timestampKey]);

    const saveData = (data: GridData, timestamp: Date | null) => {
        try {
            localStorage.setItem(storageKey, JSON.stringify(data));
            if (timestamp) {
                 localStorage.setItem(timestampKey, timestamp.toISOString());
            } else {
                 localStorage.removeItem(timestampKey);
            }
        } catch(e) {
            console.error("Failed to save chart data to local storage", e);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not save data.'});
        }
    };
    
    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setError(null);
        if (!file.name.endsWith('.csv')) {
            setError("Please upload a valid .csv file.");
            return;
        }

        setIsLoading(true);
        Papa.parse(file, {
            complete: (results) => {
                if (!results.data || results.data.length === 0) {
                    setError("The CSV file is empty or could not be parsed.");
                    setIsLoading(false);
                    return;
                }
                const parsedGrid = (results.data as string[][]).map(row => row.map(cell => parseCell(cell)));
                setGridData(parsedGrid);
                const newTimestamp = new Date();
                setUploadTimestamp(newTimestamp);
                saveData(parsedGrid, newTimestamp);
                setIsLoading(false);
                toast({ title: "Success", description: "CSV data loaded successfully." });
                 if (fileInputRef.current) fileInputRef.current.value = '';
            },
            error: (err: any) => {
                setError(`Error parsing CSV: ${err.message}`);
                setIsLoading(false);
            }
        });
    };

    const handleExport = () => {
        if (gridData.length === 0) {
            toast({ variant: 'destructive', title: 'Error', description: 'No data to export.' });
            return;
        }
        
        const csvContent = gridData.map(row => 
            row.map(data => {
                if (!data || data.isEmpty) return '';
                // Quote the cell to handle commas in owner names etc.
                return `"${data.surveyNumber} ${data.classification} ${data.owner} ${data.acquisitionStatus} ${data.extent}"`;
            }).join(',')
        ).join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `land-data-${projectId}-${new Date().toISOString()}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleClearFile = () => {
        setGridData([]);
        setUploadTimestamp(null);
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        saveData([], null);
        toast({ title: "Data Cleared", description: "All chart data has been removed." });
    };

    const handleOpenModal = (rowIndex: number, colIndex: number) => {
        const data = gridData[rowIndex]?.[colIndex];
        if (!data) return;
        setCurrentEditIndex({ rowIndex, colIndex });
        setSelectedStatus(data.acquisitionStatus);
        setIsModalOpen(true);
    };

    const handleSaveStatus = () => {
        if (!currentEditIndex || !selectedStatus) return;
        const { rowIndex, colIndex } = currentEditIndex;

        const newData = JSON.parse(JSON.stringify(gridData));
        const plot = newData[rowIndex][colIndex];
        if (plot) {
            plot.acquisitionStatus = selectedStatus;
            plot.isEmpty = selectedStatus === 'Empty';
        }
        setGridData(newData);
        saveData(newData, uploadTimestamp);
        
        setIsModalOpen(false);
        setCurrentEditIndex(null);
        setSelectedStatus(null);
    };
    
    const summary = useMemo(() => {
        const counts = ALL_STATUSES.reduce((acc, status) => ({ ...acc, [status]: 0 }), {} as Record<AcquisitionStatus, number>);
        
        gridData.flat().forEach(data => {
            if (data) {
                counts[data.acquisitionStatus]++;
            }
        });
        return counts;
    }, [gridData]);

    const currentPlotData = currentEditIndex ? gridData[currentEditIndex.rowIndex][currentEditIndex.colIndex] : null;

    return (
        <div className="space-y-6">
             <Card className="bg-muted/30 shadow">
                <CardContent className="p-4 flex flex-wrap items-center gap-4">
                    <Button onClick={() => fileInputRef.current?.click()} disabled={isLoading}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                        Upload CSV
                    </Button>
                    <Input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".csv" className="hidden" />
                    <Button variant="outline" onClick={handleExport}><Download className="mr-2 h-4 w-4" /> Export to CSV</Button>
                    <Button variant="destructive" onClick={handleClearFile}><Trash2 className="mr-2 h-4 w-4" /> Clear File</Button>
                    {uploadTimestamp && <p className="text-sm text-muted-foreground ml-auto">Last Upload: {uploadTimestamp.toLocaleString()}</p>}
                </CardContent>
            </Card>

            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
                 {ALL_STATUSES.map(status => {
                     const count = summary[status];
                     const display = status === 'Empty' ? 'Empty' : `${status}: ${count}`;
                     return (
                        <div key={status} className="bg-card p-4 rounded-lg shadow flex items-center gap-2">
                             <div className={cn("h-5 w-5 rounded-sm border", statusClasses[status])} />
                             <span className="text-sm font-medium">{display}</span>
                        </div>
                    )
                 })}
            </div>

            <div className="bg-card rounded-lg shadow overflow-x-auto">
                {gridData.length > 0 ? (
                    <table className="w-full" style={{ borderCollapse: 'collapse' }}>
                        <tbody>
                            {gridData.map((row, rowIndex) => (
                                <tr key={rowIndex}>
                                    {row.map((plot, colIndex) => (
                                        <td 
                                            key={`${rowIndex}-${colIndex}`} 
                                            className={cn(
                                                "border border-slate-200 dark:border-slate-700 p-2 text-xs text-center transition-colors align-top",
                                                plot ? statusClasses[plot.acquisitionStatus] : 'bg-gray-50 dark:bg-gray-900/50',
                                                plot && 'cursor-pointer'
                                            )}
                                            onClick={plot ? () => handleOpenModal(rowIndex, colIndex) : undefined}
                                            style={{ height: '70px', minWidth: '160px' }}
                                        >
                                            {plot && !plot.isEmpty ? (
                                                <div className="flex flex-col h-full justify-start items-center leading-tight">
                                                    <span>{`${plot.surveyNumber} ${plot.classification} ${plot.owner}`}</span>
                                                    <span className="font-semibold text-green-700 dark:text-green-400 mt-1">{plot.extent}</span>
                                                </div>
                                            ) : ''}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="p-12 text-center text-muted-foreground">No data loaded. Please upload a CSV file to see the chart.</div>
                )}
            </div>

             {isModalOpen && currentPlotData && (
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Plot Details</DialogTitle>
                            <DialogDescription>
                                Survey Number: <span className="font-semibold">{currentPlotData.surveyNumber}</span>
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                            <Label htmlFor="status-select">Acquisition Status</Label>
                            <Select
                                value={selectedStatus ?? undefined}
                                onValueChange={(value: AcquisitionStatus) => setSelectedStatus(value)}
                            >
                                <SelectTrigger id="status-select"><SelectValue placeholder="Select a status..." /></SelectTrigger>
                                <SelectContent>
                                    {ALL_STATUSES.map(status => (
                                        <SelectItem key={status} value={status}>{status}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <DialogFooter>
                            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                             <Button onClick={handleSaveStatus}>Save</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}

            <footer className="mt-12">
                <div className="text-center p-6 bg-card rounded-lg shadow">
                    <strong className="text-lg block mb-2">Partner with Lakshmi Balaji O2O to accelerate your growth.</strong>
                    <p className="mb-4 text-muted-foreground">We offer mutually beneficial partnerships in Property Sourcing, Customer Sourcing, and Transaction Execution.</p>
                    <Button asChild>
                        <Link href="https://wa.me/919841098170?text=Hi,%20I%27m%20interested%20in%20your%20O2O%20services!" target="_blank">
                           Connect on WhatsApp
                        </Link>
                    </Button>
                </div>
            </footer>
        </div>
    );
}
