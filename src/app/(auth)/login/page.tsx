'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LandPlot } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type User = {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: string;
  status: 'Active' | 'Inactive';
  avatarUrl?: string;
};

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    try {
        const savedUsers = localStorage.getItem('users');
        if (savedUsers) {
            const users: User[] = JSON.parse(savedUsers);
            const user = users.find(u => u.email === email && u.password === password);

            if (user) {
                if (user.status === 'Active') {
                    // Successful login
                    router.push('/dashboard');
                } else {
                    toast({
                        variant: "destructive",
                        title: "Login Failed",
                        description: "Your account is inactive. Please contact an administrator.",
                    });
                }
            } else {
                // Failed login
                toast({
                    variant: "destructive",
                    title: "Login Failed",
                    description: "Invalid user ID or password.",
                });
            }
        } else {
             toast({
                variant: "destructive",
                title: "Login Failed",
                description: "No user accounts found. Please set up users first.",
            });
        }
    } catch (error) {
        toast({
            variant: "destructive",
            title: "An Error Occurred",
            description: "Could not attempt login. Please try again.",
        });
        console.error("Login error:", error);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <form onSubmit={handleLogin}>
            <Card className="shadow-2xl">
            <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <LandPlot className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-3xl font-bold text-primary">LineageLens</CardTitle>
                <CardDescription className="text-muted-foreground pt-2">
                Manage Land, Lineage, and Transaction History with Precision
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                <Label htmlFor="email">User ID</Label>
                <Input id="email" type="email" placeholder="user@o2o.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)}/>
                </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
                <Button type="submit" className="w-full">
                    Login
                </Button>
                <p className="text-xs text-muted-foreground">
                Contact admin for access.
                </p>
            </CardFooter>
            </Card>
        </form>
      </div>
    </div>
  );
}
