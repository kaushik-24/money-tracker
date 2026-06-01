"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/Card";
import { Trash2, ShieldAlert } from "lucide-react";

interface UserData {
  id: string;
  name: string | null;
  email: string;
  isAdmin: boolean;
  createdAt: string;
  _count: {
    accounts: number;
    transactions: number;
    budgets: number;
    goals: number;
    investments: number;
    categories: number;
  };
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user?.isAdmin) {
      router.push("/dashboard");
      return;
    }
    fetch("/api/users")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setUsers(data);
        setLoading(false);
      });
  }, [session, status, router]);

  async function handleDelete(userId: string) {
    if (!confirm("Delete this user and all their data? This cannot be undone.")) return;
    setDeleting(userId);
    const res = await fetch(`/api/users/${userId}`, { method: "DELETE" });
    if (res.ok) {
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    }
    setDeleting(null);
  }

  if (status === "loading" || loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-bg-elevated rounded w-32" />
          <div className="h-64 bg-bg-elevated rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-[900px] mx-auto space-y-6">
      <div>
        <h1 className="text-[15px] md:text-[18px] font-semibold text-white">Admin</h1>
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-secondary mt-1">
          Manage users
        </p>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left">
                <th className="pb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-text-secondary">Email</th>
                <th className="pb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-text-secondary">Name</th>
                <th className="pb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-text-secondary">Joined</th>
                <th className="pb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-text-secondary">Accounts</th>
                <th className="pb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-text-secondary">Txns</th>
                <th className="pb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-text-secondary">Budgets</th>
                <th className="pb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-text-secondary"></th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-white/5 last:border-0">
                  <td className="py-3 pr-3 text-white">
                    <span className="flex items-center gap-1.5">
                      {user.email}
                      {user.isAdmin && <ShieldAlert size={14} className="text-accent-green shrink-0" />}
                    </span>
                  </td>
                  <td className="py-3 pr-3 text-text-secondary">{user.name || "—"}</td>
                  <td className="py-3 pr-3 text-text-secondary whitespace-nowrap">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 pr-3 text-text-secondary">{user._count.accounts}</td>
                  <td className="py-3 pr-3 text-text-secondary">{user._count.transactions}</td>
                  <td className="py-3 pr-3 text-text-secondary">{user._count.budgets}</td>
                  <td className="py-3 text-right">
                    {!user.isAdmin && (
                      <button
                        onClick={() => handleDelete(user.id)}
                        disabled={deleting === user.id}
                        className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-accent-coral hover:text-white transition-colors disabled:opacity-50"
                      >
                        <Trash2 size={12} />
                        {deleting === user.id ? "Deleting..." : "Delete"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-sm text-text-secondary">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
