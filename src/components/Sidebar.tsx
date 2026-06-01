"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";
import { NAV_ICONS, LogOut } from "@/lib/icons";
import { Wallet, Shield } from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/accounts", label: "Accounts" },
  { href: "/transactions", label: "Transactions" },
  { href: "/categories", label: "Categories" },
  { href: "/budgets", label: "Budgets" },
  { href: "/goals", label: "Goals" },
  { href: "/investments", label: "Investments" },
];

export function Sidebar({ rail }: { rail?: boolean }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [hovered, setHovered] = useState<string | null>(null);

  if (rail) {
    return (
      <aside className="w-16 bg-bg-secondary border-r border-white/10 flex flex-col h-screen shrink-0">
        <div className="h-14 flex items-center justify-center border-b border-white/10">
          <Wallet size={20} className="text-accent-green" />
        </div>
        <nav className="flex-1 py-2 flex flex-col items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = NAV_ICONS[item.href];
            return (
              <div key={item.href} className="relative w-full flex justify-center">
                <Link
                  href={item.href}
                  className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-150 relative ${
                    isActive ? "text-accent-green" : "text-white/30 hover:text-white"
                  }`}
                  onMouseEnter={() => setHovered(item.href)}
                  onMouseLeave={() => setHovered(null)}
                  style={isActive ? { borderLeft: "none" } : {}}
                >
                  {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-5 bg-accent-green rounded-r-full" />}
                  <Icon size={20} />
                </Link>
                {hovered === item.href && (
                  <div className="absolute left-14 top-1/2 -translate-y-1/2 bg-bg-elevated border border-white/10 rounded px-3 py-1.5 text-xs text-white whitespace-nowrap z-50">
                    {item.label}
                  </div>
                )}
              </div>
            );
          })}
          {session?.user?.isAdmin && (
            <div className="relative w-full flex justify-center">
              <Link
                href="/admin"
                className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-150 relative ${
                  pathname === "/admin" ? "text-accent-green" : "text-white/30 hover:text-white"
                }`}
                onMouseEnter={() => setHovered("admin")}
                onMouseLeave={() => setHovered(null)}
              >
                {pathname === "/admin" && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-5 bg-accent-green rounded-r-full" />}
                <Shield size={18} />
              </Link>
              {hovered === "admin" && (
                <div className="absolute left-14 top-1/2 -translate-y-1/2 bg-bg-elevated border border-white/10 rounded px-3 py-1.5 text-xs text-white whitespace-nowrap z-50">
                  Admin
                </div>
              )}
            </div>
          )}
        </nav>
        <div className="p-3 border-t border-white/10 flex flex-col items-center gap-2">
          {session?.user && (
            <span className="text-[10px] text-text-secondary truncate w-full text-center">{session.user.email}</span>
          )}
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-10 h-10 flex items-center justify-center rounded-lg text-white/30 hover:text-white transition-colors"
            title="Sign Out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-[210px] bg-bg-secondary border-r border-white/10 flex flex-col h-screen shrink-0">
      <div className="h-14 flex items-center px-5 gap-2 border-b border-white/10">
        <Wallet size={18} className="text-accent-green" />
        <h1 className="text-[15px] font-bold tracking-tight text-white">Money Tracker</h1>
      </div>
      <nav className="flex-1 py-3 px-2 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = NAV_ICONS[item.href];
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${
                isActive
                  ? "text-accent-green font-medium border-l-[2px] border-accent-green bg-[#00FF87]/5"
                  : "text-white/50 hover:text-white hover:bg-white/[0.03]"
              }`}
              style={isActive ? { marginLeft: "-2px" } : {}}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      {session?.user?.isAdmin && (
        <div className="px-2 pb-1">
          <Link
            href="/admin"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${
              pathname === "/admin"
                ? "text-accent-green font-medium border-l-[2px] border-accent-green bg-[#00FF87]/5"
                : "text-white/50 hover:text-white hover:bg-white/[0.03]"
            }`}
            style={pathname === "/admin" ? { marginLeft: "-2px" } : {}}
          >
            <Shield size={18} />
            Admin
          </Link>
        </div>
      )}
      <div className="border-t border-white/10" />
      <div className="p-3 space-y-1">
        {session?.user && (
          <div className="px-3 py-1.5 text-[11px] text-text-secondary truncate">{session.user.email}</div>
        )}
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full text-left px-3 py-2.5 rounded-lg text-sm text-white/50 hover:text-white hover:bg-white/[0.03] transition-all duration-150 flex items-center gap-3"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
