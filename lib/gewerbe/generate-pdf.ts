import { renderToBuffer } from "@react-pdf/renderer";
import { InvoicePDF } from "./pdf-template";
import type { GewerbeInvoiceData } from "./types";

/**
 * Generate invoice PDF as Buffer
 * Uses @react-pdf/renderer to create the PDF
 */
export async function generateInvoicePDF(
  data: GewerbeInvoiceData
): Promise<Buffer> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdfBuffer = await renderToBuffer(InvoicePDF({ data }) as any);
  return Buffer.from(pdfBuffer);
}

/**
 * Generate filename for invoice PDF
 */
export function generateInvoiceFilename(
  rechnungsnummer: string,
  clientName: string
): string {
  const safeName = clientName
    .replace(/[^a-zA-Z0-9äöüÄÖÜß\s-]/g, "")
    .replace(/\s+/g, "_");
  return `Rechnung_${rechnungsnummer}_${safeName}.pdf`;
}
