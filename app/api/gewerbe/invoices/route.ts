import { NextRequest, NextResponse } from "next/server";
import {
  getGewerbeClients,
  getGewerbeInvoices,
  getNextInvoiceNumber,
  saveGewerbeInvoice,
  addGewerbeClient,
} from "@/lib/gewerbe/sheets";
import { generateInvoicePDF, generateInvoiceFilename } from "@/lib/gewerbe/generate-pdf";
import { uploadToUserDrive } from "@/lib/google";
import type { GewerbeInvoiceData, InvoiceLineItem } from "@/lib/gewerbe/types";

// Force dynamic rendering - ensures env vars are read at runtime
export const dynamic = "force-dynamic";

/**
 * GET /api/gewerbe/invoices
 * Returns all Gewerbe invoices from Einnahmen_Gewerbe
 */
export async function GET() {
  try {
    const invoices = await getGewerbeInvoices();
    return NextResponse.json(invoices);
  } catch (error) {
    console.error("Error fetching Gewerbe invoices:", error);
    return NextResponse.json(
      { error: "Failed to fetch invoices" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/gewerbe/invoices
 * Create a new invoice: generate PDF, upload to Drive, save to sheet
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (
      !body.rechnungsdatum ||
      !body.leistungszeitraumStart ||
      !body.leistungszeitraumEnd ||
      !body.items ||
      body.items.length === 0
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get or create client
    let client;
    if (body.isNewClient && body.newClient) {
      client = await addGewerbeClient(body.newClient);
    } else if (body.selectedKundennummer) {
      const clients = await getGewerbeClients();
      client = clients.find((c) => c.kundennummer === body.selectedKundennummer);
      if (!client) {
        return NextResponse.json(
          { error: "Client not found" },
          { status: 404 }
        );
      }
    } else {
      return NextResponse.json(
        { error: "No client specified" },
        { status: 400 }
      );
    }

    // Get next invoice number
    const rechnungsnummer = await getNextInvoiceNumber();

    // Prepare line items with position numbers and calculated totals
    const items: InvoiceLineItem[] = body.items.map(
      (item: { beschreibung: string; menge: number; einzelpreis: number }, index: number) => ({
        pos: index + 1,
        beschreibung: item.beschreibung,
        menge: item.menge,
        einzelpreis: item.einzelpreis,
        gesamtpreis: item.menge * item.einzelpreis,
      })
    );

    // Prepare invoice data
    const invoiceData: GewerbeInvoiceData = {
      rechnungsnummer,
      rechnungsdatum: body.rechnungsdatum,
      leistungszeitraumStart: body.leistungszeitraumStart,
      leistungszeitraumEnd: body.leistungszeitraumEnd,
      client,
      items,
      artDerZahlung: body.artDerZahlung || "Überweisung",
    };

    // Generate PDF
    const pdfBuffer = await generateInvoicePDF(invoiceData);

    // Upload to Google Drive (uses stored refresh token automatically)
    const fileName = generateInvoiceFilename(rechnungsnummer, client.name);
    const driveFolderId = process.env.GOOGLE_DRIVE_INVOICES_FOLDER_ID;

    const driveFile = await uploadToUserDrive(
      fileName,
      "application/pdf",
      pdfBuffer,
      driveFolderId
    );

    // Calculate total amount
    const betrag = items.reduce((sum, item) => sum + item.gesamtpreis, 0);

    // Save to Einnahmen_Gewerbe sheet
    await saveGewerbeInvoice({
      datumDerZahlung: body.rechnungsdatum,
      betrag,
      beschreibungDerLeistung: items
        .map((i) => i.beschreibung)
        .join("; "),
      nameDesKunden: client.name,
      artDerZahlung: body.artDerZahlung || "Überweisung",
      rechnungsnummer,
      link: driveFile.webViewLink || "",
    });

    return NextResponse.json(
      {
        success: true,
        rechnungsnummer,
        pdfUrl: driveFile.webViewLink,
        betrag,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating invoice:", error);
    return NextResponse.json(
      { error: "Failed to create invoice" },
      { status: 500 }
    );
  }
}
