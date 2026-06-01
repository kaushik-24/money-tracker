import Link from "next/link";

interface ButtonProps {
  variant?: "primary" | "secondary" | "destructive";
  full?: boolean;
  href?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  children: React.ReactNode;
}

export function Button({ variant = "primary", full, href, children, className = "", ...props }: ButtonProps) {
  const base = "inline-flex items-center justify-center font-bold rounded-lg transition-all duration-150 active:scale-97 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] px-5 text-sm";
  const variants: Record<string, string> = {
    primary: "bg-accent-green text-[#003320] hover:brightness-110",
    secondary: "bg-transparent border border-white/20 text-white/80 hover:text-white hover:border-white/40 hover:bg-white/5",
    destructive: "bg-transparent border border-accent-coral/40 text-accent-coral hover:bg-accent-coral hover:text-white hover:border-accent-coral",
  };
  const classes = `${base} ${variants[variant]} ${full ? "w-full" : ""} ${className}`;

  if (href) {
    return <Link href={href} className={classes}>{children}</Link>;
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
