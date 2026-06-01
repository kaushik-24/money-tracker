"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FormInput } from "@/components/FormInput";
import { Button } from "@/components/Button";

interface Account {
  id: string;
  name: string;
}

const ICON_OPTIONS = ["🎯", "💰", "🏠", "🚗", "🎓", "✈️", "🏥", "💼", "📱", "💳", "🏋️", "🎮"];

export default function NewGoalPage() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "", targetAmount: "", currentAmount: "0", deadline: "", accountId: "", icon: "🎯", color: "#6366f1",
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
    const res = await fetch("/api/goals", {
      method: "POST",
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

  return (
    <div className="p-4 md:p-6 max-w-lg mx-auto">
      <h1 className="text-[15px] md:text-[18px] font-semibold -tracking-[0.01em] text-white mb-6">New Goal</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormInput label="Goal Name" type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Emergency Fund" required />
        <FormInput label="Target Amount" type="number" step="0.01" value={form.targetAmount}
          onChange={(e) => setForm({ ...form, targetAmount: e.target.value })} placeholder="10000" required />
        <FormInput label="Current Amount" type="number" step="0.01" value={form.currentAmount}
          onChange={(e) => setForm({ ...form, currentAmount: e.target.value })} placeholder="0" />
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
            {submitting ? "Saving..." : "Create Goal"}
          </Button>
        </div>
      </form>
    </div>
  );
}
