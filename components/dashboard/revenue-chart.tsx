"use client";

import { useState, useMemo } from "react";
import type { EinnahmenRow } from "@/lib/gewerbe/types";

type TimeFrame = "week" | "month" | "quarter" | "year" | "all";

interface RevenueChartProps {
  invoices: EinnahmenRow[];
}

export function RevenueChart({ invoices }: RevenueChartProps) {
  const [timeFrame, setTimeFrame] = useState<TimeFrame>("month");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const chartData = useMemo(() => {
    const now = new Date();
    let startDate: Date;
    let groupBy: "day" | "week" | "month";

    switch (timeFrame) {
      case "week":
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        groupBy = "day";
        break;
      case "month":
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
        groupBy = "day";
        break;
      case "quarter":
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 3);
        groupBy = "week";
        break;
      case "year":
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 1);
        groupBy = "month";
        break;
      case "all":
      default:
        startDate = new Date(0);
        groupBy = "month";
        break;
    }

    const filteredInvoices = invoices.filter((inv) => {
      const date = parseDate(inv.datumDerZahlung);
      return date >= startDate && date <= now;
    });

    const grouped: Record<string, number> = {};

    filteredInvoices.forEach((inv) => {
      const date = parseDate(inv.datumDerZahlung);
      let key: string;

      if (groupBy === "day") {
        key = date.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" });
      } else if (groupBy === "week") {
        const weekNum = getWeekNumber(date);
        key = `KW ${weekNum}`;
      } else {
        key = date.toLocaleDateString("de-DE", { month: "short", year: "2-digit" });
      }

      grouped[key] = (grouped[key] || 0) + inv.betrag;
    });

    const entries = Object.entries(grouped).map(([label, value]) => ({
      label,
      value,
    }));

    if (groupBy === "day") {
      entries.sort((a, b) => {
        const [dayA, monthA] = a.label.split(".").map(Number);
        const [dayB, monthB] = b.label.split(".").map(Number);
        if (monthA !== monthB) return monthA - monthB;
        return dayA - dayB;
      });
    } else if (groupBy === "week") {
      entries.sort((a, b) => {
        const weekA = parseInt(a.label.replace("KW ", ""));
        const weekB = parseInt(b.label.replace("KW ", ""));
        return weekA - weekB;
      });
    } else if (groupBy === "month") {
      // Sort by year then month for 1J/Alle timeframes
      const monthOrder = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun",
                          "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];
      entries.sort((a, b) => {
        const [monthA, yearA] = a.label.split(" ");
        const [monthB, yearB] = b.label.split(" ");
        const yearCompare = parseInt(yearA) - parseInt(yearB);
        if (yearCompare !== 0) return yearCompare;
        return monthOrder.indexOf(monthA) - monthOrder.indexOf(monthB);
      });
    }

    return entries;
  }, [invoices, timeFrame]);

  const maxValue = Math.max(...chartData.map((d) => d.value), 1);
  const total = chartData.reduce((sum, d) => sum + d.value, 0);

  // Chart dimensions
  const width = 100;
  const height = 50;
  const padding = { top: 5, right: 2, bottom: 8, left: 2 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Generate points
  const points = chartData.map((d, i) => ({
    x: padding.left + (chartData.length > 1 ? (i / (chartData.length - 1)) * chartWidth : chartWidth / 2),
    y: padding.top + chartHeight - (d.value / maxValue) * chartHeight,
    value: d.value,
    label: d.label,
  }));

  // Generate smooth line path
  const linePath = points.length > 0
    ? points.reduce((path, point, i) => {
        if (i === 0) return `M ${point.x} ${point.y}`;

        const prev = points[i - 1];
        const cp1x = prev.x + (point.x - prev.x) / 3;
        const cp2x = point.x - (point.x - prev.x) / 3;

        return `${path} C ${cp1x} ${prev.y}, ${cp2x} ${point.y}, ${point.x} ${point.y}`;
      }, "")
    : "";

  // Generate area path (line path + bottom closure)
  const areaPath = points.length > 0
    ? `${linePath} L ${points[points.length - 1].x} ${padding.top + chartHeight} L ${points[0].x} ${padding.top + chartHeight} Z`
    : "";

  return (
    <div className="bg-[#0F0F0F] border border-white/5 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-medium text-white">Einnahmen</h3>
          <p className="text-2xl font-bold text-[#E0FF00] mt-1">
            {total.toLocaleString("de-DE", { minimumFractionDigits: 2 })} €
          </p>
        </div>

        {/* Time frame toggle */}
        <div className="flex gap-1 bg-[#1B2124] p-1">
          {(["week", "month", "quarter", "year", "all"] as TimeFrame[]).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeFrame(tf)}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                timeFrame === tf
                  ? "bg-[#E0FF00] text-black"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {tf === "week" ? "7T" : tf === "month" ? "30T" : tf === "quarter" ? "3M" : tf === "year" ? "1J" : "Alle"}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      {chartData.length === 0 ? (
        <div className="h-48 flex items-center justify-center text-gray-500 text-sm">
          Keine Daten im gewählten Zeitraum
        </div>
      ) : (
        <div className="relative">
          {/* SVG Chart */}
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-48"
            preserveAspectRatio="none"
          >
            <defs>
              {/* Gradient for area fill */}
              <linearGradient id="areaGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#E0FF00" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#E0FF00" stopOpacity="0" />
              </linearGradient>

            </defs>

            {/* Grid lines */}
            {[0.25, 0.5, 0.75].map((ratio) => (
              <line
                key={ratio}
                x1={padding.left}
                y1={padding.top + chartHeight * (1 - ratio)}
                x2={width - padding.right}
                y2={padding.top + chartHeight * (1 - ratio)}
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="0.2"
              />
            ))}

            {/* Area fill */}
            {points.length > 1 && (
              <path
                d={areaPath}
                fill="url(#areaGradient)"
              />
            )}

            {/* Line */}
            {points.length > 1 && (
              <path
                d={linePath}
                fill="none"
                stroke="#E0FF00"
                strokeWidth="0.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Hexagon dots - compensate for SVG stretching */}
            {points.map((point, i) => {
              // Hexagon size (compressed x to appear symmetric after stretch)
              const size = hoveredIndex === i ? 1.5 : 1;
              const xScale = 0.4; // Compress x to counter horizontal stretching
              // Hexagon points (flat-top orientation)
              const hexPoints = [
                [0, -size],
                [size * 0.866 * xScale, -size * 0.5],
                [size * 0.866 * xScale, size * 0.5],
                [0, size],
                [-size * 0.866 * xScale, size * 0.5],
                [-size * 0.866 * xScale, -size * 0.5],
              ].map(([x, y]) => `${point.x + x},${point.y + y}`).join(" ");

              return (
                <polygon
                  key={i}
                  points={hexPoints}
                  fill="#E0FF00"
                  className="cursor-pointer transition-all duration-150"
                  style={{
                    filter: hoveredIndex === i
                      ? "drop-shadow(0 0 3px #E0FF00)"
                      : "drop-shadow(0 0 0px #E0FF00)",
                  }}
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
              );
            })}

          </svg>

          {/* Tooltip */}
          {hoveredIndex !== null && points[hoveredIndex] && (
            <div
              className="absolute bg-[#1B2124] border border-white/10 px-3 py-2 text-xs pointer-events-none z-10 transform -translate-x-1/2"
              style={{
                left: `${(points[hoveredIndex].x / width) * 100}%`,
                top: `${(points[hoveredIndex].y / height) * 100}%`,
                marginTop: "-40px",
              }}
            >
              <p className="text-gray-400">{points[hoveredIndex].label}</p>
              <p className="text-[#E0FF00] font-medium">
                {points[hoveredIndex].value.toLocaleString("de-DE", { minimumFractionDigits: 2 })} €
              </p>
            </div>
          )}

          {/* X-axis labels */}
          <div className="flex justify-between mt-2 px-1">
            {chartData.length <= 12 ? (
              chartData.map((d, i) => (
                <span
                  key={i}
                  className={`text-[10px] transition-colors ${
                    hoveredIndex === i ? "text-white" : "text-gray-500"
                  }`}
                  style={{ width: `${100 / chartData.length}%`, textAlign: "center" }}
                >
                  {d.label}
                </span>
              ))
            ) : (
              <>
                <span className="text-[10px] text-gray-500">{chartData[0]?.label}</span>
                <span className="text-[10px] text-gray-500">
                  {chartData[Math.floor(chartData.length / 2)]?.label}
                </span>
                <span className="text-[10px] text-gray-500">
                  {chartData[chartData.length - 1]?.label}
                </span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function parseDate(dateStr: string): Date {
  if (!dateStr) return new Date(0);

  if (dateStr.includes("-")) {
    return new Date(dateStr);
  }

  const parts = dateStr.split(".");
  if (parts.length === 3) {
    return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
  }

  return new Date(dateStr);
}

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}
