'use client';

import { useParams, useSearchParams } from 'next/navigation';

export const dynamic = 'force-dynamic';
import { useClientStore } from '@/store/clientStore';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { SignatureModal } from '@/components/features/SignatureModal';
import { useState, useEffect } from 'react';
import { formatDate, formatCurrency } from '@/lib/utils';
import { Download, CheckCircle, XCircle, FileCheck, Printer, Calendar, ImagePlus, Palette, ListTodo, CheckSquare, Paperclip, X, File as FileIcon, Send, Share2 } from 'lucide-react';
import Image from 'next/image';
import { Textarea } from '@/components/ui/Textarea';
import { useRef } from 'react';

export default function QuoteDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const searchParams = useSearchParams();
  const email = searchParams?.get('email') || undefined;
  const { quotes, updateQuoteStatus, updateQuoteStartDate, addQuoteMessage, user, fetchQuote, isLoading, error } = useClientStore();

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);

  if (isLoading) return <div className="p-8 flex justify-center items-center h-screen">Chargement du devis...</div>;
  if (error) return <div className="p-8 text-red-500">Erreur: {error}</div>;

  if (!quote) {
    return <div className="p-8">Quote not found</div>;
  }

  const handleSign = (signature: string) => {
    updateQuoteStatus(quote.id, 'Accepted', signature);
    // State will update via useEffect
  };

  const handleReject = () => {
    updateQuoteStatus(quote.id, 'Rejected');
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateQuoteStartDate(quote.id, e.target.value);
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
      // alert("Message envoyé !");
    } catch (error) {
      alert("Erreur lors de l'envoi du message.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header / Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-background/50 sticky top-0 z-10 py-4 backdrop-blur-md border-b -mx-8 px-8">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-serif font-bold">Devis {quote.id}</h1>
          <Badge variant={quote.status === 'Accepted' ? 'success' : quote.status === 'Rejected' ? 'destructive' : 'default'} className="text-sm px-3 py-1">
            {quote.status}
          </Badge>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" /> Imprimer
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" /> PDF
          </Button>
          {(quote.status === 'Sent' || quote.status === 'en_cours') && (
            <>
              <Button variant="outline" className="text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200" onClick={handleReject}>
                Refuser
              </Button>
              <Button onClick={() => setIsSignModalOpen(true)}>
                Accepter & Signer
              </Button>
            </>
          )}
          {(quote.status === 'Accepted' || quote.status === 'accepte') && (
            <Button disabled variant="outline" className="bg-green-50 text-green-700 border-green-200 opacity-100">
              <CheckCircle className="mr-2 h-4 w-4" /> Signé
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Document & Comments */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-8 md:p-12 space-y-8 bg-white text-gray-900 shadow-sm border-0 print:shadow-none">
            {/* Document Header */}
            <div className="flex justify-between items-start border-b pb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">KOJI</h2>
                <p className="text-sm text-gray-500 mt-1">
                  contact@koji.fr
                </p>
              </div>
              <div className="text-right">
                <h3 className="text-lg font-bold text-gray-400 uppercase tracking-widest">Quote</h3>
                <p className="text-xl font-mono mt-2">{quote.id}</p>
              </div>
            </div>

            {/* Client Info */}
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Facturer à</h4>
                <p className="font-semibold">{quote.clientName}</p>
                <p className="text-gray-600">{quote.clientEmail}</p>
                {/* Mock address */}
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Date d'émission:</span>
                  <span className="font-medium">{formatDate(quote.issuedDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Valide jusqu'au:</span>
                  <span className="font-medium">{formatDate(quote.validUntil)}</span>
                </div>
                <div className="flex justify-between text-yellow-600 font-medium">
                  <span>Projet:</span>
                  <span>{quote.projectTitle}</span>
                </div>
              </div>
            </div>

            {/* Line Items */}
            <div className="mt-8">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left font-semibold py-3 text-gray-900">Description</th>
                    <th className="text-right font-semibold py-3 text-gray-900">Qté</th>
                    <th className="text-right font-semibold py-3 text-gray-900">Prix Unit.</th>
                    <th className="text-right font-semibold py-3 text-gray-900">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {quote.items.map((item) => (
                    <tr key={item.id}>
                      <td className="py-4 text-gray-700">{item.description}</td>
                      <td className="py-4 text-right text-gray-700">{item.quantity}</td>
                      <td className="py-4 text-right text-gray-700">{formatCurrency(item.unitPrice)}</td>
                      <td className="py-4 text-right font-medium text-gray-900">{formatCurrency(item.quantity * item.unitPrice)}</td>
                    </tr>
                  ))}
                  {quote.items.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-gray-400 italic">Aucune ligne (Devis récapitulatif)</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end pt-4 border-t border-gray-200">
              <div className="w-1/2 space-y-3">
                <div className="flex justify-between text-gray-500">
                  <span>Sous-total</span>
                  <span>{formatCurrency(quote.total)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>TVA (20%)</span>
                  <span>{formatCurrency(quote.total * 0.2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-gray-900 border-t border-gray-200 pt-3">
                  <span>Total Dû</span>
                  <span>{formatCurrency(quote.total * 1.2)}</span>
                </div>
              </div>
            </div>

            {/* Signature Area if Accepted */}
            {(quote.status === 'Accepted' || quote.status === 'accepte') && quote.signature && (
              <div className="pt-8 mt-8 border-t border-gray-100">
                <div className="flex flex-col gap-2">
                  <p className="text-xs font-bold text-gray-400 uppercase">Signature Autorisée</p>
                  <div className="h-16 w-48 relative border border-dashed border-gray-200 rounded bg-gray-50">
                    <Image src={quote.signature} alt="Approbation client" fill className="object-contain" />
                  </div>
                  <p className="text-xs text-gray-400">Signé par {user?.name} le {quote.signedAt ? formatDate(quote.signedAt) : 'Date inconnue'}</p>
                </div>
              </div>
            )}

            {/* Material Selections Demo */}
            <div className="pt-8 mt-8 border-t border-gray-100">
              <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Palette className="h-5 w-5 text-primary" /> Choix des Finitions
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4 hover:border-primary transition-colors cursor-pointer bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold">Peinture Salon</span>
                    <Badge variant="outline">En Attente</Badge>
                  </div>
                  <p className="text-sm text-gray-500 mb-3">Sélectionner la teinte principale pour les murs.</p>
                  <Button variant="outline" size="sm" className="w-full">Choisir une couleur</Button>
                </div>
                <div className="border rounded-lg p-4 border-green-200 bg-green-50/50">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold text-green-900">Parquet Chambre</span>
                    <Badge className="bg-green-600 hover:bg-green-700">Validé</Badge>
                  </div>
                  <p className="text-sm text-green-800 mb-3">Chêne Clair Naturel (Ref: 8832)</p>
                  <div className="text-xs text-green-700 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" /> Confirmé le 24/01
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Comments & Photos Section */}
          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-4">Discussion</h3>

            {/* Comments List */}
            <div className="space-y-6 mb-6 max-h-[600px] overflow-y-auto">
              {quote.comments?.map((comment) => (
                <div key={comment.id} className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                    {comment.author.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold">{comment.author}</p>
                      <span className="text-xs text-muted-foreground">{formatDate(comment.date)}</span>
                    </div>
                    {comment.text && <p className="text-sm text-gray-600">{comment.text}</p>}

                    {/* Attachment Grid */}
                    {comment.attachments && comment.attachments.length > 0 && (
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {comment.attachments.map((att) => (
                          <a
                            key={att.id}
                            href={att.signedUrl || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group relative block rounded-lg overflow-hidden border border-border hover:border-accent transition-colors"
                          >
                            {att.mime_type?.startsWith('image/') ? (
                              <div className="h-20 w-20 relative bg-gray-50 text-gray-400">
                                <Image
                                  src={att.signedUrl || '/placeholder.png'}
                                  alt={att.original_name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            ) : (
                              <div className="h-20 w-20 flex flex-col items-center justify-center bg-gray-50 p-1">
                                <FileIcon className="h-6 w-6 text-gray-400 mb-1" />
                                <span className="text-[9px] text-gray-600 truncate w-full text-center px-1">
                                  {att.original_name}
                                </span>
                              </div>
                            )}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {(!quote.comments || quote.comments.length === 0) && (
                <p className="text-sm text-muted-foreground italic text-center py-4">Aucun message pour le moment.</p>
              )}
            </div>

            {/* New Comment Input */}
            <div className="space-y-4 pt-4 border-t">
              {/* Previews */}
              {pendingFiles.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
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

              <div className="flex items-center gap-3">
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

        {/* Sidebar Stats */}
        <div className="space-y-6">
          <Card className="p-6 bg-primary/5 border-primary/20">
            <h3 className="font-semibold text-lg mb-4">Résumé du Devis</h3>
            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded bg-background shadow-sm">
                  <FileCheck className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Statut</p>
                  <p className="text-muted-foreground">{quote.status} à ce jour</p>
                </div>
              </div>
              {quote.status === 'Sent' && (
                <div className="p-3 bg-yellow-50 text-yellow-800 rounded-md text-xs">
                  ⚠️ Ce devis expire le {formatDate(quote.validUntil)}. Veuillez vérifier avant cette date.
                </div>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <ListTodo className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-lg">Actions Requises</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 rounded-full p-1 ${quote.status === 'Accepted' ? 'bg-green-100 text-green-600' : 'bg-primary/10 text-primary'}`}>
                  {quote.status === 'Accepted' ? <CheckCircle className="h-3 w-3" /> : <span className="h-3 w-3 block rounded-full bg-current" />}
                </div>
                <div className="text-sm">
                  <p className={`font-medium ${quote.status === 'Accepted' ? 'text-green-900 line-through' : ''}`}>Validation du Devis</p>
                  {quote.status !== 'Accepted' && <p className="text-xs text-muted-foreground">Signez le devis pour démarrer.</p>}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-full p-1 bg-gray-100 text-gray-400">
                  <span className="h-3 w-3 block rounded-full bg-current" />
                </div>
                <div className="text-sm">
                  <p className="font-medium text-gray-500">Acompte de 30%</p>
                  <p className="text-xs text-muted-foreground">À régler après signature.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-full p-1 bg-gray-100 text-gray-400">
                  <span className="h-3 w-3 block rounded-full bg-current" />
                </div>
                <div className="text-sm">
                  <p className="font-medium text-gray-500">Choix des Finitions</p>
                  <p className="text-xs text-muted-foreground">Sélectionnez vos couleurs & matériaux.</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Start Date Picker */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-lg">Date de Début</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Souhaitez-vous proposer une date de début préférée pour ce chantier ?
            </p>
            <div className="space-y-2">
              <label className="text-xs font-medium uppercase text-muted-foreground">Date Préférée</label>
              <input
                type="date"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={quote.startDate || ''}
                onChange={handleStartDateChange}
              />
              <p className="text-xs text-muted-foreground">
                Cette date est indicative et sera confirmée par l'équipe Koji.
              </p>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-4">Des questions ?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Si vous avez des questions sur ce devis, veuillez contacter directement la gestion de projet.
            </p>
            <Button variant="outline" className="w-full">
              Envoyer un message
            </Button>
          </Card>
        </div>
      </div>

      <SignatureModal
        isOpen={isSignModalOpen}
        onClose={() => setIsSignModalOpen(false)}
        onSign={handleSign}
      />
    </div>
  );
}
