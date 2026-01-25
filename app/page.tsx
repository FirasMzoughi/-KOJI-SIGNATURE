'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useEffect } from 'react';
import { QuoteDetailView } from '@/components/features/QuoteDetailView';


function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const quoteId = searchParams?.get('quoteId');
  const email = searchParams?.get('email') || undefined;

  // If quoteId exists, render the Quote Detail View DIRECTLY
  if (quoteId) {
    return <QuoteDetailView id={quoteId} email={email} />;
    
  }

  // If no quoteId, redirect to Client Dashboard
  useEffect(() => {
    router.replace('');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="animate-pulse flex flex-col items-center gap-4">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <p className="text-sm text-muted-foreground font-medium">Chargement Koji...</p>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div />}>
      <HomeContent />
    </Suspense>
  );
}
