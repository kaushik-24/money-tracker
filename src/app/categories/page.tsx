"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { Tags } from "lucide-react";

interface Category {
  id: string;
  name: string;
  type: string;
  icon: string;
  color: string;
  isBuiltIn: boolean;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/categories")
      .then(async (r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (Array.isArray(data)) setCategories(data);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="p-4 md:p-6 animate-pulse space-y-4">
        <div className="h-6 bg-bg-elevated rounded w-36" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-16 bg-bg-elevated rounded-lg" />)}
        </div>
      </div>
    );
  }

  const incomeCategories = categories.filter((c) => c.type === "income");
  const expenseCategories = categories.filter((c) => c.type === "expense");
  const transferCategories = categories.filter((c) => c.type === "transfer");

  return (
    <div className="p-4 md:p-6 max-w-[1100px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[15px] md:text-[18px] font-semibold -tracking-[0.01em] text-white">Categories</h1>
        <Button href="/categories/new" variant="primary">+ New Category</Button>
      </div>

      {incomeCategories.length > 0 && <Section title="Income" categories={incomeCategories} />}
      {expenseCategories.length > 0 && <Section title="Expenses" categories={expenseCategories} />}
      {transferCategories.length > 0 && <Section title="Transfers" categories={transferCategories} />}

      {categories.length === 0 && (
        <EmptyState icon={<Tags size={48} />} message="No categories yet" action={
          <Button href="/categories/new" variant="primary">+ New Category</Button>
        } />
      )}
    </div>
  );
}

function Section({ title, categories }: { title: string; categories: Category[] }) {
  return (
    <div className="mb-8">
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-secondary mb-3">{title}</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {categories.map((cat) => (
          <div key={cat.id} className="bg-bg-card border border-white/10 rounded-lg p-4 flex items-center gap-3 min-h-[44px]">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center text-base shrink-0" style={{ backgroundColor: `${cat.color}20` }}>
              {cat.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{cat.name}</p>
              {cat.isBuiltIn ? (
                <p className="text-[11px] text-text-secondary">Built-in</p>
              ) : (
                <Link href={`/categories/${cat.id}/edit`} className="text-[11px] font-bold uppercase tracking-wider text-accent-green hover:text-white transition-colors">
                  Edit
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
