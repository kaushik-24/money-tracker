"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ICONS } from "@/lib/icons";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/transactions", label: "Transactions" },
  { href: "/accounts", label: "Accounts" },
  { href: "/categories", label: "Categories" },
];

export function BottomNav({ onAddClick }: { onAddClick: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-16 bg-bg-elevated border-t border-white/10 flex items-center justify-around px-2">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
        const Icon = NAV_ICONS[item.href];
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center justify-center gap-0.5 min-w-[56px] min-h-[44px]"
          >
            <Icon size={20} className={isActive ? "text-accent-green" : "text-white/30"} />
            <span className={`text-[10px] font-semibold uppercase tracking-widest ${isActive ? "text-accent-green" : "text-white/30"}`}>
              {item.label}
            </span>
          </Link>
        );
      })}
      <button
        onClick={onAddClick}
        className="flex items-center justify-center w-[52px] h-[52px] rounded-full bg-accent-green text-[#003320] text-2xl font-bold -translate-y-[10px] active:scale-95 transition-transform duration-150"
      >
        +
      </button>
    </nav>
  );
}
