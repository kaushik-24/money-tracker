"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { MetricCard } from "@/components/MetricCard";
import { Card } from "@/components/Card";
import { ProgressBar } from "@/components/ProgressBar";
import { EmptyState } from "@/components/EmptyState";
import { ACCOUNT_TYPE_ICONS } from "@/lib/icons";
import { abbreviateNumber } from "@/lib/utils";
import { Building2, Trophy } from "lucide-react";

interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
  color: string;
}

interface Category {
  id: string;
  name: string;
  type: string;
  icon: string;
  color: string;
}

interface Transaction {
  id: string;
  amount: number;
  date: string;
  description: string;
  category: Category;
}

interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string | null;
  icon: string;
  color: string;
}

interface Budget {
  id: string;
  amount: number;
  period: string;
  startDate: string;
  category: { id: string; name: string; icon: string; color: string };
  _spent?: number;
}

const COLORS = ["#00FF87", "#3D7EFF", "#FF4D6D", "#FFB700", "#a855f7", "#06b6d4", "#eab308", "#ec4899"];

export default function Dashboard() {
  const { data: session } = useSession();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/accounts").then(async (r) => (r.ok ? r.json() : [])),
      fetch("/api/transactions").then(async (r) => (r.ok ? r.json() : [])),
      fetch("/api/goals").then(async (r) => (r.ok ? r.json() : [])),
      fetch("/api/budgets").then(async (r) => (r.ok ? r.json() : [])),
    ]).then(([accountsData, transactionsData, goalsData, budgetsData]) => {
      if (Array.isArray(accountsData)) setAccounts(accountsData);
      if (Array.isArray(transactionsData)) setTransactions(transactionsData);
      if (Array.isArray(goalsData)) setGoals(goalsData);
      if (Array.isArray(budgetsData)) {
        const now = new Date();
        const enriched = (budgetsData as Budget[]).map((b) => {
          const periodStart = getPeriodStart(b.period, b.startDate, now);
          const spent = Array.isArray(transactionsData)
            ? (transactionsData as Transaction[])
                .filter((t) => {
                  if (t.amount >= 0) return false;
                  const d = new Date(t.date);
                  return d >= periodStart && d <= now && t.category?.id === b.category?.id;
                })
                .reduce((s, t) => s + Math.abs(t.amount), 0)
            : 0;
          return { ...b, _spent: spent };
        });
        setBudgets(enriched);
      }
      setLoading(false);
    });
  }, []);

  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);
  const totalAssets = accounts.filter((a) => a.balance > 0).reduce((sum, a) => sum + a.balance, 0);
  const totalLiabilities = accounts.filter((a) => a.balance < 0).reduce((sum, a) => sum + Math.abs(a.balance), 0);
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlyTxns = transactions.filter((t) => {
    const d = new Date(t.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });
  const monthlyIncome = monthlyTxns.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const monthlyExpenses = monthlyTxns.filter((t) => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);

  const spendingByCategory: Record<string, { name: string; value: number; color: string }> = {};
  monthlyTxns
    .filter((t) => t.amount < 0)
    .forEach((t) => {
      const cat = t.category?.name || "Other";
      if (!spendingByCategory[cat]) {
        spendingByCategory[cat] = { name: cat, value: 0, color: t.category?.color || "#6b7280" };
      }
      spendingByCategory[cat].value += Math.abs(t.amount);
    });

  const pieData = Object.values(spendingByCategory).sort((a, b) => b.value - a.value).slice(0, 8);
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(currentYear, currentMonth - i, 1);
    return { month: d.toLocaleString("default", { month: "short" }), income: 0, expenses: 0 };
  }).reverse();

  transactions.forEach((t) => {
    const d = new Date(t.date);
    const monthStr = d.toLocaleString("default", { month: "short" });
    const entry = last6Months.find((m) => m.month === monthStr);
    if (entry) {
      if (t.amount > 0) entry.income += t.amount;
      else entry.expenses += Math.abs(t.amount);
    }
  });

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-6 bg-bg-elevated rounded w-48" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => <div key={i} className="h-24 bg-bg-elevated rounded-lg" />)}
          </div>
          <div className="h-64 bg-bg-elevated rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-[1100px] mx-auto space-y-6 md:space-y-8">
      <div>
        <h1 className="text-[15px] md:text-[18px] font-semibold -tracking-[0.01em] text-white">
          Welcome{session?.user?.name ? `, ${session.user.name}` : ""}
        </h1>
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-secondary mt-1">
          Financial overview
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <MetricCard label="Net Worth" value={`$${abbreviateNumber(totalBalance)}`} sub={totalLiabilities > 0 ? `${totalAssets >= 0 ? `$${totalAssets.toLocaleString("en-US", { minimumFractionDigits: 0 })}` : "$0"} assets · $${totalLiabilities.toLocaleString("en-US", { minimumFractionDigits: 0 })} liabilities` : "Across all accounts"} accent="blue" />
        <MetricCard label="Monthly Income" value={`$${abbreviateNumber(monthlyIncome)}`} sub={`${monthlyTxns.filter((t) => t.amount > 0).length} transactions`} accent="green" />
        <MetricCard label="Monthly Expenses" value={`$${abbreviateNumber(monthlyExpenses)}`} sub={`${monthlyTxns.filter((t) => t.amount < 0).length} transactions`} accent="coral" />
        <MetricCard label="Net Savings" value={`$${abbreviateNumber(monthlyIncome - monthlyExpenses)}`} sub="This month" accent="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <Card>
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-secondary mb-4">Income vs Expenses</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={last6Months}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "rgba(255,255,255,0.5)" }} stroke="rgba(255,255,255,0.08)" />
              <YAxis tick={{ fontSize: 11, fill: "rgba(255,255,255,0.5)" }} stroke="rgba(255,255,255,0.08)" />
              <Tooltip
                contentStyle={{ background: "#111", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6 }}
                labelStyle={{ color: "rgba(255,255,255,0.5)" }}
                itemStyle={{ color: "#fff" }}
              />
              <Bar dataKey="income" fill="#00FF87" radius={[4, 4, 0, 0]} name="Income" />
              <Bar dataKey="expenses" fill="#FF4D6D" radius={[4, 4, 0, 0]} name="Expenses" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-secondary mb-4">Spending by Category</h2>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100}
                  label={({ percent }: { name?: string; percent?: number }) =>
                    `${((percent ?? 0) * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={entry.name} fill={entry.color || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "#111", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6 }}
                  labelStyle={{ color: "rgba(255,255,255,0.5)" }}
                  itemStyle={{ color: "#fff" }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-sm text-white/40">No expenses this month</div>
          )}
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-secondary">Budget Progress</h2>
          <Link href="/budgets" className="text-[11px] font-bold uppercase tracking-wider text-accent-green hover:text-white transition-colors">
            View all
          </Link>
        </div>
        {budgets.filter((b) => (b._spent ?? 0) > 0 || (b.amount ?? 0) > 0).length > 0 ? (
          <div className="space-y-4">
            {budgets.filter((b) => (b._spent ?? 0) > 0 || (b.amount ?? 0) > 0).map((budget) => {
              const pct = budget.amount > 0 ? Math.min((budget._spent || 0) / budget.amount, 1) : 0;
              const pctDisplay = Math.round(pct * 100);
              const isOver = pct >= 1;
              return (
                <div key={budget.id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="flex items-center gap-2 text-sm text-white">
                      <span>{budget.category?.icon || "🎯"}</span>
                      <span className="truncate max-w-[160px]">{budget.category?.name || "Budget"}</span>
                    </span>
                    <span className={`text-[11px] font-semibold ${isOver ? "text-accent-coral" : "text-text-secondary"}`}>
                      {pctDisplay}%
                    </span>
                  </div>
                  <ProgressBar progress={pctDisplay} color={isOver ? "#FF4D6D" : "#00FF87"} />
                  <p className="text-[11px] text-text-secondary mt-1">
                    ${(budget._spent || 0).toLocaleString("en-US", { minimumFractionDigits: 0 })} / ${budget.amount.toLocaleString("en-US", { minimumFractionDigits: 0 })}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState message="No budgets set yet." action={
            <Link href="/budgets/new" className="inline-flex items-center h-11 px-5 text-sm font-bold rounded-lg bg-accent-green text-[#003320]">Create Budget</Link>
          } />
        )}
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-secondary">Accounts</h2>
          <Link href="/accounts" className="text-[11px] font-bold uppercase tracking-wider text-accent-green hover:text-white transition-colors">
            View all
          </Link>
        </div>
        <div className="space-y-3">
          {accounts.map((account) => (
            <div key={account.id} className="flex items-center justify-between py-2 border-b border-white/10 last:border-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${account.color}20` }}>
                  {(() => { const Icon = ACCOUNT_TYPE_ICONS[account.type]; return <Icon size={16} />; })()}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{account.name}</p>
                  <p className="text-[11px] text-text-secondary capitalize">{account.type}</p>
                </div>
              </div>
              <span className={`text-sm font-bold ${account.balance >= 0 ? "text-white" : "text-accent-coral"}`}>
                ${Math.abs(account.balance).toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            </div>
          ))}
          {accounts.length === 0 && (
            <EmptyState icon={<Building2 size={48} />} message="No accounts yet. Add one to get started." action={
              <Link href="/accounts/new" className="inline-flex items-center h-11 px-5 text-sm font-bold rounded-lg bg-accent-green text-[#003320]">+ New Account</Link>
            } />
          )}
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-secondary">Goals</h2>
          <Link href="/goals" className="text-[11px] font-bold uppercase tracking-wider text-accent-green hover:text-white transition-colors">View all</Link>
        </div>
        <div className="space-y-4">
          {goals.map((goal) => {
            const progress = goal.targetAmount > 0 ? Math.min(goal.currentAmount / goal.targetAmount, 1) : 0;
            const pct = Math.round(progress * 100);
            return (
              <div key={goal.id}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="flex items-center gap-2 text-sm text-white">
                    <span>{goal.icon}</span>
                    <span className="truncate max-w-[120px] md:max-w-[200px]">{goal.name}</span>
                  </span>
                  <span className="text-[11px] text-text-secondary font-semibold">{pct}%</span>
                </div>
                <ProgressBar progress={pct} color={goal.color} />
                <p className="text-[11px] text-text-secondary mt-1">
                  ${goal.currentAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })} / ${goal.targetAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </p>
              </div>
            );
          })}
          {goals.length === 0 && (
            <EmptyState icon={<Trophy size={48} />} message="No goals yet." action={
              <Link href="/goals/new" className="inline-flex items-center h-11 px-5 text-sm font-bold rounded-lg bg-accent-green text-[#003320]">Create Goal</Link>
            } />
          )}
        </div>
      </Card>
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
