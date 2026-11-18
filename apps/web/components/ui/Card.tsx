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
          'rounded-card border transition-all duration-fast shadow-[0_4px_24px_rgba(0,0,0,0.45)] backdrop-blur-sm',
          elevated
            ? 'bg-gradient-to-b from-[#18181c] to-[#111114] border-white/10 hover:border-gold/30 shadow-[0_8px_32px_rgba(0,0,0,0.6)]'
            : 'bg-gradient-to-b from-[#131317] to-[#0e0e11] border-white/[0.07] hover:border-gold/25',
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

