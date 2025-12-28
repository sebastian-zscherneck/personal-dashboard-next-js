import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import type { GewerbeInvoiceData, SenderInfo, TaxConfig } from "./types";
import { getSenderInfo, getTaxConfig } from "./types";

// Use built-in Helvetica font (no external loading required)
const styles = StyleSheet.create({
  page: {
    padding: 50,
    paddingBottom: 100,
    fontFamily: "Helvetica",
    fontSize: 10,
    lineHeight: 1.5,
    color: "#1a1a1a",
  },
  // Header line (sender compact)
  headerLine: {
    fontSize: 8,
    color: "#666",
    marginBottom: 30,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingBottom: 5,
  },
  // Recipient address block
  recipient: {
    marginBottom: 20,
  },
  recipientName: {
    fontFamily: "Helvetica-Bold",
    marginBottom: 2,
  },
  // Invoice details (right side)
  detailsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  detailsLeft: {
    width: "50%",
  },
  detailsRight: {
    width: "45%",
    textAlign: "right",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 3,
  },
  detailLabel: {
    width: 120,
    textAlign: "left",
  },
  detailValue: {
    width: 100,
    textAlign: "left",
  },
  // Title
  title: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    marginBottom: 20,
  },
  // Greeting
  greeting: {
    marginBottom: 20,
  },
  // Items table
  table: {
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 2,
    borderBottomColor: "#333",
    paddingBottom: 5,
    marginBottom: 5,
    fontFamily: "Helvetica-Bold",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingVertical: 5,
  },
  colPos: {
    width: "8%",
  },
  colDesc: {
    width: "42%",
  },
  colMenge: {
    width: "12%",
    textAlign: "center",
  },
  colEinzel: {
    width: "18%",
    textAlign: "right",
  },
  colGesamt: {
    width: "20%",
    textAlign: "right",
  },
  // Totals
  totalsContainer: {
    marginTop: 20,
    alignItems: "flex-end",
  },
  totalsRow: {
    flexDirection: "row",
    width: 200,
    justifyContent: "space-between",
    marginBottom: 3,
  },
  totalsLabel: {
    textAlign: "left",
  },
  totalsValue: {
    textAlign: "right",
  },
  grandTotal: {
    fontFamily: "Helvetica-Bold",
    fontSize: 12,
    marginTop: 5,
    paddingTop: 5,
    borderTopWidth: 2,
    borderTopColor: "#333",
  },
  // Kleinunternehmer notice
  kleinunternehmerNotice: {
    marginTop: 20,
    fontSize: 8,
    color: "#666",
  },
  // Signature
  signature: {
    marginTop: 40,
  },
  // Footer
  footer: {
    position: "absolute",
    bottom: 30,
    left: 50,
    right: 50,
    borderTopWidth: 1,
    borderTopColor: "#ccc",
    paddingTop: 10,
    fontSize: 8,
    color: "#666",
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  footerCol: {
    width: "33%",
  },
  pageNumber: {
    position: "absolute",
    bottom: 15,
    left: 50,
    fontSize: 8,
    color: "#999",
  },
});

// Format date to German format
function formatDateDE(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// Format currency to German format
function formatCurrencyDE(amount: number): string {
  return (
    amount.toLocaleString("de-DE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + " \u20AC"
  );
}

interface InvoicePDFProps {
  data: GewerbeInvoiceData;
  senderInfo?: SenderInfo;
  taxConfig?: TaxConfig;
}

export function InvoicePDF({ data, senderInfo, taxConfig }: InvoicePDFProps) {
  // Use provided values or get from environment
  const sender = senderInfo || getSenderInfo();
  const tax = taxConfig || getTaxConfig();

  const subtotal = data.items.reduce((sum, item) => sum + item.gesamtpreis, 0);
  const taxAmount = subtotal * (tax.rate / 100);
  const total = subtotal + taxAmount;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Sender header line */}
        <Text style={styles.headerLine}>
          {sender.name}, {sender.strasse}, {sender.stadt}
        </Text>

        {/* Two column layout: recipient left, details right */}
        <View style={styles.detailsContainer}>
          {/* Recipient address */}
          <View style={styles.detailsLeft}>
            <View style={styles.recipient}>
              <Text style={styles.recipientName}>{data.client.name}</Text>
              <Text>{data.client.strasse}</Text>
              <Text>{data.client.adresse}</Text>
            </View>
          </View>

          {/* Invoice details */}
          <View style={styles.detailsRight}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Rechnungs-Nr:</Text>
              <Text style={styles.detailValue}>{data.rechnungsnummer}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Rechnungsdatum:</Text>
              <Text style={styles.detailValue}>
                {formatDateDE(data.rechnungsdatum)}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Leistungszeitraum:</Text>
              <Text style={styles.detailValue}>
                {formatDateDE(data.leistungszeitraumStart)} -{" "}
                {formatDateDE(data.leistungszeitraumEnd)}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Ihre Kundennummer:</Text>
              <Text style={styles.detailValue}>{data.client.kundennummer}</Text>
            </View>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>Rechnung Nr. {data.rechnungsnummer}</Text>

        {/* Greeting */}
        <Text style={styles.greeting}>
          Sehr geehrte Damen und Herren,{"\n"}
          vielen Dank für Ihren Auftrag und das damit verbundene Vertrauen.
          Hiermit stelle ich Ihnen folgende Leistungen in Rechnung:
        </Text>

        {/* Items table */}
        <View style={styles.table}>
          {/* Header */}
          <View style={styles.tableHeader}>
            <Text style={styles.colPos}>Pos.</Text>
            <Text style={styles.colDesc}>Beschreibung</Text>
            <Text style={styles.colMenge}>Menge</Text>
            <Text style={styles.colEinzel}>Einzelpreis</Text>
            <Text style={styles.colGesamt}>Gesamtpreis</Text>
          </View>

          {/* Rows */}
          {data.items.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.colPos}>{item.pos}</Text>
              <Text style={styles.colDesc}>{item.beschreibung}</Text>
              <Text style={styles.colMenge}>{item.menge}</Text>
              <Text style={styles.colEinzel}>
                {formatCurrencyDE(item.einzelpreis)}
              </Text>
              <Text style={styles.colGesamt}>
                {formatCurrencyDE(item.gesamtpreis)}
              </Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totalsContainer}>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Zwischensumme</Text>
            <Text style={styles.totalsValue}>{formatCurrencyDE(subtotal)}</Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>
              Umsatzsteuer{tax.isKleinunternehmer ? "*" : ""} {tax.rate}%
            </Text>
            <Text style={styles.totalsValue}>{formatCurrencyDE(taxAmount)}</Text>
          </View>
          <View style={[styles.totalsRow, styles.grandTotal]}>
            <Text style={styles.totalsLabel}>Gesamtbetrag</Text>
            <Text style={styles.totalsValue}>{formatCurrencyDE(total)}</Text>
          </View>
        </View>

        {/* Kleinunternehmer notice - only shown when applicable */}
        {tax.isKleinunternehmer && (
          <Text style={styles.kleinunternehmerNotice}>
            *Gemäß der Kleinunternehmerregelung §19 UStG wird keine Umsatzsteuer
            berechnet
          </Text>
        )}

        {/* Signature */}
        <View style={styles.signature}>
          <Text>Mit freundlichen Grüßen</Text>
          <Text style={{ marginTop: 20 }}>{sender.name}</Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerRow}>
            <View style={styles.footerCol}>
              <Text>{sender.name}</Text>
              <Text>
                {sender.strasse}, {sender.stadt}
              </Text>
            </View>
            <View style={styles.footerCol}>
              <Text>Ust-ID: {sender.ustId}</Text>
              <Text>Bank: {sender.bank}</Text>
              <Text>IBAN: {sender.iban}</Text>
            </View>
            <View style={styles.footerCol}>
              <Text>E-Mail: {sender.email}</Text>
              <Text>Web: {sender.website}</Text>
              <Text>Tel: {sender.telefon}</Text>
            </View>
          </View>
        </View>

        {/* Page number */}
        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) =>
            `Seite ${pageNumber} von ${totalPages}`
          }
        />
      </Page>
    </Document>
  );
}
