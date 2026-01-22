'use client';

import Link from 'next/link';
import { useClientStore } from '@/store/clientStore';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatDate, formatCurrency } from '@/lib/utils';
import { FileText, ArrowUpRight } from 'lucide-react';

export default function QuotesPage() {
  const { quotes } = useClientStore();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold">Devis</h1>
          <p className="text-muted-foreground">Gérez vos estimations de projets et factures.</p>
        </div>
      </div>

      <div className="rounded-md border bg-card">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm text-left">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">ID</th>
                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Projet</th>
                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Date d'émission</th>
                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Montant</th>
                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Statut</th>
                <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {quotes.map((quote) => (
                <tr key={quote.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <td className="p-4 align-middle font-mono">{quote.id}</td>
                  <td className="p-4 align-middle font-medium">{quote.projectTitle}</td>
                  <td className="p-4 align-middle">{formatDate(quote.issuedDate)}</td>
                  <td className="p-4 align-middle font-bold">{formatCurrency(quote.total)}</td>
                  <td className="p-4 align-middle">
                    <Badge variant={quote.status === 'Accepted' ? 'success' : quote.status === 'Rejected' ? 'destructive' : 'secondary'}>
                      {quote.status}
                    </Badge>
                  </td>
                  <td className="p-4 align-middle text-right">
                    <Link href={`/client/quotes/${quote.id}`}>
                      <Button variant="ghost" size="sm">
                        Détails <ArrowUpRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
