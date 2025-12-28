import { NextRequest, NextResponse } from "next/server";
import { getClients, createClient, getClientsByBusiness } from "@/lib/clients";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const business = searchParams.get("business") as "consultancy" | "tutoring" | null;

    const clients = business
      ? await getClientsByBusiness(business)
      : await getClients();

    return NextResponse.json(clients);
  } catch (error) {
    console.error("Error fetching clients:", error);
    return NextResponse.json(
      { error: "Failed to fetch clients" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { name, email, phone, company, business, notes } = body;

    if (!name || !business) {
      return NextResponse.json(
        { error: "Name and business are required" },
        { status: 400 }
      );
    }

    const client = await createClient({
      name,
      email: email || "",
      phone: phone || "",
      company: company || "",
      business,
      notes: notes || "",
    });

    return NextResponse.json(client, { status: 201 });
  } catch (error) {
    console.error("Error creating client:", error);
    return NextResponse.json(
      { error: "Failed to create client" },
      { status: 500 }
    );
  }
}
