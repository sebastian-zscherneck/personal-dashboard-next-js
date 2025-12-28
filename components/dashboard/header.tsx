"use client";

import { formatDate } from "@/lib/utils";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-[#050505]/80 border-b border-white/5">
      <div className="px-6 h-16 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-medium tracking-tight text-white">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-gray-500">{subtitle}</p>
          )}
        </div>

        <div className="flex items-center gap-4">
          <span className="text-xs text-gray-500">
            {formatDate(new Date())}
          </span>
        </div>
      </div>
    </header>
  );
}
