import { readSheet, appendToSheet, updateSheet } from "./google";
import { generateId } from "./utils";

const SHEET_ID = process.env.GOOGLE_SHEET_ID!;
const INVOICES_RANGE = "Einnahmen_Gewerbe!A:L";

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  business: "consultancy" | "tutoring";
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: "draft" | "sent" | "paid" | "overdue";
  pdfUrl?: string;
  createdAt: string;
}

function parseItems(itemsJson: string): InvoiceItem[] {
  try {
    return JSON.parse(itemsJson || "[]");
  } catch {
    return [];
  }
}

export async function getInvoices(): Promise<Invoice[]> {
  const rows = await readSheet(SHEET_ID, INVOICES_RANGE);

  return rows.slice(1).map((row) => ({
    id: row[0] || "",
    invoiceNumber: row[1] || "",
    clientId: row[2] || "",
    clientName: row[3] || "",
    business: (row[4] as "consultancy" | "tutoring") || "consultancy",
    issueDate: row[5] || "",
    dueDate: row[6] || "",
    items: parseItems(row[7]),
    subtotal: parseFloat(row[8]) || 0,
    tax: parseFloat(row[9]) || 0,
    total: parseFloat(row[10]) || 0,
    status: (row[11] as Invoice["status"]) || "draft",
    pdfUrl: row[12] || undefined,
    createdAt: row[13] || "",
  }));
}

export async function getInvoiceById(id: string): Promise<Invoice | null> {
  const invoices = await getInvoices();
  return invoices.find((i) => i.id === id) || null;
}

export async function createInvoice(
  data: Omit<Invoice, "id" | "createdAt">
): Promise<Invoice> {
  const invoice: Invoice = {
    ...data,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };

  await appendToSheet(SHEET_ID, INVOICES_RANGE, [
    [
      invoice.id,
      invoice.invoiceNumber,
      invoice.clientId,
      invoice.clientName,
      invoice.business,
      invoice.issueDate,
      invoice.dueDate,
      JSON.stringify(invoice.items),
      invoice.subtotal.toString(),
      invoice.tax.toString(),
      invoice.total.toString(),
      invoice.status,
      invoice.pdfUrl || "",
      invoice.createdAt,
    ],
  ]);

  return invoice;
}

export async function updateInvoice(
  id: string,
  data: Partial<Omit<Invoice, "id" | "createdAt">>
): Promise<Invoice | null> {
  const invoices = await getInvoices();
  const index = invoices.findIndex((i) => i.id === id);

  if (index === -1) return null;

  const updated = { ...invoices[index], ...data };

  await updateSheet(SHEET_ID, `Invoices!A${index + 2}:N${index + 2}`, [
    [
      updated.id,
      updated.invoiceNumber,
      updated.clientId,
      updated.clientName,
      updated.business,
      updated.issueDate,
      updated.dueDate,
      JSON.stringify(updated.items),
      updated.subtotal.toString(),
      updated.tax.toString(),
      updated.total.toString(),
      updated.status,
      updated.pdfUrl || "",
      updated.createdAt,
    ],
  ]);

  return updated;
}

export async function getInvoicesByBusiness(
  business: "consultancy" | "tutoring"
): Promise<Invoice[]> {
  const invoices = await getInvoices();
  return invoices.filter((i) => i.business === business);
}

export async function getInvoicesByClient(clientId: string): Promise<Invoice[]> {
  const invoices = await getInvoices();
  return invoices.filter((i) => i.clientId === clientId);
}

export function generateInvoiceNumber(
  business: "consultancy" | "tutoring"
): string {
  const prefix = business === "consultancy" ? "AC" : "MT";
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `${prefix}-${year}-${random}`;
}
