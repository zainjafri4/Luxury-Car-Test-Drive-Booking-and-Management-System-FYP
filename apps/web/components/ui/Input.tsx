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
            'w-full h-[44px] px-3.5 bg-surface border border-border rounded-input text-text text-sm transition-colors duration-fast placeholder:text-text-faint focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold',
            error && 'border-danger focus:border-danger focus:ring-danger',
            className,
          )}
          {...props}
        />
        {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
      </div>
    );
  },
);

Input.displayName = 'Input';

