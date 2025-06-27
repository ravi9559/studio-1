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
import { useState, useEffect } from 'react';

type User = {
  id: string;
  name: string;
  email: string;
  role: 'Super Admin' | 'Transaction Manager' | 'Viewer';
  status: 'Active' | 'Inactive';
  avatarUrl?: string;
};

export function AppSidebar() {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const loadUser = () => {
        try {
            const savedUsers = localStorage.getItem('users');
            if (savedUsers) {
                const users: User[] = JSON.parse(savedUsers);
                if (users.length > 0) {
                    setCurrentUser(users[0]); // Assume first user is the logged-in user
                }
            }
        } catch (e) {
            console.error("Could not load user for sidebar", e);
        }
    };
    
    loadUser();

    // Listen for changes from other tabs
    const handleStorageChange = (e: StorageEvent) => {
        if (e.key === 'users') {
            loadUser();
        }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
        window.removeEventListener('storage', handleStorageChange);
    };
  }, []);


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
                <AvatarImage src={currentUser?.avatarUrl} alt="User Avatar" data-ai-hint="profile person" />
                <AvatarFallback>{currentUser?.name.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                <span className="text-sm font-semibold">{currentUser?.name || 'User'}</span>
                <span className="text-xs text-muted-foreground">{currentUser?.role || 'Role'}</span>
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
