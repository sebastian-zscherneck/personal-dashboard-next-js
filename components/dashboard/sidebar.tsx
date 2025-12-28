"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderOpen,
  LogOut,
  Briefcase,
  Receipt,
  TrendingDown,
} from "lucide-react";
import { HexLogo } from "@/components/icons/hex-logo";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Drive", href: "/drive", icon: FolderOpen },
];

const gewerbeNavigation = [
  { name: "Rechnungen", href: "/gewerbe/invoices", icon: Receipt },
  { name: "Ausgaben", href: "/gewerbe/expenses", icon: TrendingDown },
  { name: "Kunden", href: "/gewerbe/clients", icon: Briefcase },
];

export function Sidebar() {
  const pathname = usePathname();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-[#0F0F0F] border-r border-white/5 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-white/5">
        <Link href="/" className="flex items-center gap-3">
          <HexLogo size={28} className="text-white" />
          <div>
            <span className="text-sm font-semibold tracking-tight uppercase text-white block">
              Dashboard
            </span>
            <span className="text-[10px] text-gray-500">Self-Employment</span>
          </div>
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-1 bg-[#E0FF00]" />
          <span className="text-[10px] font-bold tracking-widest text-gray-500 uppercase">
            Main
          </span>
        </div>

        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 text-sm transition-colors ${
                isActive
                  ? "text-[#E0FF00] bg-[#E0FF00]/5"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <item.icon className="w-4 h-4" />
              <span>{item.name}</span>
            </Link>
          );
        })}

        {/* Gewerbe Section */}
        <div className="flex items-center gap-2 mt-6 mb-3">
          <div className="w-1 h-1 bg-[#E0FF00]" />
          <span className="text-[10px] font-bold tracking-widest text-gray-500 uppercase">
            Gewerbe
          </span>
        </div>

        {gewerbeNavigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 text-sm transition-colors ${
                isActive
                  ? "text-[#E0FF00] bg-[#E0FF00]/5"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <item.icon className="w-4 h-4" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-white/5">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
