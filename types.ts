export enum InvoiceStatus {
  DRAFT = 'Draft',
  PENDING = 'Pending',
  PAID = 'Paid',
  OVERDUE = 'Overdue'
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
}

export interface Client {
  name: string;
  email: string;
  address: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  client: Client;
  items: InvoiceItem[];
  status: InvoiceStatus;
  notes?: string;
  subtotal: number;
  taxRate: number; // Percentage 0-100
  taxAmount: number;
  total: number;
}

export interface AppSettings {
  businessName: string;
  businessAddress: string;
  businessEmail: string;
  businessPhone: string;
  logoUrl: string;
  primaryColor: string; // Hex code
  currency: string;
  taxRate: number;
}

export type ViewState = 'DASHBOARD' | 'INVOICES' | 'CREATE_INVOICE' | 'SETTINGS' | 'EDIT_INVOICE';