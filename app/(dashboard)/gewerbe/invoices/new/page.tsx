"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/dashboard/header";
import {
  SectionHeader,
  Breadcrumb,
  Button,
  Input,
  Card,
  HexButton,
} from "@/components/ui";
import { Plus, Trash2, ArrowLeft, Loader2, UserPlus } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { GewerbeClient } from "@/lib/gewerbe/types";

interface LineItem {
  beschreibung: string;
  menge: number;
  einzelpreis: number;
}

export default function NewGewerbeInvoicePage() {
  const router = useRouter();

  const [clients, setClients] = useState<GewerbeClient[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [nextNumber, setNextNumber] = useState<string>("");
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [error, setError] = useState<string>("");

  const [formData, setFormData] = useState({
    selectedKundennummer: "",
    rechnungsdatum: new Date().toISOString().split("T")[0],
    leistungszeitraumStart: "",
    leistungszeitraumEnd: "",
    artDerZahlung: "Überweisung" as "Überweisung" | "Bar" | "PayPal",
  });

  const [newClient, setNewClient] = useState({
    name: "",
    strasse: "",
    adresse: "",
  });

  const [items, setItems] = useState<LineItem[]>([
    { beschreibung: "", menge: 1, einzelpreis: 0 },
  ]);

  useEffect(() => {
    fetchClients();
    fetchNextNumber();
  }, []);

  async function fetchClients() {
    setLoading(true);
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

  async function fetchNextNumber() {
    try {
      const res = await fetch("/api/gewerbe/invoices/next-number");
      if (res.ok) {
        const data = await res.json();
        setNextNumber(data.nextNumber);
      }
    } catch (error) {
      console.error("Error fetching next number:", error);
    }
  }

  function updateItem(index: number, field: keyof LineItem, value: string | number) {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      [field]: value,
    };
    setItems(newItems);
  }

  function addItem() {
    setItems([...items, { beschreibung: "", menge: 1, einzelpreis: 0 }]);
  }

  function removeItem(index: number) {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  }

  const subtotal = items.reduce(
    (sum, item) => sum + item.menge * item.einzelpreis,
    0
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const payload = {
        ...formData,
        isNewClient: showNewClientForm,
        newClient: showNewClientForm ? newClient : undefined,
        items: items.map((item) => ({
          beschreibung: item.beschreibung,
          menge: item.menge,
          einzelpreis: item.einzelpreis,
        })),
      };

      const res = await fetch("/api/gewerbe/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const result = await res.json();
        // Open PDF in new tab
        if (result.pdfUrl) {
          window.open(result.pdfUrl, "_blank");
        }
        router.push("/gewerbe/invoices");
      } else {
        const errorData = await res.json();
        setError(errorData.error || "Fehler beim Erstellen der Rechnung");
      }
    } catch (err) {
      console.error("Error creating invoice:", err);
      setError("Fehler beim Erstellen der Rechnung");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <>
        <Header title="Neue Rechnung" subtitle="Erstelle eine neue Rechnung" />
        <div className="p-6 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-[#E0FF00] animate-spin" />
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="Neue Rechnung" subtitle="Erstelle eine neue Rechnung" />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Breadcrumb
            items={[
              { label: "Dashboard", href: "/" },
              { label: "Gewerbe" },
              { label: "Rechnungen", href: "/gewerbe/invoices" },
              { label: "Neue Rechnung" },
            ]}
          />
          <Button
            variant="secondary"
            onClick={() => router.push("/gewerbe/invoices")}
            icon={<ArrowLeft className="w-4 h-4" />}
            iconPosition="left"
          >
            Zurück
          </Button>
        </div>

        {/* Error Display */}
        {error && (
          <Card>
            <div className="text-red-400">{error}</div>
          </Card>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Invoice Info */}
          <Card>
            <SectionHeader title="Rechnungsdetails" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                  Rechnungs-Nr.
                </label>
                <div className="px-4 py-3 bg-[#1B2124] border border-white/10 text-[#E0FF00] font-mono">
                  {nextNumber || "..."}
                </div>
              </div>
              <Input
                label="Rechnungsdatum"
                type="date"
                value={formData.rechnungsdatum}
                onChange={(e) =>
                  setFormData({ ...formData, rechnungsdatum: e.target.value })
                }
                required
              />
              <Input
                label="Leistungszeitraum Start"
                type="date"
                value={formData.leistungszeitraumStart}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    leistungszeitraumStart: e.target.value,
                  })
                }
                required
              />
              <Input
                label="Leistungszeitraum Ende"
                type="date"
                value={formData.leistungszeitraumEnd}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    leistungszeitraumEnd: e.target.value,
                  })
                }
                required
              />
            </div>
          </Card>

          {/* Client Selection */}
          <Card>
            <SectionHeader
              title="Kunde"
              action={
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowNewClientForm(!showNewClientForm)}
                  icon={<UserPlus className="w-4 h-4" />}
                  iconPosition="left"
                >
                  {showNewClientForm ? "Bestehender Kunde" : "Neuer Kunde"}
                </Button>
              }
            />

            {showNewClientForm ? (
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
            ) : (
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                  Kunde auswählen
                </label>
                <select
                  value={formData.selectedKundennummer}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      selectedKundennummer: e.target.value,
                    })
                  }
                  className="w-full md:w-1/2 px-4 py-3 bg-[#1B2124] border border-white/10 text-white focus:border-[#E0FF00] focus:outline-none transition-colors"
                  required={!showNewClientForm}
                >
                  <option value="">Kunde auswählen...</option>
                  {clients.map((client) => (
                    <option key={client.kundennummer} value={client.kundennummer}>
                      {client.name} ({client.kundennummer})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </Card>

          {/* Line Items */}
          <Card>
            <SectionHeader
              title="Positionen"
              action={
                <HexButton
                  icon={<Plus className="w-4 h-4" />}
                  onClick={addItem}
                  size="sm"
                />
              }
            />
            <div className="space-y-4">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="grid grid-cols-12 gap-4 items-end"
                >
                  <div className="col-span-6">
                    <Input
                      label={index === 0 ? "Beschreibung" : undefined}
                      value={item.beschreibung}
                      onChange={(e) =>
                        updateItem(index, "beschreibung", e.target.value)
                      }
                      placeholder="Leistungsbeschreibung"
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      label={index === 0 ? "Menge" : undefined}
                      type="number"
                      min={1}
                      step={1}
                      value={item.menge}
                      onChange={(e) =>
                        updateItem(index, "menge", parseInt(e.target.value) || 0)
                      }
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      label={index === 0 ? "Einzelpreis" : undefined}
                      type="number"
                      min={0}
                      step={0.01}
                      value={item.einzelpreis}
                      onChange={(e) =>
                        updateItem(
                          index,
                          "einzelpreis",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      required
                    />
                  </div>
                  <div className="col-span-1">
                    <p
                      className={`${
                        index === 0 ? "mt-6" : ""
                      } px-2 py-3 bg-[#1B2124] border border-white/10 text-white text-right text-sm`}
                    >
                      {formatCurrency(item.menge * item.einzelpreis)}
                    </p>
                  </div>
                  <div className="col-span-1">
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className={`${
                        index === 0 ? "mt-6" : ""
                      } p-3 text-gray-500 hover:text-red-500 transition-colors`}
                      disabled={items.length === 1}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="mt-6 pt-6 border-t border-white/10">
              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Zwischensumme</span>
                    <span className="text-gray-300">
                      {formatCurrency(subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">USt. (0% - §19 UStG)</span>
                    <span className="text-gray-300">{formatCurrency(0)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-medium pt-2 border-t border-white/10">
                    <span className="text-white">Gesamtbetrag</span>
                    <span className="text-[#E0FF00]">
                      {formatCurrency(subtotal)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Payment Method */}
          <Card>
            <SectionHeader title="Zahlungsart" />
            <div>
              <select
                value={formData.artDerZahlung}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    artDerZahlung: e.target.value as typeof formData.artDerZahlung,
                  })
                }
                className="w-full md:w-1/4 px-4 py-3 bg-[#1B2124] border border-white/10 text-white focus:border-[#E0FF00] focus:outline-none transition-colors"
              >
                <option value="Überweisung">Überweisung</option>
                <option value="Bar">Bar</option>
                <option value="PayPal">PayPal</option>
              </select>
            </div>
          </Card>

          {/* Submit */}
          <div className="flex gap-2">
            <Button type="submit" loading={submitting}>
              Rechnung erstellen
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.push("/gewerbe/invoices")}
            >
              Abbrechen
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
