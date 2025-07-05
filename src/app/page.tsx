
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const loggedInUser = localStorage.getItem('loggedInUser');
    if (loggedInUser) {
      router.replace('/dashboard');
    } else {
      router.replace('/login');
    }
  }, [router]);

  // Render a loader while redirecting
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  );
}
