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

export interface QuoteComment {
  id: string;
  text: string;
  author: string;
  date: string;
  attachments?: string[]; // Array of image URLs/Base64
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
