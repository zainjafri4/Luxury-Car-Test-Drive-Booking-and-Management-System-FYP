import React from 'react';
import clsx from 'clsx';
import { Card } from '../ui/Card';

export interface SlotItem {
  id: string;
  startsAt: string;
  endsAt: string;
  isBooked: boolean;
}

export interface SlotPickerProps {
  slots: SlotItem[];
  selectedSlotId?: string;
  onSelectSlot: (slotId: string) => void;
  timezone?: string;
}

export const SlotPicker: React.FC<SlotPickerProps> = ({
  slots,
  selectedSlotId,
  onSelectSlot,
  timezone = 'Asia/Karachi',
}) => {
  // Group slots by Date string (YYYY-MM-DD)
  const groupedSlots = slots.reduce<Record<string, SlotItem[]>>((acc, slot) => {
    const dateKey = new Date(slot.startsAt).toISOString().split('T')[0]!;
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(slot);
    return acc;
  }, {});

  const dates = Object.keys(groupedSlots).sort();
  const [activeDate, setActiveDate] = React.useState<string>(dates[0] || '');

  React.useEffect(() => {
    if (dates.length > 0 && !activeDate) {
      setActiveDate(dates[0]!);
    }
  }, [dates, activeDate]);

  if (dates.length === 0) {
    return (
      <Card className="p-6 text-center text-text-muted">
        <p>No available test-drive slots scheduled for this vehicle currently.</p>
      </Card>
    );
  }

  const currentDaySlots = groupedSlots[activeDate] || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs text-text-muted">
        <span className="eyebrow">Select Date & Time</span>
        <span>Times shown in {timezone}</span>
      </div>

      {/* Date Strip */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {dates.map((d) => {
          const dateObj = new Date(d);
          const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
          const dayNum = dateObj.getDate();
          const monthName = dateObj.toLocaleDateString('en-US', { month: 'short' });
          const isSelected = d === activeDate;

          return (
            <button
              key={d}
              onClick={() => setActiveDate(d)}
              className={clsx(
                'flex flex-col items-center min-w-[70px] py-2.5 px-3 rounded-input border transition-colors duration-fast text-center',
                isSelected
                  ? 'bg-gold/10 border-gold text-gold font-semibold'
                  : 'bg-surface border-border text-text-muted hover:border-border-strong hover:text-text',
              )}
            >
              <span className="text-xs uppercase">{dayName}</span>
              <span className="text-base font-serif font-bold text-text my-0.5">{dayNum}</span>
              <span className="text-[10px] text-text-faint">{monthName}</span>
            </button>
          );
        })}
      </div>

      {/* Time Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 pt-2">
        {currentDaySlots.map((slot) => {
          const timeStr = new Date(slot.startsAt).toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          });

          const isSelected = selectedSlotId === slot.id;

          if (slot.isBooked) {
            return (
              <div
                key={slot.id}
                title="Already booked"
                className="h-[44px] flex items-center justify-center rounded-input border border-border bg-surface-2/40 text-text-faint text-xs line-through cursor-not-allowed select-none"
              >
                {timeStr}
              </div>
            );
          }

          return (
            <button
              key={slot.id}
              onClick={() => onSelectSlot(slot.id)}
              className={clsx(
                'h-[44px] flex items-center justify-center rounded-input border text-xs font-medium transition-colors duration-fast',
                isSelected
                  ? 'bg-gold text-on-gold font-semibold border-gold shadow-sm'
                  : 'bg-surface border-border text-text hover:border-gold hover:text-gold',
              )}
            >
              {timeStr}
            </button>
          );
        })}
      </div>
    </div>
  );
};

