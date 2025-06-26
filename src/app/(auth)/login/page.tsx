import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LandPlot } from "lucide-react";
import NextLink from 'next/link';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
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
              <Input id="email" type="email" placeholder="user@o2o.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button asChild className="w-full">
                <NextLink href="/dashboard">Login</NextLink>
            </Button>
            <p className="text-xs text-muted-foreground">
              Contact admin for access.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
