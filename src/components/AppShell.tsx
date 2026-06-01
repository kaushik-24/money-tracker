"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { BottomNav } from "./BottomNav";
import { AddSheet } from "./AddSheet";
import { SessionGuard } from "./SessionGuard";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/" || pathname === "/login" || pathname === "/register";
  const [addOpen, setAddOpen] = useState(false);

  if (isLoginPage) {
    return <SessionGuard>{children}</SessionGuard>;
  }

  return (
    <SessionGuard>
      {/* Desktop/Tablet layout */}
      <div className="hidden md:flex h-full">
        <Sidebar rail={false} />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="sticky top-0 z-40 h-14 bg-bg-secondary border-b border-white/10 flex items-center px-6 gap-4 shrink-0">
            <h2 className="text-[13px] font-semibold text-text-secondary uppercase tracking-[0.08em]">
              {getPageTitle(pathname)}
            </h2>
            <div className="flex-1" />
          </header>
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </div>

      {/* Mobile layout */}
      <div className="flex md:hidden flex-col h-full">
        <header className="sticky top-0 z-40 h-[52px] bg-bg-primary border-b border-white/10 flex items-center justify-between px-4 shrink-0">
          <h1 className="text-sm font-bold text-white">Money Tracker</h1>
          <div className="w-8 h-8 rounded-full bg-bg-elevated border border-white/10 flex items-center justify-center text-sm">
            👤
          </div>
        </header>
        <main className="flex-1 overflow-auto px-4 pt-4 pb-20">{children}</main>
        <BottomNav onAddClick={() => setAddOpen(true)} />
        <AddSheet open={addOpen} onClose={() => setAddOpen(false)} />
      </div>
    </SessionGuard>
  );
}

function getPageTitle(path: string): string {
  if (path === "/dashboard") return "Dashboard";
  const segment = path.split("/")[1];
  const titles: Record<string, string> = {
    accounts: "Accounts",
    transactions: "Transactions",
    categories: "Categories",
    budgets: "Budgets",
    goals: "Goals",
    investments: "Investments",
  };
  return titles[segment] || "Overview";
}
