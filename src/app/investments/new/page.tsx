"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FormInput } from "@/components/FormInput";
import { Button } from "@/components/Button";

interface Account {
  id: string;
  name: string;
}

export default function NewInvestmentPage() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "", type: "stock", shares: "", purchasePrice: "", currentPrice: "", accountId: "",
  });

  useEffect(() => {
    fetch("/api/accounts").then(async (r) => {
      if (r.ok) {
        const data = await r.json();
        if (Array.isArray(data)) setAccounts(data);
      }
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const res = await fetch("/api/investments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        shares: parseFloat(form.shares),
        purchasePrice: parseFloat(form.purchasePrice),
        currentPrice: parseFloat(form.currentPrice),
      }),
    });
    if (res.ok) router.push("/investments");
    else setSubmitting(false);
  }

  return (
    <div className="p-4 md:p-6 max-w-lg mx-auto">
      <h1 className="text-[15px] md:text-[18px] font-semibold -tracking-[0.01em] text-white mb-6">New Investment</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormInput label="Name" type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Apple Inc." required />
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-text-secondary mb-1.5">Type</label>
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
            className="w-full h-11 md:h-[38px] px-3 bg-bg-elevated border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-accent-green">
            <option value="stock">Stock</option>
            <option value="crypto">Crypto</option>
            <option value="etf">ETF</option>
            <option value="mutual_fund">Mutual Fund</option>
            <option value="bond">Bond</option>
          </select>
        </div>
        <FormInput label="Shares" type="number" step="any" value={form.shares}
          onChange={(e) => setForm({ ...form, shares: e.target.value })} required />
        <FormInput label="Purchase Price" hint="per share" type="number" step="0.01" value={form.purchasePrice}
          onChange={(e) => setForm({ ...form, purchasePrice: e.target.value })} required />
        <FormInput label="Current Price" hint="per share" type="number" step="0.01" value={form.currentPrice}
          onChange={(e) => setForm({ ...form, currentPrice: e.target.value })} required />
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-text-secondary mb-1.5">Account</label>
          <select value={form.accountId} onChange={(e) => setForm({ ...form, accountId: e.target.value })}
            className="w-full h-11 md:h-[38px] px-3 bg-bg-elevated border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-accent-green">
            <option value="">Select account</option>
            {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>
        <div className="flex gap-3 pt-2">
          <Button variant="secondary" type="button" onClick={() => router.back()}>Cancel</Button>
          <Button variant="primary" type="submit" disabled={submitting} full>
            {submitting ? "Saving..." : "Create Investment"}
          </Button>
        </div>
      </form>
    </div>
  );
}
