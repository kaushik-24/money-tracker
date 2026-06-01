"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { MetricCard } from "@/components/MetricCard";
import { EmptyState } from "@/components/EmptyState";
import { TrendingUp } from "lucide-react";

interface Investment {
  id: string;
  name: string;
  type: string;
  shares: number;
  purchasePrice: number;
  currentPrice: number;
  account: { name: string; color: string };
}

const TYPE_COLORS: Record<string, string> = {
  stock: "#3D7EFF",
  crypto: "#FFB700",
  etf: "#00FF87",
  mutual_fund: "#06b6d4",
  bond: "#a855f7",
};

const TYPE_LABELS: Record<string, string> = {
  stock: "Stock",
  crypto: "Crypto",
  etf: "ETF",
  mutual_fund: "Mutual Fund",
  bond: "Bond",
};

export default function InvestmentsPage() {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/investments")
      .then(async (r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (Array.isArray(data)) setInvestments(data);
        setLoading(false);
      });
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this investment?")) return;
    const r = await fetch(`/api/investments/${id}`, { method: "DELETE" });
    if (r.ok) setInvestments((prev) => prev.filter((i) => i.id !== id));
  }

  if (loading) {
    return (
      <div className="p-4 md:p-6 animate-pulse space-y-4">
        <div className="h-6 bg-bg-elevated rounded w-40" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-bg-elevated rounded-lg" />)}
        </div>
      </div>
    );
  }

  const totalValue = investments.reduce((sum, inv) => sum + inv.shares * inv.currentPrice, 0);
  const totalCost = investments.reduce((sum, inv) => sum + inv.shares * inv.purchasePrice, 0);
  const totalGain = totalValue - totalCost;

  return (
    <div className="p-4 md:p-6 max-w-[1100px] mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[15px] md:text-[18px] font-semibold -tracking-[0.01em] text-white">Investments</h1>
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-secondary mt-1">
            {investments.length} holding{investments.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button href="/investments/new" variant="primary">+ New Investment</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
        <MetricCard label="Total Value" value={`$${totalValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}`} accent="blue" />
        <MetricCard label="Cost Basis" value={`$${totalCost.toLocaleString("en-US", { minimumFractionDigits: 2 })}`} accent="amber" />
        <MetricCard label="Total Gain/Loss"
          value={`${totalGain >= 0 ? "+" : ""}$${totalGain.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
          accent={totalGain >= 0 ? "green" : "coral"} />
      </div>

      {investments.length === 0 ? (
        <EmptyState icon={<TrendingUp size={48} />} message="No investments yet" action={
          <Button href="/investments/new" variant="primary">+ New Investment</Button>
        } />
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="divide-y divide-white/10">
            {investments.map((inv) => {
              const value = inv.shares * inv.currentPrice;
              const cost = inv.shares * inv.purchasePrice;
              const gain = value - cost;
              const gainPercent = cost > 0 ? (gain / cost) * 100 : 0;
              return (
                <div key={inv.id} className="flex items-center justify-between px-4 md:px-5 py-4">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-[38px] h-[38px] rounded-lg flex items-center justify-center text-sm font-bold text-white shrink-0"
                      style={{ backgroundColor: TYPE_COLORS[inv.type] || "#6b7280" }}>
                      {inv.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">{inv.name}</p>
                      <p className="text-[11px] text-text-secondary">{TYPE_LABELS[inv.type] || inv.type} · {inv.shares} shares</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <p className="text-sm font-bold text-white">${value.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
                      <p className={`text-[11px] font-semibold ${gain >= 0 ? "text-accent-green" : "text-accent-coral"}`}>
                        {gain >= 0 ? "+" : ""}{gainPercent.toFixed(1)}%
                      </p>
                    </div>
                    <Link href={`/investments/${inv.id}/edit`}
                      className="text-[11px] font-bold uppercase tracking-wider text-accent-green hover:text-white transition-colors">
                      Edit
                    </Link>
                    <button onClick={() => handleDelete(inv.id)}
                      className="text-[11px] font-bold uppercase tracking-wider text-accent-coral hover:text-white transition-colors">
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
