import { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, id, children, ...props }, ref) => {
    const select = (
      <div className="relative">
        <select
          ref={ref}
          id={id}
          className={cn(
            'h-9 w-full appearance-none rounded-lg border border-line bg-surface pl-3 pr-8 text-sm text-ink transition-colors',
            'focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25',
            'disabled:cursor-not-allowed disabled:bg-surface-2 disabled:text-ink-3',
            className,
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-3"
          strokeWidth={2}
        />
      </div>
    );

    if (!label) return select;

    return (
      <div className="space-y-1">
        <label htmlFor={id} className="text-xs font-medium text-ink-2">
          {label}
        </label>
        {select}
      </div>
    );
  },
);
Select.displayName = 'Select';
