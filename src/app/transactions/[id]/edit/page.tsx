"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { FormInput } from "@/components/FormInput";
import { Button } from "@/components/Button";

interface Account {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
  icon: string;
  type: string;
}

export default function EditTransactionPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({
    accountId: "", categoryId: "", amount: "", date: "", description: "", isReconciled: false,
  });

  useEffect(() => {
    if (!params.id) return;
    Promise.all([
      fetch(`/api/transactions/${params.id}`).then(async (r) => (r.ok ? r.json() : null)),
      fetch("/api/accounts").then(async (r) => (r.ok ? r.json() : [])),
      fetch("/api/categories").then(async (r) => (r.ok ? r.json() : [])),
    ]).then(([txn, accountsData, categoriesData]) => {
      if (txn) {
        setForm({
          accountId: txn.accountId || "",
          categoryId: txn.categoryId || "",
          amount: txn.amount.toString(),
          date: new Date(txn.date).toISOString().split("T")[0],
          description: txn.description || "",
          isReconciled: txn.isReconciled ?? false,
        });
      }
      if (Array.isArray(accountsData)) setAccounts(accountsData);
      if (Array.isArray(categoriesData)) setCategories(categoriesData);
      setLoading(false);
    });
  }, [params.id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const res = await fetch(`/api/transactions/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, amount: parseFloat(form.amount) }),
    });
    if (res.ok) router.push("/transactions");
    else setSubmitting(false);
  }

  if (loading) return <div className="p-6 animate-pulse"><div className="h-6 bg-bg-elevated rounded w-48" /></div>;

  return (
    <div className="p-4 md:p-6 max-w-lg mx-auto">
      <h1 className="text-[15px] md:text-[18px] font-semibold -tracking-[0.01em] text-white mb-6">Edit Transaction</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
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
            {categories.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
          </select>
        </div>
        <FormInput label="Amount" type="number" step="0.01" value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
        <FormInput label="Date" type="date" value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })} required />
        <FormInput label="Description" hint="optional" type="text" value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <label className="flex items-center gap-3 min-h-[44px] cursor-pointer">
          <input
            type="checkbox"
            checked={form.isReconciled}
            onChange={(e) => setForm({ ...form, isReconciled: e.target.checked })}
            className="w-5 h-5 rounded border border-white/10 bg-transparent checked:bg-accent-green checked:border-accent-green accent-accent-green"
          />
          <span className="text-sm text-white font-medium">Reconciled</span>
        </label>
        <div className="flex gap-3 pt-2">
          <Button variant="secondary" type="button" onClick={() => router.back()}>Cancel</Button>
          <Button variant="primary" type="submit" disabled={submitting} full>
            {submitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
