"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", inviteCode: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Registration failed");
      setLoading(false);
      return;
    }

    const result = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    if (result?.error) {
      router.push("/login");
    } else {
      router.push("/");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] px-4">
      <div className="w-full max-w-sm">
        <div className="bg-bg-card border border-white/10 rounded-lg p-8">
          <h1 className="text-lg font-bold text-white mb-1">Money Tracker</h1>
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-secondary mb-8">Create your account</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-[#2D0010] border border-accent-coral text-accent-coral text-sm px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-xs font-semibold uppercase tracking-widest text-text-secondary mb-1.5">
                Name <span className="text-text-secondary/50">(optional)</span>
              </label>
              <input
                id="name"
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full h-11 px-3 bg-bg-elevated border border-white/10 rounded-lg text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-accent-green"
                placeholder="Your name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-widest text-text-secondary mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full h-11 px-3 bg-bg-elevated border border-white/10 rounded-lg text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-accent-green"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-widest text-text-secondary mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full h-11 px-3 bg-bg-elevated border border-white/10 rounded-lg text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-accent-green"
                placeholder="At least 6 characters"
                minLength={6}
                required
              />
            </div>

            <div>
              <label htmlFor="inviteCode" className="block text-xs font-semibold uppercase tracking-widest text-text-secondary mb-1.5">
                Invite Code <span className="text-text-secondary/50">(if required)</span>
              </label>
              <input
                id="inviteCode"
                type="text"
                value={form.inviteCode}
                onChange={(e) => setForm({ ...form, inviteCode: e.target.value })}
                className="w-full h-11 px-3 bg-bg-elevated border border-white/10 rounded-lg text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-accent-green"
                placeholder="Leave blank if not needed"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 text-sm font-bold text-[#003320] bg-accent-green rounded-lg disabled:opacity-50 hover:scale-102 active:scale-97 transition-all"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="text-center text-[11px] text-text-secondary mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-accent-green font-bold uppercase tracking-wider hover:text-white transition-colors">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
