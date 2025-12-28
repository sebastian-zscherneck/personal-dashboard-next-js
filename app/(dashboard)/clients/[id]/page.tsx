"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/dashboard/header";
import {
  SectionHeader,
  Breadcrumb,
  Button,
  Input,
  Badge,
  Card,
} from "@/components/ui";
import { Mail, Phone, Building, FileText, ArrowLeft } from "lucide-react";
import type { Client } from "@/lib/clients";
import type { Invoice } from "@/lib/invoices";

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [client, setClient] = useState<Client | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Client>>({});

  const fetchClient = useCallback(async () => {
    setLoading(true);
    try {
      const [clientRes, invoicesRes] = await Promise.all([
        fetch(`/api/clients/${params.id}`),
        fetch(`/api/invoices?clientId=${params.id}`),
      ]);

      if (clientRes.ok) {
        const clientData = await clientRes.json();
        setClient(clientData);
        setFormData(clientData);
      }
      if (invoicesRes.ok) setInvoices(await invoicesRes.json());
    } catch (error) {
      console.error("Error fetching client:", error);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchClient();
  }, [fetchClient]);

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch(`/api/clients/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setClient(await res.json());
        setEditing(false);
      }
    } catch (error) {
      console.error("Error updating client:", error);
    }
  }

  if (loading) {
    return (
      <>
        <Header title="Loading..." />
        <div className="p-6">
          <p className="text-gray-500">Loading client details...</p>
        </div>
      </>
    );
  }

  if (!client) {
    return (
      <>
        <Header title="Client Not Found" />
        <div className="p-6">
          <p className="text-gray-500">Client not found</p>
          <Button onClick={() => router.push("/clients")} className="mt-4">
            Back to Clients
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title={client.name} subtitle={client.company || undefined} />

      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Breadcrumb
            items={[
              { label: "Dashboard", href: "/" },
              { label: "Clients", href: "/clients" },
              { label: client.name },
            ]}
          />
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => router.push("/clients")}
              icon={<ArrowLeft className="w-4 h-4" />}
              iconPosition="left"
            >
              Back
            </Button>
            <Button onClick={() => setEditing(!editing)}>
              {editing ? "Cancel" : "Edit"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Client Info */}
          <div className="lg:col-span-2">
            <Card>
              <SectionHeader title="Client Details" />
              {editing ? (
                <form onSubmit={handleUpdate} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Name"
                      value={formData.name || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                    <Input
                      label="Email"
                      type="email"
                      value={formData.email || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                    <Input
                      label="Phone"
                      value={formData.phone || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                    />
                    <Input
                      label="Company"
                      value={formData.company || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, company: e.target.value })
                      }
                    />
                  </div>
                  <Button type="submit">Save Changes</Button>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">
                        Email
                      </p>
                      <p className="text-sm text-gray-300 flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        {client.email || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">
                        Phone
                      </p>
                      <p className="text-sm text-gray-300 flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        {client.phone || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">
                        Company
                      </p>
                      <p className="text-sm text-gray-300 flex items-center gap-2">
                        <Building className="w-4 h-4" />
                        {client.company || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">
                        Business
                      </p>
                      <Badge
                        variant={
                          client.business === "consultancy" ? "info" : "success"
                        }
                      >
                        {client.business}
                      </Badge>
                    </div>
                  </div>
                  {client.notes && (
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">
                        Notes
                      </p>
                      <p className="text-sm text-gray-300">{client.notes}</p>
                    </div>
                  )}
                </div>
              )}
            </Card>
          </div>

          {/* Invoices */}
          <div>
            <Card>
              <SectionHeader
                title="Invoices"
                action={
                  <Link
                    href={`/invoices/new?clientId=${client.id}`}
                    className="text-[10px] text-gray-500 hover:text-[#E0FF00] transition-colors"
                  >
                    + New
                  </Link>
                }
              />
              {invoices.length === 0 ? (
                <p className="text-sm text-gray-500">No invoices yet</p>
              ) : (
                <div className="space-y-2">
                  {invoices.map((invoice) => (
                    <Link
                      key={invoice.id}
                      href={`/invoices/${invoice.id}`}
                      className="flex items-center justify-between p-3 bg-[#1B2124] border border-white/5 hover:border-white/10 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-300">
                          {invoice.invoiceNumber}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-white">
                          €{invoice.total.toFixed(2)}
                        </p>
                        <p
                          className={`text-xs ${
                            invoice.status === "paid"
                              ? "text-green-500"
                              : invoice.status === "overdue"
                              ? "text-red-500"
                              : "text-gray-500"
                          }`}
                        >
                          {invoice.status}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
