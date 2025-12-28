"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
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
  Badge,
} from "@/components/ui";
import { Plus, ExternalLink, Loader2 } from "lucide-react";
import { formatCurrency, formatDateShort } from "@/lib/utils";
import type { EinnahmenRow } from "@/lib/gewerbe/types";

export default function GewerbeInvoicesPage() {
  const [invoices, setInvoices] = useState<EinnahmenRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInvoices = useCallback(async () => {
    try {
      const res = await fetch("/api/gewerbe/invoices");
      if (res.ok) {
        const data = await res.json();
        setInvoices(data);
      }
    } catch (error) {
      console.error("Error fetching invoices:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  return (
    <>
      <Header
        title="Gewerbe Rechnungen"
        subtitle="Verwalte deine Rechnungen für Selbstständigkeit"
      />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Breadcrumb
            items={[
              { label: "Dashboard", href: "/" },
              { label: "Gewerbe" },
              { label: "Rechnungen" },
            ]}
          />
          <Link href="/gewerbe/invoices/new">
            <HexButton icon={<Plus className="w-4 h-4" />}>
              Neue Rechnung
            </HexButton>
          </Link>
        </div>

        <Card>
          <SectionHeader title="Alle Rechnungen" />
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-[#E0FF00] animate-spin" />
            </div>
          ) : invoices.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>Noch keine Rechnungen vorhanden.</p>
              <Link
                href="/gewerbe/invoices/new"
                className="text-[#E0FF00] hover:underline mt-2 inline-block"
              >
                Erstelle deine erste Rechnung
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rechnungs-Nr.</TableHead>
                  <TableHead>Datum</TableHead>
                  <TableHead>Kunde</TableHead>
                  <TableHead>Beschreibung</TableHead>
                  <TableHead>Zahlungsart</TableHead>
                  <TableHead className="text-right">Betrag</TableHead>
                  <TableHead className="text-right ">PDF</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice, index) => (
                  <TableRow key={index}>
                    <TableCell className="pl-2">
                      <Badge variant="info">{invoice.rechnungsnummer}</Badge>
                    </TableCell>
                    <TableCell>
                      {invoice.datumDerZahlung
                        ? formatDateShort(invoice.datumDerZahlung)
                        : "-"}
                    </TableCell>
                    <TableCell className="font-medium">
                      {invoice.nameDesKunden}
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-gray-400">
                      {invoice.beschreibungDerLeistung}
                    </TableCell>
                    <TableCell>{invoice.artDerZahlung}</TableCell>
                    <TableCell className="text-right font-medium text-[#E0FF00]">
                      {formatCurrency(invoice.betrag)}
                    </TableCell>
                    <TableCell className="text-right">
                      {invoice.link ? (
                        <a
                          href={invoice.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-gray-400 hover:text-[#E0FF00] transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      ) : (
                        <span className="text-gray-600">-</span>
                      )}
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
