"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/dashboard/header";
import {
  SectionHeader,
  Breadcrumb,
  Button,
  Badge,
  Card,
} from "@/components/ui";
import { ArrowLeft, FileText, Download, Send } from "lucide-react";
import { formatDateShort, formatCurrency } from "@/lib/utils";
import type { Invoice } from "@/lib/invoices";

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchInvoice = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/invoices/${params.id}`);
      if (res.ok) setInvoice(await res.json());
    } catch (error) {
      console.error("Error fetching invoice:", error);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchInvoice();
  }, [fetchInvoice]);

  async function updateStatus(status: Invoice["status"]) {
    try {
      const res = await fetch(`/api/invoices/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setInvoice(await res.json());
      }
    } catch (error) {
      console.error("Error updating invoice:", error);
    }
  }

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

  if (loading) {
    return (
      <>
        <Header title="Loading..." />
        <div className="p-6">
          <p className="text-gray-500">Loading invoice details...</p>
        </div>
      </>
    );
  }

  if (!invoice) {
    return (
      <>
        <Header title="Invoice Not Found" />
        <div className="p-6">
          <p className="text-gray-500">Invoice not found</p>
          <Button onClick={() => router.push("/invoices")} className="mt-4">
            Back to Invoices
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      <Header
        title={invoice.invoiceNumber}
        subtitle={invoice.clientName}
      />

      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Breadcrumb
            items={[
              { label: "Dashboard", href: "/" },
              { label: "Invoices", href: "/invoices" },
              { label: invoice.invoiceNumber },
            ]}
          />
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => router.push("/invoices")}
              icon={<ArrowLeft className="w-4 h-4" />}
              iconPosition="left"
            >
              Back
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Invoice Details */}
          <div className="lg:col-span-2">
            <Card>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#1B2124] flex items-center justify-center">
                    <FileText className="w-6 h-6 text-[#E0FF00]" />
                  </div>
                  <div>
                    <h2 className="text-xl font-medium text-white">
                      {invoice.invoiceNumber}
                    </h2>
                    <p className="text-sm text-gray-500">{invoice.clientName}</p>
                  </div>
                </div>
                <Badge variant={getStatusVariant(invoice.status)}>
                  {invoice.status}
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6 pb-6 border-b border-white/10">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">
                    Issue Date
                  </p>
                  <p className="text-sm text-gray-300">
                    {invoice.issueDate
                      ? formatDateShort(invoice.issueDate)
                      : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">
                    Due Date
                  </p>
                  <p className="text-sm text-gray-300">
                    {invoice.dueDate ? formatDateShort(invoice.dueDate) : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">
                    Business
                  </p>
                  <Badge
                    variant={
                      invoice.business === "consultancy" ? "info" : "success"
                    }
                  >
                    {invoice.business}
                  </Badge>
                </div>
              </div>

              {/* Line Items */}
              <SectionHeader title="Line Items" />
              <table className="w-full mb-6">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left text-[10px] font-bold uppercase tracking-widest text-gray-500 pb-3">
                      Description
                    </th>
                    <th className="text-right text-[10px] font-bold uppercase tracking-widest text-gray-500 pb-3">
                      Qty
                    </th>
                    <th className="text-right text-[10px] font-bold uppercase tracking-widest text-gray-500 pb-3">
                      Unit Price
                    </th>
                    <th className="text-right text-[10px] font-bold uppercase tracking-widest text-gray-500 pb-3">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item, index) => (
                    <tr key={index} className="border-b border-white/5">
                      <td className="py-3 text-sm text-gray-300">
                        {item.description}
                      </td>
                      <td className="py-3 text-sm text-gray-300 text-right">
                        {item.quantity}
                      </td>
                      <td className="py-3 text-sm text-gray-300 text-right">
                        {formatCurrency(item.unitPrice)}
                      </td>
                      <td className="py-3 text-sm text-white text-right">
                        {formatCurrency(item.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="text-gray-300">
                      {formatCurrency(invoice.subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Tax</span>
                    <span className="text-gray-300">
                      {formatCurrency(invoice.tax)}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-medium pt-2 border-t border-white/10">
                    <span className="text-white">Total</span>
                    <span className="text-[#E0FF00]">
                      {formatCurrency(invoice.total)}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Actions */}
          <div className="space-y-6">
            <Card>
              <SectionHeader title="Actions" />
              <div className="space-y-3">
                {invoice.status === "draft" && (
                  <Button
                    className="w-full"
                    onClick={() => updateStatus("sent")}
                    icon={<Send className="w-4 h-4" />}
                  >
                    Mark as Sent
                  </Button>
                )}
                {invoice.status === "sent" && (
                  <Button
                    className="w-full"
                    onClick={() => updateStatus("paid")}
                  >
                    Mark as Paid
                  </Button>
                )}
                {invoice.pdfUrl && (
                  <a
                    href={invoice.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Button
                      variant="secondary"
                      className="w-full"
                      icon={<Download className="w-4 h-4" />}
                    >
                      Download PDF
                    </Button>
                  </a>
                )}
              </div>
            </Card>

            <Card>
              <SectionHeader title="Status History" />
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-[#E0FF00]" />
                  <span className="text-gray-300">
                    Created on{" "}
                    {invoice.createdAt
                      ? formatDateShort(invoice.createdAt)
                      : "-"}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
