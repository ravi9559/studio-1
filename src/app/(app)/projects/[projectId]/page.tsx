import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineageView } from "@/components/lineage/lineage-view";
import { TransactionHistory } from "@/components/transactions/transaction-history";
import { FileManager } from "@/components/files/file-manager";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// Mock data for the project
const projectDetails = {
    id: 'proj-1',
    name: 'Greenfield Valley',
    siteId: 'GV-001',
    location: 'Coimbatore'
};

export default function ProjectDetailsPage({ params }: { params: { projectId: string } }) {
  // In a real app, you would fetch project details based on params.projectId
  const project = projectDetails;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
        <header className="mb-6">
            <Button variant="ghost" asChild className="mb-4 -ml-4">
                <Link href="/dashboard">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Dashboard
                </Link>
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
            <p className="text-muted-foreground">{project.siteId} - {project.location}</p>
        </header>
        <Tabs defaultValue="lineage" className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:w-auto md:inline-flex">
          <TabsTrigger value="lineage">Family Lineage</TabsTrigger>
          <TabsTrigger value="transactions">Transaction History</TabsTrigger>
          <TabsTrigger value="files">Files &amp; Documents</TabsTrigger>
        </TabsList>
        <TabsContent value="lineage" className="mt-6">
          <LineageView />
        </TabsContent>
        <TabsContent value="transactions" className="mt-6">
          <TransactionHistory />
        </TabsContent>
        <TabsContent value="files" className="mt-6">
          <FileManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
