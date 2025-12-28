import { NextResponse } from "next/server";
import { getGewerbeExpenses } from "@/lib/gewerbe/sheets";

/**
 * GET /api/gewerbe/expenses
 * Returns all Gewerbe expenses from Ausgaben_Gewerbe
 */
export async function GET() {
  try {
    const expenses = await getGewerbeExpenses();
    return NextResponse.json(expenses);
  } catch (error) {
    console.error("Error fetching Gewerbe expenses:", error);
    return NextResponse.json(
      { error: "Failed to fetch expenses" },
      { status: 500 }
    );
  }
}
