"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { EmptyState } from "@/components/EmptyState";
import { Search, CreditCard, X } from "lucide-react";

interface Transaction {
  id: string;
  accountId: string;
  categoryId: string;
  amount: number;
  date: string;
  description: string;
  isReconciled: boolean;
  account: { name: string; color: string };
  category: { name: string; icon: string; color: string };
}

interface Category {
  id: string;
  name: string;
}

interface Filters {
  search: string;
  categoryId: string;
  accountId: string;
  dateFrom: string;
  dateTo: string;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({ search: "", categoryId: "", accountId: "", dateFrom: "", dateTo: "" });

  useEffect(() => {
    Promise.all([
      fetch("/api/transactions").then(async (r) => (r.ok ? r.json() : [])),
      fetch("/api/categories").then(async (r) => (r.ok ? r.json() : [])),
    ]).then(([txns, cats]) => {
      if (Array.isArray(txns)) setTransactions(txns);
      if (Array.isArray(cats)) setCategories(cats);
      setLoading(false);
    });
  }, []);

  const uniqueAccounts = Array.from(new Map(transactions.map((t) => [t.accountId, t.account.name])).entries()).map(([id, name]) => ({ id, name }));

  const filtered = transactions.filter((txn) => {
    if (filters.search && !txn.description.toLowerCase().includes(filters.search.toLowerCase())) return false;
    if (filters.categoryId && txn.categoryId !== filters.categoryId) return false;
    if (filters.accountId && txn.accountId !== filters.accountId) return false;
    if (filters.dateFrom && new Date(txn.date) < new Date(filters.dateFrom)) return false;
    if (filters.dateTo) {
      const end = new Date(filters.dateTo);
      end.setHours(23, 59, 59, 999);
      if (new Date(txn.date) > end) return false;
    }
    return true;
  });

  const hasActiveFilters = filters.search || filters.categoryId || filters.accountId || filters.dateFrom || filters.dateTo;

  function clearFilters() {
    setFilters({ search: "", categoryId: "", accountId: "", dateFrom: "", dateTo: "" });
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this transaction?")) return;
    const r = await fetch(`/api/transactions/${id}`, { method: "DELETE" });
    if (r.ok) setTransactions((prev) => prev.filter((t) => t.id !== id));
  }

  if (loading) {
    return (
      <div className="p-4 md:p-6 animate-pulse space-y-4">
        <div className="h-6 bg-bg-elevated rounded w-40" />
        <div className="h-14 bg-bg-elevated rounded-lg" />
        <div className="h-14 bg-bg-elevated rounded-lg" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-[1100px] mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-[15px] md:text-[18px] font-semibold -tracking-[0.01em] text-white">Transactions</h1>
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-secondary mt-1">
            {filtered.length} transaction{filtered.length !== 1 ? "s" : ""}
            {hasActiveFilters && ` (filtered)`}
          </p>
        </div>
        <Button href="/transactions/new" variant="primary" className="hidden md:block">+ Add Transaction</Button>
      </div>

      <div className="mb-4 space-y-2">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="w-full h-11 pl-9 pr-3 bg-[#111] border border-white/10 rounded-lg text-sm text-white placeholder-white/30 focus:outline-none focus:border-accent-green transition-colors"
          />
          {filters.search && (
            <button onClick={() => setFilters({ ...filters, search: "" })} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white">
              <X size={16} />
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            value={filters.categoryId}
            onChange={(e) => setFilters({ ...filters, categoryId: e.target.value })}
            className="h-9 px-3 bg-[#111] border border-white/10 rounded-lg text-[11px] text-white font-semibold uppercase tracking-wider focus:outline-none focus:border-accent-green"
          >
            <option value="">All Categories</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select
            value={filters.accountId}
            onChange={(e) => setFilters({ ...filters, accountId: e.target.value })}
            className="h-9 px-3 bg-[#111] border border-white/10 rounded-lg text-[11px] text-white font-semibold uppercase tracking-wider focus:outline-none focus:border-accent-green"
          >
            <option value="">All Accounts</option>
            {uniqueAccounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
            className="h-9 px-3 bg-[#111] border border-white/10 rounded-lg text-[11px] text-white focus:outline-none focus:border-accent-green"
            title="From date"
          />
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
            className="h-9 px-3 bg-[#111] border border-white/10 rounded-lg text-[11px] text-white focus:outline-none focus:border-accent-green"
            title="To date"
          />
          {hasActiveFilters && (
            <button onClick={clearFilters}
              className="h-9 px-3 bg-transparent border border-white/10 rounded-lg text-[11px] text-text-secondary font-semibold uppercase tracking-wider hover:text-white transition-colors">
              Clear
            </button>
          )}
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState icon={<CreditCard size={48} />} message={hasActiveFilters ? "No transactions match your filters" : "No transactions yet"} action={
            hasActiveFilters ? (
              <button onClick={clearFilters} className="inline-flex items-center h-11 px-5 text-sm font-bold rounded-lg bg-transparent border border-white/20 text-white hover:bg-white/5">Clear Filters</button>
            ) : (
              <Button href="/transactions/new" variant="primary">+ Add Transaction</Button>
            )
          } />
        ) : (
          <div className="divide-y divide-white/10">
            {filtered.map((txn) => {
              const isExpanded = expanded === txn.id;
              return (
                <div key={txn.id}>
                  <div
                    onClick={() => setExpanded(isExpanded ? null : txn.id)}
                    className="w-full flex items-center justify-between px-4 md:px-5 py-3.5 hover:bg-white/[0.02] transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-[34px] h-[34px] rounded-lg flex items-center justify-center text-sm shrink-0" style={{ backgroundColor: `${txn.category?.color || "#6b7280"}20` }}>
                        {txn.category?.icon || "📦"}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] font-medium text-white truncate max-w-[160px] md:max-w-[280px]">
                          {txn.description || txn.category?.name || "Transaction"}
                        </p>
                        <div className="flex items-center gap-1.5 text-[11px] text-text-secondary flex-wrap">
                          <span style={{ color: txn.account?.color }} className="truncate max-w-[80px]">{txn.account?.name}</span>
                          <span>·</span>
                          <span>{txn.category?.name}</span>
                          <span>·</span>
                          <span>{new Date(txn.date).toLocaleDateString()}</span>
                          {txn.isReconciled && (
                            <span className="text-[10px] text-accent-green font-semibold uppercase tracking-wider">✓ Reconciled</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <span className={`text-[14px] font-bold block ${txn.amount >= 0 ? "text-accent-green" : "text-accent-coral"}`}>
                          {txn.amount >= 0 ? "+" : ""}${Math.abs(txn.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </span>
                        <Badge variant={txn.amount >= 0 ? "income" : "expense"}>
                          {txn.amount >= 0 ? "Income" : "Expense"}
                        </Badge>
                      </div>
                      <div className="hidden md:flex items-center gap-2">
                        <Link href={`/transactions/${txn.id}/edit`}
                          className="text-[11px] font-bold uppercase tracking-wider text-accent-green hover:text-white transition-colors">
                          Edit
                        </Link>
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(txn.id); }}
                          className="text-[11px] font-bold uppercase tracking-wider text-accent-coral hover:text-white transition-colors">
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="px-4 pb-3 space-y-2 md:hidden">
                      <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-text-secondary">
                        <span>Category: {txn.category?.name || "—"}</span>
                        <span>Date: {new Date(txn.date).toLocaleDateString()}</span>
                        {txn.isReconciled && <span className="text-accent-green">✓ Reconciled</span>}
                        {!txn.isReconciled && <span className="text-white/40">Not reconciled</span>}
                      </div>
                      {txn.description && <p className="text-[11px] text-text-secondary">Note: {txn.description}</p>}
                      <div className="flex gap-2">
                        <Link href={`/transactions/${txn.id}/edit`}
                          onClick={(e) => e.stopPropagation()}
                          className="flex-1 h-9 flex items-center justify-center text-[11px] font-bold uppercase tracking-wider rounded-lg border border-white/20 text-white">
                          Edit
                        </Link>
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(txn.id); }}
                          className="flex-1 h-9 flex items-center justify-center text-[11px] font-bold uppercase tracking-wider rounded-lg border border-accent-coral text-accent-coral">
                          Delete
                        </button>
                      </div>
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
