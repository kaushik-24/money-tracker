"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { FormInput } from "@/components/FormInput";
import { Button } from "@/components/Button";

interface Account {
  id: string;
  name: string;
}

const ICON_OPTIONS = ["🎯", "💰", "🏠", "🚗", "🎓", "✈️", "🏥", "💼", "📱", "💳", "🏋️", "🎮"];

export default function EditGoalPage() {
  const router = useRouter();
  const params = useParams();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "", targetAmount: "", currentAmount: "0", deadline: "", accountId: "", icon: "🎯", color: "#6366f1",
  });

  useEffect(() => {
    if (!params.id) return;
    Promise.all([
      fetch("/api/accounts").then(async (r) => (r.ok ? r.json() : [])),
      fetch(`/api/goals/${params.id}`).then(async (r) => (r.ok ? r.json() : null)),
    ]).then(([accountsData, goal]) => {
      if (Array.isArray(accountsData)) setAccounts(accountsData);
      if (goal) {
        setForm({
          name: goal.name,
          targetAmount: goal.targetAmount.toString(),
          currentAmount: goal.currentAmount.toString(),
          deadline: goal.deadline ? goal.deadline.slice(0, 10) : "",
          accountId: goal.accountId || "",
          icon: goal.icon || "🎯",
          color: goal.color || "#6366f1",
        });
      }
      setLoading(false);
    });
  }, [params.id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const res = await fetch(`/api/goals/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        targetAmount: parseFloat(form.targetAmount),
        currentAmount: parseFloat(form.currentAmount || "0"),
        deadline: form.deadline || null,
        accountId: form.accountId || null,
      }),
    });
    if (res.ok) router.push("/goals");
    else setSubmitting(false);
  }

  if (loading) return <div className="p-6 animate-pulse"><div className="h-6 bg-bg-elevated rounded w-48" /></div>;

  return (
    <div className="p-4 md:p-6 max-w-lg mx-auto">
      <h1 className="text-[15px] md:text-[18px] font-semibold -tracking-[0.01em] text-white mb-6">Edit Goal</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormInput label="Goal Name" type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <FormInput label="Target Amount" type="number" step="0.01" value={form.targetAmount}
          onChange={(e) => setForm({ ...form, targetAmount: e.target.value })} required />
        <FormInput label="Current Amount" type="number" step="0.01" value={form.currentAmount}
          onChange={(e) => setForm({ ...form, currentAmount: e.target.value })} />
        <FormInput label="Deadline" hint="optional" type="date" value={form.deadline}
          onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-text-secondary mb-1.5">Linked Account <span className="font-normal normal-case tracking-normal text-text-secondary">(optional)</span></label>
          <select value={form.accountId} onChange={(e) => setForm({ ...form, accountId: e.target.value })}
            className="w-full h-11 md:h-[38px] px-3 bg-bg-elevated border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-accent-green">
            <option value="">None</option>
            {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-text-secondary mb-1.5">Icon</label>
          <div className="flex gap-2 flex-wrap">
            {ICON_OPTIONS.map((icon) => (
              <button key={icon} type="button" onClick={() => setForm({ ...form, icon })}
                className={`w-10 h-10 rounded-lg text-lg border ${form.icon === icon ? "border-accent-green bg-accent-green/10 ring-2 ring-accent-green/30" : "border-white/10 hover:border-white/30"} transition-all`}>
                {icon}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-text-secondary mb-1.5">Color</label>
          <input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })}
            className="w-full h-11 md:h-[38px] px-1 bg-bg-elevated border border-white/10 rounded-lg cursor-pointer" />
        </div>
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
