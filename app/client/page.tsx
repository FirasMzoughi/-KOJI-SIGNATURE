'use client';

import { useClientStore } from '@/store/clientStore';

export const dynamic = 'force-dynamic';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { FileText, ArrowRight, Clock } from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils'; // Assuming formatCurrency is added

export default function ClientDashboard() {
  const { user, quotes } = useClientStore();
  const recentQuotes = quotes.slice(0, 3);
  const activeQuotesCount = quotes.filter(q => q.status === 'Sent' || q.status === 'Draft').length;

  return (
    <div className="space-y-8">
      

    

      <div className="space-y-4">
      
        <div className="grid gap-4">
        
        </div>
      </div>
    </div>
  );
}
