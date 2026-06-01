"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FormInput } from "@/components/FormInput";
import { Button } from "@/components/Button";

export default function NewCategoryPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "", type: "expense", icon: "📦", color: "#6b7280",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) router.push("/categories");
    else setSubmitting(false);
  }

  return (
    <div className="p-4 md:p-6 max-w-lg mx-auto">
      <h1 className="text-[15px] md:text-[18px] font-semibold -tracking-[0.01em] text-white mb-6">New Category</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormInput label="Name" type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-text-secondary mb-1.5">Type</label>
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
            className="w-full h-11 md:h-[38px] px-3 bg-bg-elevated border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-accent-green">
            <option value="income">Income</option>
            <option value="expense">Expense</option>
            <option value="transfer">Transfer</option>
          </select>
        </div>
        <FormInput label="Icon" hint="emoji" type="text" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} />
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-text-secondary mb-1.5">Color</label>
          <input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })}
            className="w-full h-11 md:h-[38px] px-1 bg-bg-elevated border border-white/10 rounded-lg cursor-pointer" />
        </div>
        <div className="flex gap-3 pt-2">
          <Button variant="secondary" type="button" onClick={() => router.back()}>Cancel</Button>
          <Button variant="primary" type="submit" disabled={submitting} full>
            {submitting ? "Saving..." : "Create Category"}
          </Button>
        </div>
      </form>
    </div>
  );
}
