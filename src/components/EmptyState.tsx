interface EmptyStateProps {
  icon?: React.ReactNode;
  message: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, message, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      {icon ? (
        <div className="text-5xl mb-4 opacity-20">{icon}</div>
      ) : (
        <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 mb-4" />
      )}
      <p className="text-sm text-white/40 text-center mb-4">{message}</p>
      {action}
    </div>
  );
}
