export interface Service {
  id: string;
  title: string;
  description: string;
  iconName: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
}

export type QuoteStatus = 'Draft' | 'Sent' | 'Accepted' | 'Rejected' | 'en_cours' | 'accepte' | 'refuse';

export interface Attachment {
  id: string;
  bucket_id: string;
  file_path: string;
  mime_type: string;
  file_size: number;
  original_name: string;
  signedUrl: string | null;
}

export interface QuoteComment {
  id: string;
  text: string;
  author: string; // or author_name
  author_email?: string;
  date: string; // created_at
  attachments?: Attachment[];
}

export interface QuoteLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  /** Optional unit label (e.g. "u", "m²", "h") carried from the generator. */
  unit?: string;
  /** Room/zone this line belongs to, so the client can see the grouping. */
  room?: string;
}

export interface Quote {
  id: string;
  clientName: string;
  clientEmail: string;
  projectTitle: string;
  status: QuoteStatus;
  issuedDate: string;
  validUntil: string;
  startDate?: string;
  comments?: QuoteComment[];
  items: QuoteLineItem[];
  /** Total TTC (kept for backwards compatibility with existing callers). */
  total: number;
  /** Real pre-tax total as computed by the generator. */
  totalHT?: number;
  /** Real tax-included total as computed by the generator. */
  totalTTC?: number;
  /** VAT rate in percent (e.g. 20). */
  tvaRate?: number;
  signature?: string; // Base64 signature
  signedAt?: string;
}
