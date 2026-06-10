"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { FormInput } from "@/components/FormInput";
import { Button } from "@/components/Button";

export default function EditAccountPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "", type: "checking", currency: "USD", color: "#6366f1",
  });

  useEffect(() => {
    if (!params.id) return;
    fetch(`/api/accounts/${params.id}`).then(async (r) => {
      if (r.ok) {
        const data = await r.json();
        setForm({ name: data.name, type: data.type, currency: data.currency, color: data.color });
        setLoading(false);
      }
    });
  }, [params.id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const res = await fetch(`/api/accounts/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) router.push("/accounts");
    else setSubmitting(false);
  }

  if (loading) return <div className="p-6 animate-pulse"><div className="h-6 bg-bg-elevated rounded w-48" /></div>;

  return (
    <div className="p-4 md:p-6 max-w-lg mx-auto">
      <h1 className="text-[15px] md:text-[18px] font-semibold -tracking-[0.01em] text-white mb-6">Edit Account</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormInput label="Name" type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-text-secondary mb-1.5">Type</label>
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
            className="w-full h-11 md:h-[38px] px-3 bg-bg-elevated border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-accent-green">
            <option value="checking">Checking</option>
            <option value="savings">Savings</option>
            <option value="credit">Credit Card</option>
            <option value="investment">Investment</option>
            <option value="cash">Cash</option>
          </select>
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
