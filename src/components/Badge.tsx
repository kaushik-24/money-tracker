interface BadgeProps {
  variant: "income" | "expense";
  children: React.ReactNode;
}

export function Badge({ variant, children }: BadgeProps) {
  const styles: Record<string, string> = {
    income: "bg-[#003320] text-accent-green",
    expense: "bg-[#2D0010] text-accent-coral",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider rounded ${styles[variant]}`}>
      {children}
    </span>
  );
}
