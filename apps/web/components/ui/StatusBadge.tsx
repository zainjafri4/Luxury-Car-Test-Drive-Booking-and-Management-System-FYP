import React from 'react';
import clsx from 'clsx';

export type BookingStatusType = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED';

export interface StatusBadgeProps {
  status: BookingStatusType;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const configs: Record<
    BookingStatusType,
    { label: string; dotClass: string; bgClass: string; textClass: string }
  > = {
    PENDING: {
      label: 'Pending',
      dotClass: 'bg-warning',
      bgClass: 'bg-warning/10 border-warning/30',
      textClass: 'text-warning',
    },
    APPROVED: {
      label: 'Approved',
      dotClass: 'bg-success',
      bgClass: 'bg-success/10 border-success/30',
      textClass: 'text-success',
    },
    REJECTED: {
      label: 'Rejected',
      dotClass: 'bg-danger',
      bgClass: 'bg-danger/10 border-danger/30',
      textClass: 'text-danger',
    },
    CANCELLED: {
      label: 'Cancelled',
      dotClass: 'bg-text-faint',
      bgClass: 'bg-surface-2 border-border',
      textClass: 'text-text-muted',
    },
    COMPLETED: {
      label: 'Completed',
      dotClass: 'bg-info',
      bgClass: 'bg-info/10 border-info/30',
      textClass: 'text-info',
    },
  };

  const config = configs[status];

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 px-3 py-1 rounded-badge border text-xs font-medium tracking-wide uppercase',
        config.bgClass,
        config.textClass,
        className,
      )}
    >
      <span className={clsx('h-1.5 w-1.5 rounded-full animate-pulse', config.dotClass)} />
      {config.label}
    </span>
  );
};

