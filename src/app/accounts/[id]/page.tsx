"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { ACCOUNT_TYPE_ICONS } from "@/lib/icons";
import { CreditCard } from "lucide-react";

interface Transaction {
  id: string;
  amount: number;
  date: string;
  description: string;
  isReconciled: boolean;
  category: { name: string; icon: string; color: string };
}

interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
  color: string;
}

export default function AccountDetailPage() {
  const params = useParams();
  const [account, setAccount] = useState<Account | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (!params.id) return;
    Promise.all([
      fetch(`/api/accounts/${params.id}`).then(async (r) => (r.ok ? r.json() : null)),
      fetch(`/api/transactions?accountId=${params.id}`).then(async (r) => (r.ok ? r.json() : [])),
    ]).then(([accountData, transactionsData]) => {
      if (accountData) setAccount(accountData);
      if (Array.isArray(transactionsData)) setTransactions(transactionsData);
      setLoading(false);
    });
  }, [params.id]);

  if (loading) {
    return (
      <div className="p-4 md:p-6 animate-pulse space-y-4">
        <div className="h-6 bg-bg-elevated rounded w-48" />
        <div className="h-16 bg-bg-elevated rounded-lg" />
      </div>
    );
  }

  if (!account) return <div className="p-6 text-text-secondary">Account not found</div>;

  return (
    <div className="p-4 md:p-6 max-w-[1100px] mx-auto space-y-6">
      <Card>
        <div className="flex items-center gap-4">
          <div className="w-[38px] h-[38px] rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${account.color}20` }}>
            {(() => { const Icon = ACCOUNT_TYPE_ICONS[account.type]; return <Icon size={20} />; })()}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-[15px] md:text-[18px] font-semibold -tracking-[0.01em] text-white truncate">{account.name}</h1>
            <p className="text-[11px] text-text-secondary capitalize">{account.type}</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-secondary">Balance</p>
            <p className={`text-[20px] md:text-[28px] font-bold -tracking-[0.03em] ${account.balance >= 0 ? "text-accent-green" : "text-accent-coral"}`}>
              ${Math.abs(account.balance).toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
        <div className="flex gap-3 mt-4 pt-4 border-t border-white/10">
          <Button href={`/accounts/${account.id}/edit`} variant="secondary">Edit Account</Button>
          <Button href={`/transactions/new?accountId=${account.id}`} variant="primary">+ Add Transaction</Button>
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-secondary">
            Transactions ({transactions.length})
          </h2>
        </div>
        {transactions.length === 0 ? (
          <EmptyState icon={<CreditCard size={48} />} message="No transactions yet" action={
            <Button href={`/transactions/new?accountId=${account.id}`} variant="primary">+ Add Transaction</Button>
          } />
        ) : (
          <div className="divide-y divide-white/10">
            {transactions.map((txn) => {
              const isExpanded = expanded === txn.id;
              return (
                <div key={txn.id}>
                  <button
                    onClick={() => setExpanded(isExpanded ? null : txn.id)}
                    className="w-full flex items-center justify-between py-3 px-1 text-left hover:bg-white/[0.02] transition-colors md:cursor-default"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-[34px] h-[34px] rounded-lg flex items-center justify-center text-sm shrink-0" style={{ backgroundColor: `${txn.category?.color || "#6b7280"}20` }}>
                        {txn.category?.icon || "📦"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-medium text-white truncate">{txn.description || txn.category?.name || "Transaction"}</p>
                        <div className="flex items-center gap-1.5 text-[11px] text-text-secondary flex-wrap">
                          <span>{txn.category?.name}</span>
                          <span>·</span>
                          <span>{new Date(txn.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <span className={`text-[14px] font-bold shrink-0 ml-3 ${txn.amount >= 0 ? "text-accent-green" : "text-accent-coral"}`}>
                      {txn.amount >= 0 ? "+" : ""}${Math.abs(txn.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </span>
                  </button>
                  {isExpanded && (
                    <div className="px-1 pb-3 text-[11px] text-text-secondary space-y-1 md:hidden">
                      <p>Category: {txn.category?.name || "—"}</p>
                      <p>Date: {new Date(txn.date).toLocaleDateString()}</p>
                      {txn.description && <p>Note: {txn.description}</p>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
