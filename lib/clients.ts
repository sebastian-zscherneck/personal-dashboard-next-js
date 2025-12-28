import { readSheet, appendToSheet, updateSheet } from "./google";
import { generateId } from "./utils";

const SHEET_ID = process.env.GOOGLE_SHEET_ID!;
const CLIENTS_RANGE = "Clients!A:H";

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  business: "consultancy" | "tutoring";
  notes: string;
  createdAt: string;
}

export async function getClients(): Promise<Client[]> {
  const rows = await readSheet(SHEET_ID, CLIENTS_RANGE);

  // Skip header row
  return rows.slice(1).map((row) => ({
    id: row[0] || "",
    name: row[1] || "",
    email: row[2] || "",
    phone: row[3] || "",
    company: row[4] || "",
    business: (row[5] as "consultancy" | "tutoring") || "consultancy",
    notes: row[6] || "",
    createdAt: row[7] || "",
  }));
}

export async function getClientById(id: string): Promise<Client | null> {
  const clients = await getClients();
  return clients.find((c) => c.id === id) || null;
}

export async function createClient(
  data: Omit<Client, "id" | "createdAt">
): Promise<Client> {
  const client: Client = {
    ...data,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };

  await appendToSheet(SHEET_ID, CLIENTS_RANGE, [
    [
      client.id,
      client.name,
      client.email,
      client.phone,
      client.company,
      client.business,
      client.notes,
      client.createdAt,
    ],
  ]);

  return client;
}

export async function updateClient(
  id: string,
  data: Partial<Omit<Client, "id" | "createdAt">>
): Promise<Client | null> {
  const clients = await getClients();
  const index = clients.findIndex((c) => c.id === id);

  if (index === -1) return null;

  const updated = { ...clients[index], ...data };

  // Update the row (index + 2 because of header and 1-indexed)
  await updateSheet(SHEET_ID, `Clients!A${index + 2}:H${index + 2}`, [
    [
      updated.id,
      updated.name,
      updated.email,
      updated.phone,
      updated.company,
      updated.business,
      updated.notes,
      updated.createdAt,
    ],
  ]);

  return updated;
}

export async function getClientsByBusiness(
  business: "consultancy" | "tutoring"
): Promise<Client[]> {
  const clients = await getClients();
  return clients.filter((c) => c.business === business);
}
