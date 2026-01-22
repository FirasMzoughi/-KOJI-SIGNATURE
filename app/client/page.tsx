'use client';

import { useClientStore } from '@/store/clientStore';
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
      <div>
        <h1 className="text-3xl font-serif font-bold">Bon retour, {user?.name.split(' ')[0]}</h1>
        <p className="text-muted-foreground mt-1">Voici ce qui se passe avec vos projets.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Devis Actifs</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeQuotesCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projets en Cours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Devis Récents</h2>
          <Link href="/client/quotes">
            <Button variant="ghost" size="sm">Voir tout <ArrowRight className="ml-2 h-4 w-4" /></Button>
          </Link>
        </div>
        <div className="grid gap-4">
          {recentQuotes.map((quote) => (
            <Card key={quote.id} className="flex flex-col md:flex-row items-center justify-between p-4 gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm text-muted-foreground">{quote.id}</span>
                  <h3 className="font-semibold">{quote.projectTitle}</h3>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Émis le : {formatDate(quote.issuedDate)} • Valide jusqu'au : {formatDate(quote.validUntil)}
                </p>
              </div>
              <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                <div className="text-right">
                  <p className="font-bold">{formatCurrency(quote.total)}</p>
                </div>
                <Badge variant={quote.status === 'Accepted' ? 'success' : quote.status === 'Rejected' ? 'destructive' : 'default'}>
                  {quote.status}
                </Badge>
                <Link href={`/client/quotes/${quote.id}`}>
                  <Button variant="outline" size="sm">Voir</Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
