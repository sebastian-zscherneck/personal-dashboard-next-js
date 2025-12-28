import { readSheet, appendToSheet } from "../google";
import type { GewerbeClient, EinnahmenRow, AusgabenRow } from "./types";

// Spreadsheet ID for Gewerbe data
const GEWERBE_SHEET_ID = "1rraBykfIqEuSet_co6-tpEFyyVKtjo1lpeJs2cZb3wg";

// Sheet ranges
const KUNDEN_RANGE = "Kunden!A:D";
const EINNAHMEN_RANGE = "Einnahmen_Gewerbe!A:G";
const AUSGABEN_RANGE = "Ausgaben_Gewerbe!A:G";
const RECHNUNGSNUMMER_RANGE = "Einnahmen_Gewerbe!F:F";

/**
 * Get all Gewerbe clients from Kunden tab
 */
export async function getGewerbeClients(): Promise<GewerbeClient[]> {
  const rows = await readSheet(GEWERBE_SHEET_ID, KUNDEN_RANGE);

  // Skip header row
  return rows.slice(1).map((row) => ({
    name: row[0] || "",
    kundennummer: row[1] || "",
    strasse: row[2] || "",
    adresse: row[3] || "",
  }));
}

/**
 * Get a single client by Kundennummer
 */
export async function getGewerbeClientByNumber(
  kundennummer: string
): Promise<GewerbeClient | null> {
  const clients = await getGewerbeClients();
  return clients.find((c) => c.kundennummer === kundennummer) || null;
}

/**
 * Add a new Gewerbe client
 * Auto-generates the next Kundennummer
 */
export async function addGewerbeClient(
  client: Omit<GewerbeClient, "kundennummer">
): Promise<GewerbeClient> {
  const clients = await getGewerbeClients();

  // Find max Kundennummer and increment
  let maxNum = 0;
  for (const c of clients) {
    const num = parseInt(c.kundennummer.replace(/\D/g, "") || "0", 10);
    if (num > maxNum) maxNum = num;
  }

  const newKundennummer = String(maxNum + 1).padStart(4, "0");

  const newClient: GewerbeClient = {
    ...client,
    kundennummer: newKundennummer,
  };

  await appendToSheet(GEWERBE_SHEET_ID, KUNDEN_RANGE, [
    [newClient.name, newClient.kundennummer, newClient.strasse, newClient.adresse],
  ]);

  return newClient;
}

/**
 * Get the next invoice number (sequential)
 * Returns formatted string like "001", "002", etc.
 */
export async function getNextInvoiceNumber(): Promise<string> {
  const rows = await readSheet(GEWERBE_SHEET_ID, RECHNUNGSNUMMER_RANGE);

  let maxNum = 0;
  // Skip header row
  for (const row of rows.slice(1)) {
    const numStr = row[0] || "";
    // Extract number from string (handles both "001" and "RE-2025-001" formats)
    const match = numStr.match(/(\d+)/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxNum) maxNum = num;
    }
  }

  return String(maxNum + 1).padStart(3, "0");
}

/**
 * Save invoice to Einnahmen_Gewerbe sheet
 */
export async function saveGewerbeInvoice(invoice: EinnahmenRow): Promise<void> {
  await appendToSheet(GEWERBE_SHEET_ID, EINNAHMEN_RANGE, [
    [
      invoice.datumDerZahlung,
      invoice.betrag.toString(),
      invoice.beschreibungDerLeistung,
      invoice.nameDesKunden,
      invoice.artDerZahlung,
      invoice.rechnungsnummer,
      invoice.link,
    ],
  ]);
}

/**
 * Get all invoices from Einnahmen_Gewerbe
 */
export async function getGewerbeInvoices(): Promise<EinnahmenRow[]> {
  const rows = await readSheet(GEWERBE_SHEET_ID, EINNAHMEN_RANGE);

  // Skip header row
  return rows.slice(1).map((row) => ({
    datumDerZahlung: row[0] || "",
    betrag: parseGermanNumber(row[1] || "0"),
    beschreibungDerLeistung: row[2] || "",
    nameDesKunden: row[3] || "",
    artDerZahlung: row[4] || "",
    rechnungsnummer: row[5] || "",
    link: row[6] || "",
  }));
}

/**
 * Parse German number format (1.234,56 -> 1234.56)
 */
function parseGermanNumber(str: string): number {
  if (!str) return 0;
  // Remove thousand separators (.) and replace decimal comma with dot
  const normalized = str
    .replace(/\./g, "")  // Remove thousand separators
    .replace(",", ".");  // Replace decimal comma with dot
  return parseFloat(normalized) || 0;
}

/**
 * Get all expenses from Ausgaben_Gewerbe
 */
export async function getGewerbeExpenses(): Promise<AusgabenRow[]> {
  const rows = await readSheet(GEWERBE_SHEET_ID, AUSGABEN_RANGE);

  // Skip header row
  return rows.slice(1).map((row) => ({
    datumDerZahlung: row[0] || "",
    betrag: parseGermanNumber(row[1] || "0"),
    beschreibungDesZwecks: row[2] || "",
    nameDesDienstleisters: row[3] || "",
    artDerZahlung: row[4] || "",
    rechnungsnummer: row[5] || "",
    link: row[6] || "",
  }));
}
