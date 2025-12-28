import { NextRequest, NextResponse } from "next/server";
import {
  getInvoices,
  createInvoice,
  getInvoicesByBusiness,
  getInvoicesByClient,
  generateInvoiceNumber,
} from "@/lib/invoices";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const business = searchParams.get("business") as "consultancy" | "tutoring" | null;
    const clientId = searchParams.get("clientId");

    let invoices;

    if (clientId) {
      invoices = await getInvoicesByClient(clientId);
    } else if (business) {
      invoices = await getInvoicesByBusiness(business);
    } else {
      invoices = await getInvoices();
    }

    return NextResponse.json(invoices);
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return NextResponse.json(
      { error: "Failed to fetch invoices" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      clientId,
      clientName,
      business,
      issueDate,
      dueDate,
      items,
      subtotal,
      tax,
      total,
      status,
    } = body;

    if (!clientId || !clientName || !business) {
      return NextResponse.json(
        { error: "Client ID, client name, and business are required" },
        { status: 400 }
      );
    }

    const invoice = await createInvoice({
      invoiceNumber: generateInvoiceNumber(business),
      clientId,
      clientName,
      business,
      issueDate: issueDate || new Date().toISOString().split("T")[0],
      dueDate: dueDate || "",
      items: items || [],
      subtotal: subtotal || 0,
      tax: tax || 0,
      total: total || 0,
      status: status || "draft",
    });

    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    console.error("Error creating invoice:", error);
    return NextResponse.json(
      { error: "Failed to create invoice" },
      { status: 500 }
    );
  }
}
