import { NextResponse } from "next/server";
import { getNextInvoiceNumber } from "@/lib/gewerbe/sheets";

/**
 * GET /api/gewerbe/invoices/next-number
 * Returns the next available invoice number
 */
export async function GET() {
  try {
    const nextNumber = await getNextInvoiceNumber();
    return NextResponse.json({ nextNumber });
  } catch (error) {
    console.error("Error getting next invoice number:", error);
    return NextResponse.json(
      { error: "Failed to get next invoice number" },
      { status: 500 }
    );
  }
}
