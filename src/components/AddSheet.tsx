"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Account {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
  icon: string;
}

export function AddSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [type, setType] = useState<"income" | "expense">("expense");
  const [accountId, setAccountId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    Promise.all([
      fetch("/api/accounts").then(async (r) => (r.ok ? r.json() : [])),
      fetch("/api/categories").then(async (r) => (r.ok ? r.json() : [])),
    ]).then(([a, c]) => {
      if (Array.isArray(a)) setAccounts(a);
      if (Array.isArray(c)) setCategories(c);
    });
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const signedAmount = type === "expense" ? -Math.abs(parseFloat(amount)) : Math.abs(parseFloat(amount));
    const res = await fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        accountId,
        categoryId,
        amount: signedAmount,
        date: new Date().toISOString().split("T")[0],
        description: note,
      }),
    });
    setSubmitting(false);
    if (res.ok) {
      onClose();
      router.refresh();
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      <div className="absolute bottom-0 left-0 right-0 bg-[#111] rounded-t-[16px] max-h-[85vh] overflow-y-auto animate-slide-up">
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-9 h-1 rounded-full bg-white/20" />
        </div>
        <div className="px-5 pb-8">
          <h2 className="text-[15px] font-semibold text-white mb-4 -tracking-[0.01em]">Add Entry</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex w-full gap-0">
              <button
                type="button"
                onClick={() => setType("income")}
                className={`flex-1 h-11 text-sm font-bold rounded-l-lg transition-all ${
                  type === "income" ? "bg-accent-green text-[#003320]" : "bg-bg-elevated text-white/50 border border-white/10"
                }`}
              >
                Income
              </button>
              <button
                type="button"
                onClick={() => setType("expense")}
                className={`flex-1 h-11 text-sm font-bold rounded-r-lg transition-all ${
                  type === "expense" ? "bg-accent-coral text-white" : "bg-bg-elevated text-white/50 border border-white/10"
                }`}
              >
                Expense
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-white/50 mb-1.5">Account</label>
              <select value={accountId} onChange={(e) => setAccountId(e.target.value)}
                className="w-full h-11 px-3 bg-bg-elevated border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-accent-green" required>
                <option value="">Select</option>
                {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-white/50 mb-1.5">Category</label>
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}
                className="w-full h-11 px-3 bg-bg-elevated border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-accent-green" required>
                <option value="">Select</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-white/50 mb-1.5">Amount</label>
              <input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)}
                className="w-full h-11 px-3 bg-bg-elevated border border-white/10 rounded-lg text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-accent-green" placeholder="0.00" required />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-white/50 mb-1.5">Note</label>
              <input type="text" value={note} onChange={(e) => setNote(e.target.value)}
                className="w-full h-11 px-3 bg-bg-elevated border border-white/10 rounded-lg text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-accent-green" placeholder="Optional" />
            </div>

            <button type="submit" disabled={submitting}
              className="w-full h-[50px] text-[15px] font-bold text-[#003320] bg-accent-green rounded-xl disabled:opacity-50 active:scale-97 transition-all">
              {submitting ? "Saving..." : "Add Entry"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
