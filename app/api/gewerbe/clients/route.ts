import { NextRequest, NextResponse } from "next/server";
import { getGewerbeClients, addGewerbeClient } from "@/lib/gewerbe/sheets";

/**
 * GET /api/gewerbe/clients
 * Returns all Gewerbe clients from Kunden tab
 */
export async function GET() {
  try {
    const clients = await getGewerbeClients();
    return NextResponse.json(clients);
  } catch (error) {
    console.error("Error fetching Gewerbe clients:", error);
    return NextResponse.json(
      { error: "Failed to fetch clients" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/gewerbe/clients
 * Add a new Gewerbe client
 * Body: { name, strasse, adresse }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.strasse || !body.adresse) {
      return NextResponse.json(
        { error: "Missing required fields: name, strasse, adresse" },
        { status: 400 }
      );
    }

    const newClient = await addGewerbeClient({
      name: body.name,
      strasse: body.strasse,
      adresse: body.adresse,
    });

    return NextResponse.json(newClient, { status: 201 });
  } catch (error) {
    console.error("Error creating Gewerbe client:", error);
    return NextResponse.json(
      { error: "Failed to create client" },
      { status: 500 }
    );
  }
}
