"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { ProgressBar } from "@/components/ProgressBar";
import { EmptyState } from "@/components/EmptyState";
import { ChartPie } from "lucide-react";

interface Budget {
  id: string;
  amount: number;
  period: string;
  startDate: string;
  endDate: string | null;
  category: { id: string; name: string; icon: string; color: string };
  _spent?: number;
}

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/budgets")
      .then(async (r) => (r.ok ? r.json() : []))
      .then(async (data) => {
        const list: Budget[] = Array.isArray(data) ? data : [];
        // Fetch spending per budget category
        const txnsRes = await fetch("/api/transactions");
        const txns = txnsRes.ok ? await txnsRes.json() : [];
        const now = new Date();
        const enriched = list.map((b) => {
          const periodStart = getPeriodStart(b.period, b.startDate, now);
          const spent = Array.isArray(txns)
            ? txns
                .filter((t: { amount: number; date: string; categoryId: string }) => {
                  if (t.amount >= 0) return false;
                  const d = new Date(t.date);
                  return d >= periodStart && d <= now && t.categoryId === b.category?.id;
                })
                .reduce((s: number, t: { amount: number }) => s + Math.abs(t.amount), 0)
            : 0;
          return { ...b, _spent: spent };
        });
        setBudgets(enriched);
        setLoading(false);
      });
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this budget?")) return;
    const r = await fetch(`/api/budgets/${id}`, { method: "DELETE" });
    if (r.ok) setBudgets((prev) => prev.filter((b) => b.id !== id));
  }

  if (loading) {
    return (
      <div className="p-4 md:p-6 animate-pulse space-y-4">
        <div className="h-6 bg-bg-elevated rounded w-28" />
        <div className="h-20 bg-bg-elevated rounded-lg" />
        <div className="h-20 bg-bg-elevated rounded-lg" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-[1100px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[15px] md:text-[18px] font-semibold -tracking-[0.01em] text-white">Budgets</h1>
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-secondary mt-1">
            {budgets.length} budget{budgets.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button href="/budgets/new" variant="primary">+ New Budget</Button>
      </div>

      {budgets.length === 0 ? (
        <EmptyState icon={<ChartPie size={48} />} message="No budgets set yet" action={
          <Button href="/budgets/new" variant="primary">+ New Budget</Button>
        } />
      ) : (
        <div className="space-y-4">
          {budgets.map((budget) => {
            const pct = budget.amount > 0 ? Math.min((budget._spent || 0) / budget.amount, 1) : 0;
            const pctDisplay = Math.round(pct * 100);
            const isOver = pct >= 1;
            return (
              <Card key={budget.id}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-lg shrink-0">{budget.category?.icon || "🎯"}</span>
                    <div>
                      <p className="text-sm font-medium text-white">{budget.category?.name || "Budget"}</p>
                      <p className="text-[11px] text-text-secondary capitalize">{budget.period}{budget.endDate ? ` · until ${new Date(budget.endDate).toLocaleDateString()}` : ""}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <span className={`text-sm font-bold ${isOver ? "text-accent-coral" : "text-white"}`}>
                        ${budget.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <Link href={`/budgets/${budget.id}/edit`}
                      className="text-[11px] font-bold uppercase tracking-wider text-accent-green hover:text-white transition-colors">
                      Edit
                    </Link>
                    <button onClick={() => handleDelete(budget.id)}
                      className="text-[11px] font-bold uppercase tracking-wider text-accent-coral hover:text-white transition-colors">
                      Delete
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <ProgressBar progress={pctDisplay} color={isOver ? "#FF4D6D" : "#00FF87"} />
                  </div>
                  <span className={`text-[11px] font-semibold ${isOver ? "text-accent-coral" : "text-text-secondary"}`}>
                    ${(budget._spent || 0).toLocaleString("en-US", { minimumFractionDigits: 0 })} / ${budget.amount.toLocaleString("en-US", { minimumFractionDigits: 0 })}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function getPeriodStart(period: string, startDate: string, now: Date): Date {
  const start = new Date(startDate);
  switch (period) {
    case "monthly":
      return new Date(now.getFullYear(), now.getMonth(), 1);
    case "yearly":
      return new Date(now.getFullYear(), 0, 1);
    case "weekly":
      const d = new Date(now);
      d.setDate(d.getDate() - d.getDay());
      return d;
    default:
      return start;
  }
}
