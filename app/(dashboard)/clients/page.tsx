"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Header } from "@/components/dashboard/header";
import {
  SectionHeader,
  Button,
  Input,
  Badge,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui";
import { useBusiness } from "@/components/dashboard/business-context";
import { Plus, Search, Mail, Phone, Building } from "lucide-react";
import type { Client } from "@/lib/clients";

export default function ClientsPage() {
  const { business } = useBusiness();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    business: "consultancy" as "consultancy" | "tutoring",
    notes: "",
  });

  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const businessParam = business !== "all" ? `?business=${business}` : "";
      const res = await fetch(`/api/clients${businessParam}`);
      if (res.ok) setClients(await res.json());
    } catch (error) {
      console.error("Error fetching clients:", error);
    } finally {
      setLoading(false);
    }
  }, [business]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setShowForm(false);
        setFormData({
          name: "",
          email: "",
          phone: "",
          company: "",
          business: "consultancy",
          notes: "",
        });
        fetchClients();
      }
    } catch (error) {
      console.error("Error creating client:", error);
    }
  }

  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.company.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Header title="Clients" subtitle="Manage your clients" />

      <div className="p-6 space-y-6">
        {/* Actions Bar */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search clients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#1B2124] border border-white/10 text-white text-sm placeholder-gray-500 focus:border-[#E0FF00] focus:outline-none transition-colors"
            />
          </div>
          <Button onClick={() => setShowForm(true)} icon={<Plus className="w-4 h-4" />}>
            Add Client
          </Button>
        </div>

        {/* Add Client Form */}
        {showForm && (
          <div className="bg-[#0F0F0F] border border-white/10 p-6">
            <SectionHeader title="New Client" />
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
                <Input
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
                <Input
                  label="Phone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
                <Input
                  label="Company"
                  value={formData.company}
                  onChange={(e) =>
                    setFormData({ ...formData, company: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                  Business
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, business: "consultancy" })
                    }
                    className={`px-4 py-2 text-xs font-bold uppercase tracking-tight border transition-colors ${
                      formData.business === "consultancy"
                        ? "bg-[#E0FF00] text-black border-[#E0FF00]"
                        : "bg-transparent text-gray-400 border-white/10 hover:border-white/20"
                    }`}
                  >
                    Consultancy
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, business: "tutoring" })
                    }
                    className={`px-4 py-2 text-xs font-bold uppercase tracking-tight border transition-colors ${
                      formData.business === "tutoring"
                        ? "bg-[#E0FF00] text-black border-[#E0FF00]"
                        : "bg-transparent text-gray-400 border-white/10 hover:border-white/20"
                    }`}
                  >
                    Tutoring
                  </button>
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit">Save Client</Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Clients Table */}
        <div className="bg-[#0F0F0F] border border-white/5 p-6">
          <SectionHeader title="All Clients" />
          {loading ? (
            <p className="text-gray-500">Loading...</p>
          ) : filteredClients.length === 0 ? (
            <p className="text-gray-500">No clients found</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow hoverable={false}>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Business</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell>
                      <Link
                        href={`/clients/${client.id}`}
                        className="text-white hover:text-[#E0FF00] transition-colors"
                      >
                        {client.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-4">
                        {client.email && (
                          <span className="flex items-center gap-1 text-xs">
                            <Mail className="w-3 h-3" />
                            {client.email}
                          </span>
                        )}
                        {client.phone && (
                          <span className="flex items-center gap-1 text-xs">
                            <Phone className="w-3 h-3" />
                            {client.phone}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {client.company && (
                        <span className="flex items-center gap-1">
                          <Building className="w-3 h-3" />
                          {client.company}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          client.business === "consultancy" ? "info" : "success"
                        }
                      >
                        {client.business}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </>
  );
}
