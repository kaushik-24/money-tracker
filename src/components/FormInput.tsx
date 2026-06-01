interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
}

export function FormInput({ label, hint, className = "", id, ...props }: FormInputProps) {
  const inputId = id || label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div>
      <label htmlFor={inputId} className="block text-xs font-semibold uppercase tracking-widest text-text-secondary mb-1.5">
        {label}{hint && <span className="font-normal normal-case tracking-normal text-text-secondary ml-1">({hint})</span>}
      </label>
      <input
        id={inputId}
        className={`w-full px-3 py-2.5 bg-bg-elevated border border-white/10 rounded-lg text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-accent-green min-h-[44px] md:min-h-[38px] ${className}`}
        {...props}
      />
    </div>
  );
}
