interface CardProps {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "a" | "button";
  href?: string;
  onClick?: () => void;
}

export function Card({ children, className = "", as: Tag = "div", ...props }: CardProps) {
  return (
    <Tag
      className={`bg-bg-card border border-white/10 rounded-xl p-5 transition-all duration-200 hover:bg-white/[0.02] hover:border-white/20 ${className}`}
      {...props}
    >
      {children}
    </Tag>
  );
}
