"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Header } from "@/components/dashboard/header";
import {
  SectionHeader,
  Button,
  Badge,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui";
import { useBusiness } from "@/components/dashboard/business-context";
import { Plus, Search, FileText, ExternalLink } from "lucide-react";
import { formatDateShort, formatCurrency } from "@/lib/utils";
import type { Invoice } from "@/lib/invoices";

export default function InvoicesPage() {
  const { business } = useBusiness();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const businessParam = business !== "all" ? `?business=${business}` : "";
      const res = await fetch(`/api/invoices${businessParam}`);
      if (res.ok) setInvoices(await res.json());
    } catch (error) {
      console.error("Error fetching invoices:", error);
    } finally {
      setLoading(false);
    }
  }, [business]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const filteredInvoices = invoices.filter((i) => {
    const matchesSearch =
      i.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      i.clientName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || i.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "paid":
        return "success";
      case "sent":
        return "info";
      case "overdue":
        return "error";
      default:
        return "default";
    }
  };

  return (
    <>
      <Header title="Invoices" subtitle="Manage your invoices" />

      <div className="p-6 space-y-6">
        {/* Actions Bar */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search invoices..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#1B2124] border border-white/10 text-white text-sm placeholder-gray-500 focus:border-[#E0FF00] focus:outline-none transition-colors"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-[#1B2124] border border-white/10 text-white text-sm focus:border-[#E0FF00] focus:outline-none transition-colors"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
          <Link href="/invoices/new">
            <Button icon={<Plus className="w-4 h-4" />}>New Invoice</Button>
          </Link>
        </div>

        {/* Invoices Table */}
        <div className="bg-[#0F0F0F] border border-white/5 p-6">
          <SectionHeader title="All Invoices" />
          {loading ? (
            <p className="text-gray-500">Loading...</p>
          ) : filteredInvoices.length === 0 ? (
            <p className="text-gray-500">No invoices found</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow hoverable={false}>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell>
                      <Link
                        href={`/invoices/${invoice.id}`}
                        className="text-white hover:text-[#E0FF00] transition-colors flex items-center gap-2"
                      >
                        <FileText className="w-4 h-4" />
                        {invoice.invoiceNumber}
                      </Link>
                    </TableCell>
                    <TableCell>{invoice.clientName}</TableCell>
                    <TableCell>
                      {invoice.issueDate
                        ? formatDateShort(invoice.issueDate)
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {invoice.dueDate
                        ? formatDateShort(invoice.dueDate)
                        : "-"}
                    </TableCell>
                    <TableCell className="text-white font-medium">
                      {formatCurrency(invoice.total)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(invoice.status)}>
                        {invoice.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {invoice.pdfUrl && (
                        <a
                          href={invoice.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-500 hover:text-[#E0FF00] transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
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
