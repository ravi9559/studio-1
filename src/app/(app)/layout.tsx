
'use client';

import { AppSidebar } from "@/components/layout/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import React from 'react';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="flex flex-col min-h-screen">
          <main className="flex-grow">
            {children}
          </main>
          <footer className="text-center p-4 text-xs text-muted-foreground border-t">
            <p>
              <span className="font-bold">O2O</span> | Simplifying Real Estate Transactions. All rights reserved.
            </p>
          </footer>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
