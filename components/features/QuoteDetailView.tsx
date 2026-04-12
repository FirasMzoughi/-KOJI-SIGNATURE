'use client';

import { useClientStore } from '@/store/clientStore';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { SignatureModal } from '@/components/features/SignatureModal';
import { useState, useEffect, useRef } from 'react';
import { formatDate, formatCurrency } from '@/lib/utils';
import { Download, CheckCircle, Printer, Calendar, FileText, Share2, Eye, ShieldCheck, Clock, MapPin, Paperclip, X, File as FileIcon, Send } from 'lucide-react';
import Image from 'next/image';
import { Textarea } from '@/components/ui/Textarea';

interface QuoteDetailViewProps {
  id: string;
  email?: string;
}

export function QuoteDetailView({ id, email }: QuoteDetailViewProps) {
  const { quotes, updateQuoteStatus, updateQuoteStartDate, addQuoteMessage, fetchQuote, isLoading, error } = useClientStore();

  useEffect(() => {
    if (id) {
      fetchQuote(id, email);
    }
  }, [id, email, fetchQuote]);

  const quote = quotes.find((q) => q.id === id);

  // Local state for new comment
  const [newComment, setNewComment] = useState('');
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  if (isLoading) return <div className="p-8 flex justify-center items-center h-screen text-primary">Chargement du devis...</div>;
  if (error) return <div className="p-8 text-red-500">Erreur: {error}</div>;

  if (!quote) {
    return <div className="p-8">Quote not found</div>;
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

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* --- Top Header Card (Mobile Style) --- */}
        <Card className="p-6 border-none shadow-sm bg-white overflow-hidden relative">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none uppercase tracking-wider text-xs font-bold px-2 py-1">
                  {quote.status}
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

            {/* Quote Document Card */}
            <Card className="p-8 bg-[#ffffff] border-none space-y-8" id="quote-document">
              {/* Header Row */}
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-[#F1F5F9] flex items-center justify-center">
                    <ShieldCheck className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-primary">Koji </h3>
                    <p className="text-xs text-muted-foreground">contact@koji.com</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-accent uppercase mb-1">Date</p>
                  <p className="text-sm font-semibold text-primary">{formatDate(quote.issuedDate)}</p>
                </div>
              </div>

              <div className="h-px bg-[#E2E8F0]" />

              {/* Client Info */}
              <div className="bg-[#FFF7ED] rounded-xl p-6 border border-[#F1F5F9]">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-full bg-[#ffffff] flex items-center justify-center shadow-sm text-[#A18B73] font-bold">
                    C
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-accent uppercase mb-1">Client</h4>
                    <p className="font-bold text-primary text-lg">{quote.clientName}</p>
                    <p className="text-sm text-muted-foreground">{quote.clientEmail}</p>
                    <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span>789 Client Avenue, Tech City</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items Table (Simplified for mobile look) */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-primary uppercase tracking-wider">Détails du chantier</h4>
                <div className="space-y-3">
                  {quote.items.map((item, idx) => (
                    <div key={idx} className="group flex justify-between items-start p-4 bg-transparent border border-transparent">
                      <div className="space-y-1">
                        <p className="font-semibold text-primary">{item.description}</p>
                        <p className="text-xs text-muted-foreground">Quantité: {item.quantity} • PU: {formatCurrency(item.unitPrice)}</p>
                      </div>
                      <p className="font-bold text-primary">{formatCurrency(item.quantity * item.unitPrice)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Recap */}
              <div className="bg-[#F8FAFC] rounded-xl p-6 space-y-3">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Total HT</span>
                  <span>{formatCurrency(quote.total)}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>TVA (20%)</span>
                  <span>{formatCurrency(quote.total * 0.2)}</span>
                </div>
                <div className="h-px bg-[#E2E8F0] my-2" />
                <div className="flex justify-between items-end">
                  <span className="font-bold text-primary">Total TTC</span>
                  <span className="text-2xl font-bold text-primary">{formatCurrency(quote.total * 1.2)}</span>
                </div>
                <p className="text-xs text-center text-muted-foreground pt-2">Payable à la commande</p>
              </div>

              {/* Signature Display */}
              {isAccepted && quote.signature && (
                <div className="mt-8 pt-8 border-t border-dashed border-[#E2E8F0]">
                  <p className="text-xs font-bold text-accent uppercase mb-4">Approbation client</p>
                  <div className="relative h-24 w-full md:w-64 border rounded-xl bg-[#ffffff] overflow-hidden">
                    <Image src={quote.signature} alt="Signature" fill className="object-contain p-4" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Signé le {quote.signedAt ? formatDate(quote.signedAt) : 'Date inconnue'}</p>
                </div>
              )}
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
          isOpen={isSignModalOpen}
          onClose={() => setIsSignModalOpen(false)}
          onSign={handleSign}
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
