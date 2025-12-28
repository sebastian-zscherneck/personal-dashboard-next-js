"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Header } from "@/components/dashboard/header";
import {
  SectionHeader,
  Breadcrumb,
  Button,
  Input,
  Card,
  HexButton,
} from "@/components/ui";
import { Plus, Trash2, ArrowLeft, Loader2 } from "lucide-react";
import type { Client } from "@/lib/clients";

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

function NewInvoiceForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedClientId = searchParams.get("clientId");

  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    clientId: preselectedClientId || "",
    clientName: "",
    business: "consultancy" as "consultancy" | "tutoring",
    issueDate: new Date().toISOString().split("T")[0],
    dueDate: "",
    status: "draft" as "draft" | "sent" | "paid" | "overdue",
  });
  const [items, setItems] = useState<InvoiceItem[]>([
    { description: "", quantity: 1, unitPrice: 0, total: 0 },
  ]);

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    if (preselectedClientId && clients.length > 0) {
      const client = clients.find((c) => c.id === preselectedClientId);
      if (client) {
        setFormData((prev) => ({
          ...prev,
          clientId: client.id,
          clientName: client.name,
          business: client.business,
        }));
      }
    }
  }, [preselectedClientId, clients]);

  async function fetchClients() {
    try {
      const res = await fetch("/api/clients");
      if (res.ok) setClients(await res.json());
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
  }

  function handleClientChange(clientId: string) {
    const client = clients.find((c) => c.id === clientId);
    if (client) {
      setFormData({
        ...formData,
        clientId: client.id,
        clientName: client.name,
        business: client.business,
      });
    }
  }

  function updateItem(index: number, field: keyof InvoiceItem, value: string | number) {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      [field]: value,
    };
    newItems[index].total =
      newItems[index].quantity * newItems[index].unitPrice;
    setItems(newItems);
  }

  function addItem() {
    setItems([...items, { description: "", quantity: 1, unitPrice: 0, total: 0 }]);
  }

  function removeItem(index: number) {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  }

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const tax = subtotal * 0.19;
  const total = subtotal + tax;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          items,
          subtotal,
          tax,
          total,
        }),
      });

      if (res.ok) {
        const invoice = await res.json();
        router.push(`/invoices/${invoice.id}`);
      }
    } catch (error) {
      console.error("Error creating invoice:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/" },
            { label: "Invoices", href: "/invoices" },
            { label: "New Invoice" },
          ]}
        />
        <Button
          variant="secondary"
          onClick={() => router.push("/invoices")}
          icon={<ArrowLeft className="w-4 h-4" />}
          iconPosition="left"
        >
          Back
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <SectionHeader title="Invoice Details" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                Client
              </label>
              <select
                value={formData.clientId}
                onChange={(e) => handleClientChange(e.target.value)}
                className="w-full px-4 py-3 bg-[#1B2124] border border-white/10 text-white focus:border-[#E0FF00] focus:outline-none transition-colors"
                required
              >
                <option value="">Select client...</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="Issue Date"
              type="date"
              value={formData.issueDate}
              onChange={(e) =>
                setFormData({ ...formData, issueDate: e.target.value })
              }
              required
            />
            <Input
              label="Due Date"
              type="date"
              value={formData.dueDate}
              onChange={(e) =>
                setFormData({ ...formData, dueDate: e.target.value })
              }
            />
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as typeof formData.status,
                  })
                }
                className="w-full px-4 py-3 bg-[#1B2124] border border-white/10 text-white focus:border-[#E0FF00] focus:outline-none transition-colors"
              >
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
          </div>
        </Card>

        <Card>
          <SectionHeader
            title="Line Items"
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
                <div className="col-span-5">
                  <Input
                    label={index === 0 ? "Description" : undefined}
                    value={item.description}
                    onChange={(e) =>
                      updateItem(index, "description", e.target.value)
                    }
                    placeholder="Service description"
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    label={index === 0 ? "Qty" : undefined}
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) =>
                      updateItem(index, "quantity", parseInt(e.target.value) || 0)
                    }
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    label={index === 0 ? "Unit Price" : undefined}
                    type="number"
                    min={0}
                    step={0.01}
                    value={item.unitPrice}
                    onChange={(e) =>
                      updateItem(index, "unitPrice", parseFloat(e.target.value) || 0)
                    }
                  />
                </div>
                <div className="col-span-2">
                  <p
                    className={`${
                      index === 0 ? "mt-6" : ""
                    } px-4 py-3 bg-[#1B2124] border border-white/10 text-white text-right`}
                  >
                    €{item.total.toFixed(2)}
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

          <div className="mt-6 pt-6 border-t border-white/10">
            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="text-gray-300">€{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tax (19%)</span>
                  <span className="text-gray-300">€{tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-medium pt-2 border-t border-white/10">
                  <span className="text-white">Total</span>
                  <span className="text-[#E0FF00]">€{total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="flex gap-2">
          <Button type="submit" loading={loading}>
            Create Invoice
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push("/invoices")}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="p-6 flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-[#E0FF00] animate-spin" />
    </div>
  );
}

export default function NewInvoicePage() {
  return (
    <>
      <Header title="New Invoice" subtitle="Create a new invoice" />
      <Suspense fallback={<LoadingFallback />}>
        <NewInvoiceForm />
      </Suspense>
    </>
  );
}
