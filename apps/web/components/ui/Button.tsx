import React from 'react';
import clsx from 'clsx';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, disabled, children, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-sans font-medium rounded-input transition-colors duration-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-soft disabled:opacity-50 disabled:pointer-events-none';

    const variants = {
      primary:
        'bg-gradient-to-r from-[#d9b257] via-[#c9a24b] to-[#b38936] text-[#0b0b0c] font-semibold hover:from-[#e5c26b] hover:to-[#be933f] shadow-[0_2px_14px_rgba(201,162,75,0.25)] hover:shadow-[0_4px_22px_rgba(201,162,75,0.4)] active:scale-[0.99]',
      secondary:
        'bg-white/[0.02] border border-gold/50 text-gold hover:bg-gold/10 hover:border-gold shadow-sm backdrop-blur-sm',
      ghost:
        'bg-transparent text-text-muted hover:text-text hover:bg-white/[0.05]',
      danger:
        'bg-danger/10 border border-danger/40 text-red-300 hover:bg-danger/25 hover:border-danger hover:text-white shadow-sm',
    };

    const sizes = {
      sm: 'h-[36px] px-3 text-xs',
      md: 'h-[44px] px-5 text-sm',
      lg: 'h-[52px] px-7 text-base tracking-wide',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={clsx(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
        ) : null}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';

