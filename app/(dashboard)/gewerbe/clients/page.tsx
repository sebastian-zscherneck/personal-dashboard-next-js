"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/dashboard/header";
import {
  SectionHeader,
  Breadcrumb,
  Card,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  HexButton,
  Button,
  Input,
  Badge,
} from "@/components/ui";
import { Plus, Loader2, X } from "lucide-react";
import type { GewerbeClient } from "@/lib/gewerbe/types";

export default function GewerbeClientsPage() {
  const [clients, setClients] = useState<GewerbeClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [newClient, setNewClient] = useState({
    name: "",
    strasse: "",
    adresse: "",
  });

  useEffect(() => {
    fetchClients();
  }, []);

  async function fetchClients() {
    try {
      const res = await fetch("/api/gewerbe/clients");
      if (res.ok) {
        const data = await res.json();
        setClients(data);
      }
    } catch (error) {
      console.error("Error fetching clients:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/gewerbe/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newClient),
      });

      if (res.ok) {
        const created = await res.json();
        setClients([...clients, created]);
        setNewClient({ name: "", strasse: "", adresse: "" });
        setShowForm(false);
      } else {
        const error = await res.json();
        alert(`Fehler: ${error.error}`);
      }
    } catch (error) {
      console.error("Error creating client:", error);
      alert("Fehler beim Erstellen des Kunden");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Header
        title="Gewerbe Kunden"
        subtitle="Verwalte deine Kunden für Selbstständigkeit"
      />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Breadcrumb
            items={[
              { label: "Dashboard", href: "/" },
              { label: "Gewerbe" },
              { label: "Kunden" },
            ]}
          />
          <HexButton
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setShowForm(!showForm)}
          >
            Neuer Kunde
          </HexButton>
        </div>

        {/* New Client Form */}
        {showForm && (
          <Card>
            <SectionHeader
              title="Neuen Kunden anlegen"
              action={
                <button
                  onClick={() => setShowForm(false)}
                  className="text-gray-500 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              }
            />
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Name / Firma"
                  value={newClient.name}
                  onChange={(e) =>
                    setNewClient({ ...newClient, name: e.target.value })
                  }
                  placeholder="Max Mustermann GmbH"
                  required
                />
                <Input
                  label="Straße"
                  value={newClient.strasse}
                  onChange={(e) =>
                    setNewClient({ ...newClient, strasse: e.target.value })
                  }
                  placeholder="Musterstraße 123"
                  required
                />
                <Input
                  label="PLZ / Stadt"
                  value={newClient.adresse}
                  onChange={(e) =>
                    setNewClient({ ...newClient, adresse: e.target.value })
                  }
                  placeholder="12345 Musterstadt"
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" loading={submitting}>
                  Kunde anlegen
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowForm(false)}
                >
                  Abbrechen
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Clients List */}
        <Card>
          <SectionHeader title="Alle Kunden" />
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-[#E0FF00] animate-spin" />
            </div>
          ) : clients.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>Noch keine Kunden vorhanden.</p>
              <button
                onClick={() => setShowForm(true)}
                className="text-[#E0FF00] hover:underline mt-2 inline-block"
              >
                Lege deinen ersten Kunden an
              </button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kundennummer</TableHead>
                  <TableHead>Name / Firma</TableHead>
                  <TableHead>Straße</TableHead>
                  <TableHead>PLZ / Stadt</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((client) => (
                  <TableRow key={client.kundennummer}>
                    <TableCell>
                      <Badge variant="default">{client.kundennummer}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{client.name}</TableCell>
                    <TableCell className="text-gray-400">
                      {client.strasse}
                    </TableCell>
                    <TableCell className="text-gray-400">
                      {client.adresse}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      </div>
    </>
  );
}
