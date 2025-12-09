import { Invoice, AppSettings, InvoiceStatus } from '../types';

const INVOICES_KEY = 'zias_invoices_v1';
const SETTINGS_KEY = 'zias_settings_v1';

// Default Logo from the user request prompt
const DEFAULT_LOGO = "https://i.imgur.com/G5qWJ4p.jpeg";

const DEFAULT_SETTINGS: AppSettings = {
  businessName: "Zia's Royalle",
  businessAddress: "123 Fashion Ave, New York, NY 10012",
  businessEmail: "contact@ziasroyalle.com",
  businessPhone: "+1 (555) 012-3456",
  logoUrl: DEFAULT_LOGO,
  primaryColor: "#a855f7", // Purple-500 matching the logo vibe
  currency: "$",
  taxRate: 8.875,
};

export const getSettings = (): AppSettings => {
  const saved = localStorage.getItem(SETTINGS_KEY);
  return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
};

export const saveSettings = (settings: AppSettings): void => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

export const getInvoices = (): Invoice[] => {
  const saved = localStorage.getItem(INVOICES_KEY);
  return saved ? JSON.parse(saved) : [];
};

export const saveInvoice = (invoice: Invoice): void => {
  const invoices = getInvoices();
  const index = invoices.findIndex((inv) => inv.id === invoice.id);
  
  if (index >= 0) {
    invoices[index] = invoice;
  } else {
    invoices.push(invoice);
  }
  
  localStorage.setItem(INVOICES_KEY, JSON.stringify(invoices));
};

export const deleteInvoice = (id: string): void => {
  const invoices = getInvoices().filter((inv) => inv.id !== id);
  localStorage.setItem(INVOICES_KEY, JSON.stringify(invoices));
};

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};