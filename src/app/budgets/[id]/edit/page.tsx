"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { FormInput } from "@/components/FormInput";
import { Button } from "@/components/Button";

interface Category {
  id: string;
  name: string;
  icon: string;
}

export default function EditBudgetPage() {
  const router = useRouter();
  const params = useParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    categoryId: "", amount: "", period: "monthly", startDate: "", endDate: "",
  });

  useEffect(() => {
    if (!params.id) return;
    Promise.all([
      fetch("/api/categories").then(async (r) => (r.ok ? r.json() : [])),
      fetch(`/api/budgets/${params.id}`).then(async (r) => (r.ok ? r.json() : null)),
    ]).then(([cats, budget]) => {
      if (Array.isArray(cats)) setCategories(cats);
      if (budget) {
        setForm({
          categoryId: budget.categoryId || "",
          amount: budget.amount.toString(),
          period: budget.period,
          startDate: budget.startDate ? budget.startDate.slice(0, 10) : "",
          endDate: budget.endDate ? budget.endDate.slice(0, 10) : "",
        });
      }
      setLoading(false);
    });
  }, [params.id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const res = await fetch(`/api/budgets/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, amount: parseFloat(form.amount) }),
    });
    if (res.ok) router.push("/budgets");
    else setSubmitting(false);
  }

  if (loading) return <div className="p-6 animate-pulse"><div className="h-6 bg-bg-elevated rounded w-48" /></div>;

  return (
    <div className="p-4 md:p-6 max-w-lg mx-auto">
      <h1 className="text-[15px] md:text-[18px] font-semibold -tracking-[0.01em] text-white mb-6">Edit Budget</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-text-secondary mb-1.5">Category</label>
          <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            className="w-full h-11 md:h-[38px] px-3 bg-bg-elevated border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-accent-green" required>
            <option value="">Select category</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
          </select>
        </div>
        <FormInput label="Budget Amount" type="number" step="0.01" value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-text-secondary mb-1.5">Period</label>
          <select value={form.period} onChange={(e) => setForm({ ...form, period: e.target.value })}
            className="w-full h-11 md:h-[38px] px-3 bg-bg-elevated border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-accent-green">
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
            <option value="weekly">Weekly</option>
          </select>
        </div>
        <FormInput label="Start Date" type="date" value={form.startDate}
          onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
        <FormInput label="End Date" hint="optional" type="date" value={form.endDate}
          onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
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
