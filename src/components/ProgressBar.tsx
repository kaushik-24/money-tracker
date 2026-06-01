interface ProgressBarProps {
  progress: number;
  color?: string;
  height?: number;
}

export function ProgressBar({ progress, color = "#00FF87", height = 5 }: ProgressBarProps) {
  const pct = Math.min(Math.max(progress, 0), 100);
  return (
    <div className="w-full bg-white/5 rounded-full" style={{ height }}>
      <div
        className="rounded-full transition-all duration-700"
        style={{
          width: `${pct}%`,
          height,
          backgroundColor: color,
          transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      />
    </div>
  );
}
