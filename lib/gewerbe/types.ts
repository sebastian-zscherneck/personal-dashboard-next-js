// Gewerbe (Self-Employment) Types

// Client from Kunden tab
export interface GewerbeClient {
  name: string;
  kundennummer: string;
  strasse: string;
  adresse: string; // Stadt/PLZ
}

// Line item for invoice
export interface InvoiceLineItem {
  pos: number;
  beschreibung: string;
  menge: number;
  einzelpreis: number;
  gesamtpreis: number; // menge * einzelpreis
}

// Full invoice data for PDF generation
export interface GewerbeInvoiceData {
  rechnungsnummer: string;
  rechnungsdatum: string; // YYYY-MM-DD
  leistungszeitraumStart: string; // YYYY-MM-DD
  leistungszeitraumEnd: string; // YYYY-MM-DD
  client: GewerbeClient;
  items: InvoiceLineItem[];
  artDerZahlung: "Überweisung" | "Bar" | "PayPal";
}

// Row in Einnahmen_Gewerbe sheet
export interface EinnahmenRow {
  datumDerZahlung: string;
  betrag: number;
  beschreibungDerLeistung: string;
  nameDesKunden: string;
  artDerZahlung: string;
  rechnungsnummer: string;
  link: string; // PDF link in Drive
}

// Row in Ausgaben_Gewerbe sheet
export interface AusgabenRow {
  datumDerZahlung: string;
  betrag: number;
  beschreibungDesZwecks: string;
  nameDesDienstleisters: string;
  artDerZahlung: string;
  rechnungsnummer: string;
  link: string;
}

// Form data for creating new invoice
export interface NewInvoiceFormData {
  selectedKundennummer: string;
  isNewClient: boolean;
  newClient?: Omit<GewerbeClient, "kundennummer">;
  rechnungsdatum: string;
  leistungszeitraumStart: string;
  leistungszeitraumEnd: string;
  items: Omit<InvoiceLineItem, "pos" | "gesamtpreis">[];
  artDerZahlung: "Überweisung" | "Bar" | "PayPal";
}

// Sender info type
export interface SenderInfo {
  name: string;
  strasse: string;
  stadt: string;
  ustId: string;
  bank: string;
  iban: string;
  email: string;
  website: string;
  telefon: string;
}

// Tax configuration type
export interface TaxConfig {
  rate: number; // 0, 7, or 19
  isKleinunternehmer: boolean;
}

// Get sender info from environment variables
export function getSenderInfo(): SenderInfo {
  return {
    name: process.env.INVOICE_SENDER_NAME || "",
    strasse: process.env.INVOICE_SENDER_STREET || "",
    stadt: process.env.INVOICE_SENDER_CITY || "",
    ustId: process.env.INVOICE_SENDER_UST_ID || "",
    bank: process.env.INVOICE_SENDER_BANK || "",
    iban: process.env.INVOICE_SENDER_IBAN || "",
    email: process.env.INVOICE_SENDER_EMAIL || "",
    website: process.env.INVOICE_SENDER_WEBSITE || "",
    telefon: process.env.INVOICE_SENDER_PHONE || "",
  };
}

// Get tax configuration from environment variables
export function getTaxConfig(): TaxConfig {
  return {
    rate: parseFloat(process.env.INVOICE_TAX_RATE || "0"),
    isKleinunternehmer: process.env.INVOICE_KLEINUNTERNEHMER === "true",
  };
}
