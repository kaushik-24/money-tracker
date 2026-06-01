"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { ACCOUNT_TYPE_ICONS } from "@/lib/icons";
import { Building2 } from "lucide-react";

interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
  color: string;
}

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/accounts")
      .then(async (r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (Array.isArray(data)) setAccounts(data);
        setLoading(false);
      });
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this account? This will also delete all associated transactions.")) return;
    const r = await fetch(`/api/accounts/${id}`, { method: "DELETE" });
    if (r.ok) setAccounts((prev) => prev.filter((a) => a.id !== id));
  }

  if (loading) {
    return (
      <div className="p-4 md:p-6 animate-pulse space-y-4">
        <div className="h-6 bg-bg-elevated rounded w-36" />
        <div className="h-16 bg-bg-elevated rounded-lg" />
        <div className="h-16 bg-bg-elevated rounded-lg" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-[1100px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[15px] md:text-[18px] font-semibold -tracking-[0.01em] text-white">Accounts</h1>
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-secondary mt-1">
            {accounts.length} account{accounts.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button href="/accounts/new" variant="primary">+ New Account</Button>
      </div>

      <div className="space-y-3">
        {accounts.map((account) => (
          <div key={account.id} className="block">
            <Card className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-[38px] h-[38px] rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${account.color}20` }}>
                  {(() => { const Icon = ACCOUNT_TYPE_ICONS[account.type]; return <Icon size={20} />; })()}
                </div>
                <div>
                  <p className="text-sm font-medium text-white"><Link href={`/accounts/${account.id}`}>{account.name}</Link></p>
                  <p className="text-[11px] text-text-secondary capitalize">{account.type}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-[20px] font-bold ${account.balance >= 0 ? "text-white" : "text-accent-coral"}`}>
                  {account.currency === "USD" ? "$" : ""}{Math.abs(account.balance).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
                <Link href={`/accounts/${account.id}/edit`}
                  className="text-[11px] font-bold uppercase tracking-wider text-accent-green hover:text-white transition-colors shrink-0">
                  Edit
                </Link>
                <button onClick={() => handleDelete(account.id)}
                  className="text-[11px] font-bold uppercase tracking-wider text-accent-coral hover:text-white transition-colors shrink-0">
                  Delete
                </button>
              </div>
            </Card>
          </div>
        ))}
        {accounts.length === 0 && (
          <EmptyState icon={<Building2 size={48} />} message="No accounts yet" action={
            <Button href="/accounts/new" variant="primary">+ New Account</Button>
          } />
        )}
      </div>
    </div>
  );
}
