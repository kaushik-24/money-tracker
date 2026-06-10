"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormInput } from "@/components/FormInput";
import { Button } from "@/components/Button";

interface Account {
  id: string;
  name: string;
  type: string;
}

interface Category {
  id: string;
  name: string;
  type: string;
  icon: string;
}

export default function NewTransactionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [type, setType] = useState<"income" | "expense">("expense");
  const [form, setForm] = useState({
    accountId: searchParams.get("accountId") || "",
    categoryId: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    description: "",
  });

  const filteredCategories = categories.filter((c) => c.type === type);

  useEffect(() => {
    Promise.all([
      fetch("/api/accounts").then(async (r) => (r.ok ? r.json() : [])),
      fetch("/api/categories").then(async (r) => (r.ok ? r.json() : [])),
    ]).then(([accountsData, categoriesData]) => {
      if (Array.isArray(accountsData)) setAccounts(accountsData);
      if (Array.isArray(categoriesData)) setCategories(categoriesData);
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const signedAmount = type === "expense" ? -Math.abs(parseFloat(form.amount)) : Math.abs(parseFloat(form.amount));
    const res = await fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, amount: signedAmount }),
    });
    if (res.ok) router.push("/transactions");
    else setSubmitting(false);
  }

  return (
    <div className="p-4 md:p-6 max-w-lg mx-auto">
      <h1 className="text-[15px] md:text-[18px] font-semibold -tracking-[0.01em] text-white mb-6">New Transaction</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex w-full gap-0">
          <button type="button" onClick={() => { setType("income"); setForm((f) => ({ ...f, categoryId: "" })); }}
            className={`flex-1 h-11 text-sm font-bold rounded-l-lg transition-all ${
              type === "income" ? "bg-accent-green text-[#003320]" : "bg-bg-elevated text-text-secondary border border-white/10"
            }`}>
            Income
          </button>
          <button type="button" onClick={() => { setType("expense"); setForm((f) => ({ ...f, categoryId: "" })); }}
            className={`flex-1 h-11 text-sm font-bold rounded-r-lg transition-all ${
              type === "expense" ? "bg-accent-coral text-white" : "bg-bg-elevated text-text-secondary border border-white/10"
            }`}>
            Expense
          </button>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-text-secondary mb-1.5">Account</label>
          <select value={form.accountId} onChange={(e) => setForm({ ...form, accountId: e.target.value })}
            className="w-full h-11 md:h-[38px] px-3 bg-bg-elevated border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-accent-green" required>
            <option value="">Select account</option>
            {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-text-secondary mb-1.5">Category</label>
          <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            className="w-full h-11 md:h-[38px] px-3 bg-bg-elevated border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-accent-green" required>
            <option value="">Select category</option>
            {filteredCategories.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
          </select>
        </div>

        <FormInput label="Amount" type="number" step="0.01" value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0.00" required />

        <FormInput label="Date" type="date" value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })} required />

        <FormInput label="Description" hint="optional" type="text" value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Optional description" />

        <div className="flex gap-3 pt-2">
          <Button variant="secondary" type="button" onClick={() => router.back()}>Cancel</Button>
          <Button variant="primary" type="submit" disabled={submitting} full>
            {submitting ? "Saving..." : "Add Transaction"}
          </Button>
        </div>
      </form>
    </div>
  );
}
