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
  Badge,
} from "@/components/ui";
import { ExternalLink, Loader2 } from "lucide-react";
import { formatCurrency, formatDateShort } from "@/lib/utils";
import type { AusgabenRow } from "@/lib/gewerbe/types";

export default function GewerbeExpensesPage() {
  const [expenses, setExpenses] = useState<AusgabenRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExpenses();
  }, []);

  async function fetchExpenses() {
    try {
      const res = await fetch("/api/gewerbe/expenses");
      if (res.ok) {
        const data = await res.json();
        setExpenses(data);
      }
    } catch (error) {
      console.error("Error fetching expenses:", error);
    } finally {
      setLoading(false);
    }
  }

  const totalExpenses = expenses.reduce((sum, e) => sum + e.betrag, 0);

  return (
    <>
      <Header
        title="Gewerbe Ausgaben"
        subtitle="Verwalte deine Ausgaben"
      />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Breadcrumb
            items={[
              { label: "Dashboard", href: "/" },
              { label: "Gewerbe" },
              { label: "Ausgaben" },
            ]}
          />
          <div className="text-right">
            <p className="text-xs text-gray-500">Gesamtausgaben</p>
            <p className="text-lg font-medium text-red-400">
              {formatCurrency(totalExpenses)}
            </p>
          </div>
        </div>

        <Card>
          <SectionHeader title="Alle Ausgaben" />
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-[#E0FF00] animate-spin" />
            </div>
          ) : expenses.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>Noch keine Ausgaben vorhanden.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Datum</TableHead>
                  <TableHead>Dienstleister</TableHead>
                  <TableHead>Beschreibung</TableHead>
                  <TableHead>Zahlungsart</TableHead>
                  <TableHead>Rechnungs-Nr.</TableHead>
                  <TableHead className="text-right">Betrag</TableHead>
                  <TableHead className="text-right">Beleg</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((expense, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      {expense.datumDerZahlung
                        ? formatDateShort(expense.datumDerZahlung)
                        : "-"}
                    </TableCell>
                    <TableCell className="font-medium">
                      {expense.nameDesDienstleisters}
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-gray-400">
                      {expense.beschreibungDesZwecks}
                    </TableCell>
                    <TableCell>{expense.artDerZahlung}</TableCell>
                    <TableCell>
                      {expense.rechnungsnummer ? (
                        <Badge variant="default">{expense.rechnungsnummer}</Badge>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell className="text-right font-medium text-red-400">
                      {formatCurrency(expense.betrag)}
                    </TableCell>
                    <TableCell className="text-right">
                      {expense.link ? (
                        <a
                          href={expense.link}
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
