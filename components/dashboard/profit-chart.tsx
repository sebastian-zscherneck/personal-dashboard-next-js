"use client";

import type { EinnahmenRow, AusgabenRow } from "@/lib/gewerbe/types";

interface ProfitChartProps {
  invoices: EinnahmenRow[];
  expenses: AusgabenRow[];
}

export function ProfitChart({ invoices, expenses }: ProfitChartProps) {
  const totalEinnahmen = invoices.reduce((sum, i) => sum + i.betrag, 0);
  const totalAusgaben = expenses.reduce((sum, e) => sum + e.betrag, 0);
  const gewinn = totalEinnahmen - totalAusgaben;

  const maxValue = Math.max(totalEinnahmen, totalAusgaben, 1);
  const einnahmenHeight = (totalEinnahmen / maxValue) * 100;
  const ausgabenHeight = (totalAusgaben / maxValue) * 100;

  return (
    <div className="bg-[#0F0F0F] border border-white/5 p-6 h-full flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-white">Gewinn</h3>
        <p className={`text-2xl font-bold mt-1 ${gewinn >= 0 ? "text-[#E0FF00]" : "text-red-400"}`}>
          {gewinn.toLocaleString("de-DE", { minimumFractionDigits: 2 })} €
        </p>
      </div>

      {/* Bar Chart */}
      <div className="flex-1 flex items-end justify-center gap-8 min-h-[180px]">
        {/* Einnahmen Bar */}
        <div className="flex flex-col items-center gap-2">
          <div className="relative h-40 w-16 bg-[#1B2124] flex items-end">
            <div
              className="w-full bg-[#E0FF00] transition-all duration-500"
              style={{ height: `${einnahmenHeight}%` }}
            />
          </div>
          <div className="text-center">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Einnahmen</p>
            <p className="text-sm font-medium text-[#E0FF00]">
              {totalEinnahmen.toLocaleString("de-DE", { minimumFractionDigits: 2 })} €
            </p>
          </div>
        </div>

        {/* Ausgaben Bar */}
        <div className="flex flex-col items-center gap-2">
          <div className="relative h-40 w-16 bg-[#1B2124] flex items-end">
            <div
              className="w-full bg-red-500 transition-all duration-500"
              style={{ height: `${ausgabenHeight}%` }}
            />
          </div>
          <div className="text-center">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">Ausgaben</p>
            <p className="text-sm font-medium text-red-400">
              {totalAusgaben.toLocaleString("de-DE", { minimumFractionDigits: 2 })} €
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
