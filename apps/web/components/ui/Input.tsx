import React from 'react';
import clsx from 'clsx';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wider">
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={clsx(
            'w-full h-[44px] px-3.5 bg-[#0e0e12] border border-white/[0.09] rounded-input text-text text-sm transition-all duration-fast placeholder:text-text-faint focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/25 shadow-inner',
            error && 'border-danger/70 bg-danger/[0.03] text-red-100 focus:border-danger focus:ring-danger/25',
            className,
          )}
          {...props}
        />
        {error && <p className="mt-1.5 text-xs text-red-400 font-medium">{error}</p>}
      </div>
    );
  },
);

Input.displayName = 'Input';

