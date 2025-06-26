import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "../ui/button";
import { PlusCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";

const transactions = [
    { owner: 'Kandasamy Gounder (Self)', sourceName: 'Seller Govindasamy', mode: 'Purchase', year: 1980, doc: 'DOC-1980-A1' },
    { owner: 'Seller Govindasamy', sourceName: 'Seller Krishnan', mode: 'Purchase', year: 1965, doc: 'DOC-1965-B2' },
    { owner: 'Seller Krishnan', sourceName: 'Krishnan\'s Father', mode: 'Legal Heir', year: 1940, doc: 'N/A' },
];

export function TransactionHistory() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>Chronological record of land ownership.</CardDescription>
        </div>
        <Button>
            <PlusCircle className="mr-2 h-4 w-4"/>
            Add Record
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Present Owner</TableHead>
              <TableHead>Source Name</TableHead>
              <TableHead>Source Mode</TableHead>
              <TableHead>Year</TableHead>
              <TableHead>Doc Number</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((tx, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{tx.owner}</TableCell>
                <TableCell>{tx.sourceName}</TableCell>
                <TableCell>
                  <Badge variant={tx.mode === 'Purchase' ? 'default' : 'secondary'}>{tx.mode}</Badge>
                </TableCell>
                <TableCell>{tx.year}</TableCell>
                <TableCell>{tx.doc}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
