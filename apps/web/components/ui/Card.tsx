import React from 'react';
import clsx from 'clsx';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  elevated?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, elevated = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx(
          'rounded-card border transition-colors duration-fast',
          elevated
            ? 'bg-surface-2 border-border hover:border-border-strong'
            : 'bg-surface border-border hover:border-border-strong',
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);

Card.displayName = 'Card';

