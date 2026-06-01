"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { MetricCard } from "@/components/MetricCard";
import { ProgressBar } from "@/components/ProgressBar";
import { EmptyState } from "@/components/EmptyState";
import { Trophy } from "lucide-react";

interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string | null;
  icon: string;
  color: string;
  account: { name: string; color: string } | null;
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/goals")
      .then(async (r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (Array.isArray(data)) setGoals(data);
        setLoading(false);
      });
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this goal?")) return;
    const r = await fetch(`/api/goals/${id}`, { method: "DELETE" });
    if (r.ok) setGoals((prev) => prev.filter((g) => g.id !== id));
  }

  if (loading) {
    return (
      <div className="p-4 md:p-6 animate-pulse space-y-4">
        <div className="h-6 bg-bg-elevated rounded w-28" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-bg-elevated rounded-lg" />)}
        </div>
      </div>
    );
  }

  const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0);
  const totalSaved = goals.reduce((s, g) => s + g.currentAmount, 0);
  const completedGoals = goals.filter((g) => g.currentAmount >= g.targetAmount).length;

  return (
    <div className="p-4 md:p-6 max-w-[1100px] mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[15px] md:text-[18px] font-semibold -tracking-[0.01em] text-white">Goals</h1>
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-secondary mt-1">
            {goals.length} goal{goals.length !== 1 ? "s" : ""} · {completedGoals} completed
          </p>
        </div>
        <Button href="/goals/new" variant="primary">+ New Goal</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
        <MetricCard label="Total Target" value={`$${totalTarget.toLocaleString("en-US", { minimumFractionDigits: 2 })}`} accent="blue" />
        <MetricCard label="Total Saved" value={`$${totalSaved.toLocaleString("en-US", { minimumFractionDigits: 2 })}`} accent="green" />
        <MetricCard label="Overall Progress" value={totalTarget > 0 ? `${Math.round((totalSaved / totalTarget) * 100)}%` : "—"} accent="amber" />
      </div>

      {goals.length === 0 ? (
        <EmptyState icon={<Trophy size={48} />} message="No goals yet" action={
          <Button href="/goals/new" variant="primary">+ New Goal</Button>
        } />
      ) : (
        <div className="space-y-4">
          {goals.map((goal) => {
            const progress = goal.targetAmount > 0 ? Math.min(goal.currentAmount / goal.targetAmount, 1) : 0;
            const pct = Math.round(progress * 100);
            const isComplete = goal.currentAmount >= goal.targetAmount;
            return (
              <Card key={goal.id}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-2xl shrink-0">{goal.icon}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">{goal.name}</p>
                      <p className="text-[11px] text-text-secondary truncate">
                        {goal.account ? goal.account.name : "No linked account"}
                        {goal.deadline ? ` · Due ${new Date(goal.deadline).toLocaleDateString()}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <p className="text-sm font-bold text-white">
                        ${goal.currentAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })} / ${goal.targetAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </p>
                      <p className={`text-[11px] font-semibold ${isComplete ? "text-accent-green" : "text-accent-blue"}`}>
                        {isComplete ? "Completed!" : `${pct}%`}
                      </p>
                    </div>
                    {!isComplete && (
                      <Link href={`/goals/${goal.id}/edit`}
                        className="text-[11px] font-bold uppercase tracking-wider text-accent-green hover:text-white transition-colors">
                        Edit
                      </Link>
                    )}
                    <button onClick={() => handleDelete(goal.id)}
                      className="text-[11px] font-bold uppercase tracking-wider text-accent-coral hover:text-white transition-colors">
                      Delete
                    </button>
                  </div>
                </div>
                <ProgressBar progress={pct} color={isComplete ? "#00FF87" : goal.color} height={7} />
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
