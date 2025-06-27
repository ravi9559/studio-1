'use client';

import {
  LandPlot,
  Users,
  Settings,
  FolderKanban,
  LogOut,
} from 'lucide-react';
import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <LandPlot className="h-6 w-6 text-primary" />
            </div>
            <span className="text-lg font-semibold text-primary group-data-[collapsible=icon]:hidden">LineageLens</span>
        </div>
      </SidebarHeader>
      <SidebarMenu className="flex-1">
        <SidebarMenuItem>
          <SidebarMenuButton asChild isActive={pathname === '/dashboard' || pathname.startsWith('/projects')} tooltip="Projects">
            <Link href="/dashboard">
              <FolderKanban />
              <span>Projects</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton asChild isActive={pathname.startsWith('/users')} tooltip="User Management">
            <Link href="/users">
              <Users />
              <span>User Management</span>
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
      </SidebarMenu>
      <SidebarFooter>
         <div className="flex items-center gap-3 p-2 transition-all duration-200 group-data-[collapsible=icon]:w-12 group-data-[collapsible=icon]:justify-center">
            <Avatar className="flex-shrink-0">
                <AvatarImage src="https://placehold.co/40x40" alt="User Avatar" data-ai-hint="profile person" />
                <AvatarFallback>TM</AvatarFallback>
            </Avatar>
            <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                <span className="text-sm font-semibold">Transaction Manager</span>
                <span className="text-xs text-muted-foreground">Super Admin</span>
            </div>
        </div>
        <Separator className="my-1"/>
        <Button variant="ghost" asChild className="w-full justify-start p-2">
            <Link href="/login">
              <LogOut className="h-4 w-4 shrink-0" />
              <span className="group-data-[collapsible=icon]:hidden ml-2">Logout</span>
            </Link>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
