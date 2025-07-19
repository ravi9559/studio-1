
'use client';

import {
  LandPlot,
  Settings,
  FolderKanban,
} from 'lucide-react';
import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export function AppSidebar() {
  const pathname = usePathname();
  const { contextualMenu } = useSidebar();

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <LandPlot className="h-6 w-6 text-primary" />
            </div>
            <span className="text-lg font-semibold text-primary group-data-[collapsible=icon]:hidden">TitleLine</span>
        </div>
      </SidebarHeader>
      <SidebarMenu className="flex-1">
        <SidebarMenuItem>
          <SidebarMenuButton asChild isActive={pathname === '/dashboard' || pathname.startsWith('/projects/')} tooltip="Projects">
            <Link href="/dashboard">
              <FolderKanban />
              <span>Projects</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton asChild isActive={pathname.startsWith('/settings')} tooltip="Settings">
            <Link href="/settings">
              <Settings />
              <span>Settings</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        {contextualMenu}
      </SidebarMenu>
      <SidebarFooter>
        <p className="text-xs text-muted-foreground p-2 group-data-[collapsible=icon]:hidden">
            A single-user application for land and lineage management.
        </p>
      </SidebarFooter>
    </Sidebar>
  );
}
