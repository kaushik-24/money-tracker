interface MetricCardProps {
  label: string;
  value: string;
  sub?: string;
  accent: "green" | "coral" | "blue" | "amber";
}

const accentText: Record<string, string> = {
  green: "text-accent-green",
  coral: "text-accent-coral",
  blue: "text-accent-blue",
  amber: "text-accent-amber",
};

const accentBorder: Record<string, string> = {
  green: "border-l-accent-green/40",
  coral: "border-l-accent-coral/40",
  blue: "border-l-accent-blue/40",
  amber: "border-l-accent-amber/40",
};

export function MetricCard({ label, value, sub, accent }: MetricCardProps) {
  return (
    <div className={`min-w-0 bg-bg-card border border-white/10 rounded-xl p-4 md:p-5 border-l-[3px] ${accentBorder[accent]}`}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-white/50 mb-1">{label}</p>
      <p className={`text-[28px] md:text-[36px] lg:text-[40px] font-bold leading-none -tracking-[0.03em] truncate ${accentText[accent]}`}>
        {value}
      </p>
      {sub && <p className="text-[11px] text-white/50 mt-1.5">{sub}</p>}
    </div>
  );
}
