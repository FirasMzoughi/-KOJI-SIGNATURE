'use client';

import { useClientStore } from '@/store/clientStore';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { SignatureModal } from '@/components/features/SignatureModal';
import { useState, useEffect, useRef } from 'react';
import { formatDate, formatCurrency } from '@/lib/utils';
import { Download, CheckCircle, Printer, FileText, Share2, Eye, Clock, Paperclip, X, File as FileIcon, Send, MapPin } from 'lucide-react';
import Image from 'next/image';
import { Textarea } from '@/components/ui/Textarea';
import type { QuoteLineItem } from '@/types';

interface QuoteDetailViewProps {
  id: string;
  email?: string;
}

// Brand palette (matches the mobile devis screen).
const NAVY = '#0F172A';
const GOLD = '#A18B73';

// Trade/lot accent colours, mirroring the mobile app's _familleColor().
function familleColor(famille: string): string {
  switch (famille.toLowerCase()) {
    case 'carrelage': return '#B45309';
    case 'peinture': return '#7C3AED';
    case 'plomberie': return '#0369A1';
    case 'electricité':
    case 'electricite': return '#D97706';
    case 'menuiserie': return '#166534';
    case 'démolition':
    case 'demolition': return '#B91C1C';
    default: return '#475569';
  }
}

// French label for the canonical room ids, like the mobile _getRoomLabel().
function roomLabel(id: string): string {
  switch (id) {
    case 'salon': return 'Salon';
    case 'cuisine': return 'Cuisine';
    case 'chambre': return 'Chambre';
    case 'salle_de_bain': return 'Salle de bain';
    case 'bureau': return 'Bureau';
    case 'exterieur': return 'Extérieur';
    default:
      if (!id) return 'Pièce';
      return id.charAt(0).toUpperCase() + id.slice(1);
  }
}

// French number, e.g. 1234.5 -> "1 234,50".
function fmtNum(v: number): string {
  return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);
}

// Reproduce the mobile line breakdown ("MO : …", "Fnt : …", or "Forfait : …").
function lineBreakdown(item: QuoteLineItem): string[] {
  const parts: string[] = [];
  if (item.forfait) {
    parts.push(`Forfait : ${fmtNum(item.unitPrice)} €`);
    return parts;
  }
  const mo = (item.moUnitPrice ?? 0) * (item.quantity ?? 0);
  const fnt = (item.fournituresUnitPrice ?? 0) * (item.quantity ?? 0);
  if ((item.hours ?? 0) > 0 && (item.effectiveRate ?? 0) > 0) {
    parts.push(`MO : ${fmtNum(item.quantity)} × ${fmtNum(item.hours!)} h × ${fmtNum(item.effectiveRate!)} € = ${fmtNum(mo)} €`);
  } else if (mo > 0) {
    parts.push(`MO : ${fmtNum(mo)} €`);
  }
  if (fnt > 0) {
    parts.push(`Fnt : ${fmtNum(item.quantity)} × ${fmtNum(item.fournituresUnitPrice!)} € = ${fmtNum(fnt)} €`);
  }
  return parts;
}

// `email` (the address baked into the link by koji-main) is used only to
// pre-fill the login field — the devis still opens strictly on the logged-in
// account's email, never on the URL value.
export function QuoteDetailView({ id }: QuoteDetailViewProps) {
  const { quotes, updateQuoteStatus, updateQuoteStartDate, addQuoteMessage, fetchQuote, isLoading, error } = useClientStore();
  const authReady = useClientStore((s) => s.authReady);
  const router = useRouter();

  const quote = quotes.find((q) => q.id === id);

  // Local state for new comment
  const [newComment, setNewComment] = useState('');
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // A /?quoteId=<id> visit is ALWAYS authorized by the unguessable quote id —
  // the visitor reached it from the link / Identifiant + Mot de passe gate, not
  // as a dashboard account. So we open the devis by id alone and IGNORE any
  // stale Supabase session that may be left over in the browser (which would
  // otherwise wrongly trigger the "ce devis n'est pas accessible avec ce
  // compte" email gate). Runs once per id.
  const [idOnlyTried, setIdOnlyTried] = useState(false);
  useEffect(() => {
    if (!id || idOnlyTried) return;
    setIdOnlyTried(true);
    fetchQuote(id); // id-only: no email match required
  }, [id, idOnlyTried, fetchQuote]);

  const handleSign = async (signatureData: string) => {
    if (!quote) return;
    await updateQuoteStatus(quote.id, 'Accepted', signatureData);
    setIsSignModalOpen(false);
  };

  const handleReject = async () => {
    if (!quote) return;
    if (confirm('Êtes-vous sûr de vouloir refuser ce devis ?')) {
      await updateQuoteStatus(quote.id, 'Rejected');
    }
  };

  const handleStartDateChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!quote) return;
    await updateQuoteStartDate(quote.id, e.target.value);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const validFiles = files.filter(file => {
        if (file.size > 10 * 1024 * 1024) {
          alert(`Fichier trop volumineux: ${file.name} (Max 10MB)`);
          return false;
        }
        return true;
      });

      if (pendingFiles.length + validFiles.length > 10) {
        alert("Maximum 10 fichiers par message.");
        return;
      }

      setPendingFiles(prev => [...prev, ...validFiles]);
      // Reset input manually
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    setPendingFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitComment = async () => {
    if ((!newComment.trim() && pendingFiles.length === 0) || isSending || !quote) return;

    setIsSending(true);
    try {
      await addQuoteMessage(quote.id, newComment, pendingFiles);
      setNewComment('');
      setPendingFiles([]);
    } catch (error) {
      alert("Erreur lors de l'envoi du message.");
    } finally {
      setIsSending(false);
    }
  };
  // Keep the loader until the id-only access attempt has actually resolved, so
  // the login gate never flashes for a /?quoteId= visitor. (The id fetch always
  // runs for a quote link — see the effect above.)
  const idOnlyPending = id != null && (!idOnlyTried || isLoading);
  if (isLoading || !authReady || idOnlyPending) {
    return <div className="p-8 flex justify-center items-center h-screen text-primary">Chargement du devis...</div>;
  }

  // A quote present in the store + no error means the (id-authorized) fetch
  // succeeded — open it. No email match required: the unguessable id + the
  // Identifiant/Mot de passe the visitor already entered ARE the authorization.
  const loadedById = quote != null && !error;

  // Only fall through to the login gate when the devis genuinely could not be
  // loaded by id (bad/expired link or missing RPC). A stale account session is
  // irrelevant here — we never block a valid quote link on it.
  if (!loadedById) {
    // The devis could not be opened from this link (bad/expired id, or the
    // backend RPC isn't updated yet). Point the visitor at the per-chantier
    // Identifiant + Mot de passe login rather than an email form.
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md p-8 border-none shadow-sm bg-white space-y-5">
          <div className="text-center space-y-3">
            <div className="h-14 w-14 rounded-2xl bg-[#0E172C] flex items-center justify-center mx-auto overflow-hidden">
              <img src="/koji-mark.svg" alt="Koji" className="w-full h-full object-contain p-2.5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Devis introuvable</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Ce lien ne permet pas d&apos;ouvrir le devis. Connectez-vous avec
                l&apos;identifiant et le mot de passe reçus par message.
              </p>
            </div>
          </div>
          <Button
            type="button"
            onClick={() => router.push('/auth/login')}
            className="w-full h-12 bg-primary hover:bg-primary/90"
          >
            Se connecter avec mon identifiant
          </Button>
        </Card>
      </div>
    );
  }

  const handleDownload = async () => {
    const element = document.getElementById('quote-document');
    if (!element) {
      alert("Erreur: Document non trouvé.");
      return;
    }

    try {
      // Dynamic import to avoid SSR issues
      // @ts-ignore
      const module = await import('html2pdf.js');
      const html2pdf = module.default || module;

      const opt: any = {
        margin: [10, 10],
        filename: `Devis-${quote.id}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      // html2pdf is a function that returns a worker
      await html2pdf().set(opt).from(element).save();
    } catch (error: any) {
      console.error("PDF generation failed", error);
      alert(`Erreur PDF: ${error?.message || 'Inconnue'}. L'impression s'ouvre.`);
      window.print();
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Devis ${quote.id}`,
          text: `Voici le devis pour votre projet ${quote.projectTitle}`,
          url: window.location.href,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback
      navigator.clipboard.writeText(window.location.href);
      alert("Lien copié dans le presse-papier !");
    }
  };

  // derived state
  const isAccepted = quote.status === 'Accepted' || quote.status === 'accepte';
  const isRejected = quote.status === 'Rejected' || quote.status === 'refuse';
  const canAct = !isAccepted && !isRejected;

  // Entreprise (company) header — real values from the devis, falling back to
  // the Koji defaults when a field is missing (e.g. older devis with no logo).
  const company = quote.company ?? {};
  const companyName = (company.name && company.name.trim()) || 'Koji';
  const companyEmailDisplay =
    (company.email && company.email.trim()) || 'contact@koji.com';
  const companyLogo = (company.logo && company.logo.trim()) || '';

  // Real totals come straight from the generator. We display them as-is instead
  // of recomputing TVA from a single field (which previously double-taxed).
  const totalHT = quote.totalHT ?? quote.total ?? 0;
  const totalTTC = quote.totalTTC ?? quote.total ?? 0;
  const tvaRate = quote.tvaRate ?? 20;
  const tvaAmount = totalTTC - totalHT;

  // Mirror the mobile devis layout: group line items by room, then by famille
  // (lot) inside each room, computing the room subtotal as we go.
  const rooms = quote.items.reduce<
    Record<string, { lines: typeof quote.items; total: number }>
  >((acc, item) => {
    const key = item.room || 'Pièce';
    (acc[key] ||= { lines: [], total: 0 });
    acc[key].lines.push(item);
    acc[key].total += (item.quantity || 0) * (item.unitPrice || 0);
    return acc;
  }, {});

  const roomEntries = Object.entries(rooms).map(([name, { lines, total }]) => {
    const byFamille = lines.reduce<Record<string, typeof quote.items>>((acc, line) => {
      const fam = line.famille && line.famille.trim() ? line.famille : 'Général';
      (acc[fam] ||= []).push(line);
      return acc;
    }, {});
    return { name, total, byFamille };
  });

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* --- Top Header Card (Mobile Style) --- */}
        <Card className="p-6 border-none shadow-sm bg-white overflow-hidden relative">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none uppercase tracking-wider text-xs font-bold px-2 py-1">
                  {isAccepted ? 'Accepté' : isRejected ? 'Refusé' : 'En attente'}
                </Badge>
                <span className="text-xs font-bold text-accent tracking-wider uppercase">DEVIS #{quote.id.substring(0, 8)}</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-primary">
                {isAccepted ? 'Devis Accepté' : isRejected ? 'Devis Refusé' : 'Devis prêt'}
              </h1>
              <p className="text-muted-foreground mt-1 text-sm">
                Valable jusqu'au {formatDate(quote.validUntil)}
              </p>
            </div>

            {/* Progress Indicator */}
            <div className="flex flex-col items-end">
              <span className="text-xs font-bold text-accent uppercase tracking-wider mb-2">Étape 5/5</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-1.5 w-6 rounded-full bg-primary/20" />)}
                <div className="h-1.5 w-6 rounded-full bg-primary" />
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* --- LEFT COLUMN (Document) --- */}
          <div className="md:col-span-2 space-y-6">

            {/* Quote Document Card — mirrors the mobile devis layout */}
            <Card className="relative p-6 md:p-8 bg-white border-none space-y-6 overflow-hidden" id="quote-document">
              {/* Koji logo watermark in the background */}
              <div className="koji-watermark pointer-events-none absolute inset-0 flex items-center justify-center select-none">
                <img src="/koji-mark.svg" alt="" aria-hidden className="w-2/3 max-w-[420px] opacity-[0.05]" />
              </div>

              {/* Everything sits above the watermark */}
              <div className="relative z-10 space-y-6">
                {/* Header Row: brand + DEVIS N° */}
                <div className="flex justify-between items-start gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-lg overflow-hidden flex items-center justify-center" style={{ backgroundColor: companyLogo ? '#FFFFFF' : NAVY }}>
                      {companyLogo ? (
                        <img src={companyLogo} alt={companyName} className="h-full w-full object-cover" />
                      ) : (
                        <img src="/koji-mark.svg" alt={companyName} className="h-7 w-7" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-base" style={{ color: NAVY }}>{companyName}</h3>
                      <p className="text-[11px] text-muted-foreground">{companyEmailDisplay}</p>
                      {company.phone && company.phone.trim() && (
                        <p className="text-[11px] text-muted-foreground">{company.phone}</p>
                      )}
                    </div>
                  </div>
                  <div className="rounded-lg px-3 py-1.5 text-center" style={{ backgroundColor: '#F3E5D8' }}>
                    <p className="text-[8px] font-bold tracking-wide" style={{ color: GOLD }}>DEVIS N°</p>
                    <p className="text-[11px] font-bold" style={{ color: NAVY }}>{quote.id.substring(0, 8).toUpperCase()}</p>
                  </div>
                </div>

                <div className="h-px bg-[#F3F4F6]" />

                {/* Client / Date / Validité */}
                <div className="flex justify-between gap-4">
                  <div>
                    <p className="text-[9px] font-bold tracking-wide" style={{ color: GOLD }}>CLIENT</p>
                    <p className="font-bold text-sm" style={{ color: NAVY }}>{quote.clientName}</p>
                    {quote.clientEmail && <p className="text-[11px] text-muted-foreground">{quote.clientEmail}</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-bold tracking-wide" style={{ color: GOLD }}>DATE</p>
                    <p className="text-xs font-semibold" style={{ color: NAVY }}>{formatDate(quote.issuedDate)}</p>
                    <p className="text-[9px] font-bold tracking-wide mt-1" style={{ color: GOLD }}>VALIDITÉ</p>
                    <p className="text-xs" style={{ color: NAVY }}>{quote.validUntil && quote.validUntil !== 'N/A' ? quote.validUntil : '—'}</p>
                  </div>
                </div>

                {/* Travaux — site address */}
                {quote.projectTitle && (
                  <div className="rounded-lg p-3 flex items-center gap-2" style={{ backgroundColor: '#FFFBF6', border: '1px solid #F3E5D8' }}>
                    <MapPin className="h-4 w-4 shrink-0" style={{ color: GOLD }} />
                    <p className="text-xs font-semibold" style={{ color: NAVY }}>
                      Lieu d&apos;exécution : {quote.projectTitle}
                    </p>
                  </div>
                )}

                {/* Room sections (room → famille → lines), like the mobile devis */}
                <div className="space-y-5">
                  {roomEntries.map((room) => (
                    <div key={room.name} className="rounded-2xl overflow-hidden border border-[#E2E8F0]">
                      {/* Room header bar */}
                      <div className="flex items-center justify-between px-4 py-3" style={{ backgroundColor: NAVY }}>
                        <span className="font-bold text-sm text-white">{roomLabel(room.name)}</span>
                        <span className="font-bold text-sm" style={{ color: '#EAD8B1' }}>{fmtNum(room.total)} €</span>
                      </div>

                      {Object.entries(room.byFamille).map(([fam, lines]) => {
                        const color = familleColor(fam);
                        return (
                          <div key={fam}>
                            {/* LOT label */}
                            <div className="flex items-center gap-2 px-4 py-2" style={{ backgroundColor: `${color}14` }}>
                              <span className="inline-block w-[3px] h-3.5" style={{ backgroundColor: color }} />
                              <span className="text-[11px] font-bold tracking-wide uppercase" style={{ color }}>{fam}</span>
                            </div>

                            {/* Lines */}
                            {lines.map((item, idx) => {
                              const lineTotal = (item.quantity || 0) * (item.unitPrice || 0);
                              const breakdown = lineBreakdown(item);
                              return (
                                <div key={idx} className="px-3 py-3 border-t border-[#F1F5F9]">
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-start gap-2">
                                      {item.code && (
                                        <span className="text-[10px] font-bold rounded px-1.5 py-0.5" style={{ color, backgroundColor: `${color}1A` }}>{item.code}</span>
                                      )}
                                      <span className="text-[13px] font-bold" style={{ color: NAVY }}>{item.description}</span>
                                    </div>
                                    <span className="text-[12px] font-bold text-white rounded-md px-2 py-1 whitespace-nowrap" style={{ backgroundColor: NAVY }}>{fmtNum(lineTotal)} €</span>
                                  </div>
                                  <p className="text-[11px] text-muted-foreground mt-1">
                                    Qté : {fmtNum(item.quantity)} {item.unit || 'u'} • PU : {formatCurrency(item.unitPrice)}
                                  </p>
                                  {breakdown.length > 0 && (
                                    <div className="mt-1 space-y-0.5">
                                      {breakdown.map((p, i) => (
                                        <p key={i} className="text-[10px] font-medium" style={{ color: '#94A3B8' }}>{p}</p>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                  {roomEntries.length === 0 && (
                    <p className="text-center text-sm text-muted-foreground py-8">Aucune tâche ajoutée.</p>
                  )}
                </div>

                {/* Totals — uses the real values from the generator */}
                <div className="rounded-2xl border border-[#E2E8F0] overflow-hidden">
                  <div className="h-px mx-4 my-2" style={{ backgroundColor: NAVY }} />
                  <div className="flex justify-between items-center px-4 py-2.5">
                    <span className="text-sm font-bold" style={{ color: NAVY }}>TOTAL DEVIS HT</span>
                    <span className="text-base font-bold" style={{ color: NAVY }}>{fmtNum(totalHT)} €</span>
                  </div>
                  <div className="h-px bg-[#E2E8F0] mx-4" />
                  <div className="flex justify-between items-center px-4 py-2.5">
                    <span className="text-[13px] text-muted-foreground">TVA {tvaRate}%</span>
                    <span className="text-[13px] font-bold text-muted-foreground">{fmtNum(tvaAmount)} €</span>
                  </div>
                  <div className="m-4 rounded-xl px-4 py-3 flex justify-between items-center" style={{ backgroundColor: NAVY }}>
                    <span className="font-bold text-white">TOTAL TTC</span>
                    <span className="font-black text-2xl" style={{ color: '#EAD8B1' }}>{fmtNum(totalTTC)} €</span>
                  </div>
                  <p className="text-[11px] text-center text-muted-foreground pb-3">Payable à la commande</p>
                </div>

                {/* Signature Display */}
                {isAccepted && quote.signature && (
                  <div className="mt-6 pt-6 border-t border-dashed border-[#E2E8F0]">
                    <p className="text-[9px] font-bold tracking-wide uppercase mb-3" style={{ color: GOLD }}>Approbation client</p>
                    <div className="relative h-24 w-full md:w-64 border rounded-xl bg-white overflow-hidden">
                      <Image src={quote.signature} alt="Signature" fill className="object-contain p-4" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Signé le {quote.signedAt ? formatDate(quote.signedAt) : 'Date inconnue'}</p>
                  </div>
                )}

                {/* Entreprise legal / contact footer (shown when provided). */}
                {(company.address || company.siret || company.rcs || company.tva || company.formeJuridique) && (
                  <div className="pt-4 mt-2 border-t border-[#F1F5F9] space-y-1">
                    <p className="text-[9px] font-bold tracking-wide uppercase" style={{ color: GOLD }}>{companyName}</p>
                    {company.address && company.address.trim() && (
                      <p className="text-[10px] text-muted-foreground whitespace-pre-line">{company.address}</p>
                    )}
                    <p className="text-[10px] text-muted-foreground">
                      {[
                        company.formeJuridique && company.formeJuridique.trim() ? company.formeJuridique : null,
                        company.siret && company.siret.trim() ? `SIRET : ${company.siret}` : null,
                        company.rcs && company.rcs.trim() ? `RCS : ${company.rcs}` : null,
                        company.tva && company.tva.trim() ? `TVA : ${company.tva}` : null,
                      ].filter(Boolean).join('  ·  ')}
                    </p>
                  </div>
                )}

                {/* "Créé par Kôji" mark, kept small and on the side */}
                <div className="pt-4 mt-2 border-t border-[#F1F5F9] flex items-center justify-end gap-1">
                  <span className="text-[10px] text-muted-foreground">Créé par</span>
                  <img src="/koji-mark.svg" alt="" aria-hidden className="h-2.5 w-2.5" />
                  <span className="text-[10px] font-bold" style={{ color: GOLD }}>Kôji</span>
                </div>
              </div>{/* /relative z-10 */}
            </Card>

            {/* Comments Section */}
            <Card className="p-6 border-none shadow-sm space-y-6">
              <h3 className="font-bold text-lg text-primary">Discussion</h3>
              <div className="space-y-6">
                {quote.comments?.map((comment) => (
                  <div key={comment.id} className="flex gap-4">
                    <div className="h-8 w-8 rounded-full bg-accent/20 flex items-center justify-center text-xs font-bold text-accent shrink-0">
                      {comment.author.charAt(0)}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-primary">{comment.author}</span>
                        <span className="text-xs text-muted-foreground">{formatDate(comment.date)}</span>
                      </div>
                      <div className="bg-background p-3 rounded-lg text-sm text-primary/80">
                        {comment.text}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-4">
                {/* Attachment Preview (Composer) */}
                {pendingFiles.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3 px-1">
                    {pendingFiles.map((file, idx) => (
                      <div key={idx} className="relative group bg-gray-50 border border-gray-200 rounded-lg p-2 flex items-center gap-2 pr-6">
                        {file.type.startsWith('image/') ? (
                          <div className="h-8 w-8 relative rounded overflow-hidden flex-shrink-0">
                            <img src={URL.createObjectURL(file)} alt="preview" className="h-full w-full object-cover" />
                          </div>
                        ) : (
                          <FileIcon className="h-5 w-5 text-gray-400" />
                        )}
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-gray-700 truncate max-w-[100px]">{file.name}</span>
                          <span className="text-[10px] text-gray-500">{(file.size / 1024).toFixed(0)} KB</span>
                        </div>
                        <button
                          onClick={() => removeFile(idx)}
                          className="absolute top-1 right-1 p-0.5 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Textarea
                      placeholder="Écrire un message..."
                      className="min-h-[80px] bg-background border-border focus:border-accent pr-10"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      disabled={isSending}
                    />

                    {/* Attachment Button */}
                    <input
                      type="file"
                      multiple
                      ref={fileInputRef}
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                    <button
                      className="absolute bottom-2 right-2 p-2 rounded-full text-gray-400 hover:text-accent hover:bg-gray-100 transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isSending}
                      title="Ajouter un fichier"
                    >
                      <Paperclip className="h-5 w-5" />
                    </button>
                  </div>

                  <Button
                    size="icon"
                    className="h-[80px] w-[80px] shrink-0 bg-primary hover:bg-primary/90 disabled:opacity-50"
                    onClick={handleSubmitComment}
                    disabled={isSending || (!newComment.trim() && pendingFiles.length === 0)}
                    title="Envoyer"
                    aria-label="Envoyer"
                  >
                    {isSending ? (
                      <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* --- RIGHT COLUMN (Actions & Info) --- */}
          <div className="flex flex-col gap-6 mobile-actions-order">

            {/* 1. PDF Preview Card */}
            <Card className="p-1 border bg-white shadow-sm overflow-hidden">
              <div className="bg-gray-100 aspect-[21/29] relative flex items-center justify-center rounded-t-xl overflow-hidden group">
                {/* Mini preview effect */}
                <div className="absolute inset-4 bg-white shadow-sm flex flex-col p-4 opacity-50 scale-95 group-hover:scale-100 transition-transform duration-500">
                  <div className="h-4 w-12 bg-gray-200 rounded mb-4" />
                  <div className="h-2 w-full bg-gray-100 rounded mb-2" />
                  <div className="h-2 w-2/3 bg-gray-100 rounded mb-2" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="secondary" size="sm" className="shadow-lg" onClick={handleDownload}>
                    <Eye className="mr-2 h-4 w-4" /> Aperçu
                  </Button>
                </div>
                <div className="absolute top-4 right-4 h-10 w-10 bg-red-50 text-red-500 rounded-lg flex items-center justify-center shadow-sm border border-red-100">
                  <FileText className="h-5 w-5" />
                </div>
              </div>
              <div className="p-4 bg-white">
                <p className="font-semibold text-primary truncate mb-1">Devis-{quote.id}.pdf</p>
                <p className="text-xs text-muted-foreground mb-4">PDF • 1.2 MB</p>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="secondary" className="w-full text-xs" onClick={handleShare}>
                    <Share2 className="mr-2 h-3 w-3" /> Partager
                  </Button>
                  <Button variant="secondary" className="w-full text-xs" onClick={handleDownload}>
                    <Download className="mr-2 h-3 w-3" /> Télécharger
                  </Button>
                </div>
              </div>
            </Card>

            {/* 2. Primary Actions */}
            {canAct && (
              <Card className="p-6 bg-white border-none shadow-sm space-y-4">
                <h3 className="font-bold text-lg text-primary">Actions</h3>
                <div className="space-y-3">
                  <Button
                    onClick={() => setIsSignModalOpen(true)}
                    className="w-full h-14 text-lg bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                  >
                    Accepter & Signer
                  </Button>
                  <Button
                    onClick={handleReject}
                    variant="outline"
                    className="w-full h-12 border-red-100 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200"
                  >
                    Refuser le devis
                  </Button>
                </div>
                <Button variant="ghost" size="sm" className="w-full text-muted-foreground" onClick={() => window.print()}>
                  <Printer className="mr-2 h-4 w-4" /> Imprimer
                </Button>
              </Card>
            )}

            {isAccepted && (
              <Card className="p-6 bg-green-50 border border-green-100 text-center space-y-4">
                <div className="h-12 w-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-green-800">Devis Signé</h3>
                  <p className="text-sm text-green-700 mt-1">Merci pour votre confiance.</p>
                </div>
              </Card>
            )}

            {/* 3. Date Picker (If needed) */}
            <Card className="p-6 bg-white border-none shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-accent" />
                <h3 className="font-bold text-primary">Date souhaitée</h3>
              </div>
              <div className="space-y-2">
                <input
                  type="date"
                  className="w-full h-12 rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all font-sans"
                  value={quote.startDate || ''}
                  onChange={handleStartDateChange}
                />
                <p className="text-xs text-muted-foreground">Date indicative de début de chantier.</p>
              </div>
            </Card>

          </div>
        </div>

        <SignatureModal
          open={isSignModalOpen}
          onClose={() => setIsSignModalOpen(false)}
          onConfirm={handleSign}
        />
      </div>

      {/* Mobile-order styling adjustment via CSS if needed, but Grid order handles it mostly. 
          For true mobile reordering where Actions comes first, we can use flex-col-reverse or 'order' utilities.
      */}
      <style jsx global>{`
        @media (max-width: 768px) {
          .mobile-actions-order {
            order: -1; 
          }
        }
      `}</style>
    </div>
  );
}
