"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/dashboard/header";
import { StatCard, ActionCard, SectionHeader } from "@/components/ui";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { ProfitChart } from "@/components/dashboard/profit-chart";
import {
  Users,
  FileText,
  ArrowRight,
} from "lucide-react";
import type { GewerbeClient, EinnahmenRow, AusgabenRow } from "@/lib/gewerbe/types";

export default function DashboardPage() {
  const [clients, setClients] = useState<GewerbeClient[]>([]);
  const [invoices, setInvoices] = useState<EinnahmenRow[]>([]);
  const [expenses, setExpenses] = useState<AusgabenRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [clientsRes, invoicesRes, expensesRes] = await Promise.all([
          fetch("/api/gewerbe/clients"),
          fetch("/api/gewerbe/invoices"),
          fetch("/api/gewerbe/expenses"),
        ]);

        if (clientsRes.ok) setClients(await clientsRes.json());
        if (invoicesRes.ok) setInvoices(await invoicesRes.json());
        if (expensesRes.ok) setExpenses(await expensesRes.json());
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const totalRevenue = invoices.reduce((sum, i) => sum + i.betrag, 0);
  const recentClients = clients.slice(0, 5);
  const recentInvoices = invoices.slice(0, 5);

  return (
    <>
      <Header
        title="Dashboard"
        subtitle="Übersicht deines Gewerbes"
      />

      <div className="p-6 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Kunden"
            value={loading ? "-" : clients.length}
          />
          <StatCard
            label="Rechnungen"
            value={loading ? "-" : invoices.length}
          />
          <StatCard
            label="Gesamteinnahmen"
            value={loading ? "-" : totalRevenue.toFixed(2) + " "}
            suffix="€"
          />
          <StatCard
            label="Ø pro Rechnung"
            value={loading || invoices.length === 0 ? "-" : (totalRevenue / invoices.length).toFixed(2) + " "}
            suffix="€"
          />
        </div>

        {/* Charts - Revenue and Profit side by side */}
        {!loading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <RevenueChart invoices={invoices} />
            <ProfitChart invoices={invoices} expenses={expenses} />
          </div>
        )}

        {/* Quick Actions */}
        <div>
          <SectionHeader title="Schnellzugriff" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/gewerbe/invoices/new">
              <ActionCard title="Neue Rechnung" />
            </Link>
            <Link href="/gewerbe/clients">
              <ActionCard title="Kunden" />
            </Link>
            <Link href="/gewerbe/invoices">
              <ActionCard title="Rechnungen" />
            </Link>
            <Link href="/drive">
              <ActionCard title="Google Drive" />
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Clients */}
          <div>
            <SectionHeader
              title="Letzte Kunden"
              action={
                <Link
                  href="/gewerbe/clients"
                  className="text-[10px] text-gray-500 hover:text-[#E0FF00] transition-colors flex items-center gap-1"
                >
                  Alle anzeigen <ArrowRight className="w-3 h-3" />
                </Link>
              }
            />
            <div className="space-y-2">
              {loading ? (
                <p className="text-sm text-gray-500">Laden...</p>
              ) : recentClients.length === 0 ? (
                <p className="text-sm text-gray-500">Noch keine Kunden</p>
              ) : (
                recentClients.map((client) => (
                  <div
                    key={client.kundennummer}
                    className="flex items-center justify-between p-3 bg-[#0F0F0F] border border-white/5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#1B2124] flex items-center justify-center">
                        <Users className="w-4 h-4 text-gray-500" />
                      </div>
                      <div>
                        <p className="text-sm text-white">{client.name}</p>
                        <p className="text-xs text-gray-500">
                          Nr. {client.kundennummer}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Invoices */}
          <div>
            <SectionHeader
              title="Letzte Rechnungen"
              action={
                <Link
                  href="/gewerbe/invoices"
                  className="text-[10px] text-gray-500 hover:text-[#E0FF00] transition-colors flex items-center gap-1"
                >
                  Alle anzeigen <ArrowRight className="w-3 h-3" />
                </Link>
              }
            />
            <div className="space-y-2">
              {loading ? (
                <p className="text-sm text-gray-500">Laden...</p>
              ) : recentInvoices.length === 0 ? (
                <p className="text-sm text-gray-500">Noch keine Rechnungen</p>
              ) : (
                recentInvoices.map((invoice) => (
                  <div
                    key={invoice.rechnungsnummer}
                    className="flex items-center justify-between p-3 bg-[#0F0F0F] border border-white/5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#1B2124] flex items-center justify-center">
                        <FileText className="w-4 h-4 text-gray-500" />
                      </div>
                      <div>
                        <p className="text-sm text-white">
                          Rechnung {invoice.rechnungsnummer}
                        </p>
                        <p className="text-xs text-gray-500">
                          {invoice.nameDesKunden}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-[#E0FF00]">
                        {invoice.betrag.toLocaleString("de-DE", { minimumFractionDigits: 2 })} €
                      </p>
                      <p className="text-xs text-gray-500">
                        {invoice.datumDerZahlung}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
