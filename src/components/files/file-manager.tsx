import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UploadCloud, FileText, Download, Trash2, HardDrive } from "lucide-react";

const files = [
    { name: 'Sale_Deed_1980.pdf', type: 'PDF', size: '2.3 MB', uploaded: '2023-05-10' },
    { name: 'Patta_Copy.jpeg', type: 'Image', size: '800 KB', uploaded: '2023-05-11' },
    { name: 'EC_1980-2023.pdf', type: 'PDF', size: '5.1 MB', uploaded: '2023-06-01' },
];

export function FileManager() {
    return (
        <Card>
            <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <CardTitle>Files &amp; Documents</CardTitle>
                    <CardDescription>Manage all related documents from Google Drive.</CardDescription>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <Button variant="outline" className="flex-1 md:flex-initial"><HardDrive className="mr-2 h-4 w-4" /> Connect Google Drive</Button>
                    <Button className="flex-1 md:flex-initial"><UploadCloud className="mr-2 h-4 w-4" /> Upload File</Button>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>File Name</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Size</TableHead>
                            <TableHead>Date Uploaded</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {files.map((file, index) => (
                            <TableRow key={index}>
                                <TableCell className="font-medium flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                    {file.name}
                                </TableCell>
                                <TableCell>{file.type}</TableCell>
                                <TableCell>{file.size}</TableCell>
                                <TableCell>{file.uploaded}</TableCell>
                                <TableCell className="text-right space-x-2">
                                    <Button variant="ghost" size="icon"><Download className="h-4 w-4" /></Button>
                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
