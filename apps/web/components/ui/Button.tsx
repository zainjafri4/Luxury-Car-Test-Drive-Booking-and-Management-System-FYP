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
      primary: 'bg-gold text-on-gold hover:bg-gold-hover shadow-sm',
      secondary: 'bg-transparent border border-gold text-gold hover:bg-surface-2',
      ghost: 'bg-transparent text-text hover:bg-surface-2 hover:text-gold',
      danger: 'bg-transparent border border-danger text-danger hover:bg-danger hover:text-text',
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

