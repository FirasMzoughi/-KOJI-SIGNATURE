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
  total: number;
  signature?: string; // Base64 signature
  signedAt?: string;
}
