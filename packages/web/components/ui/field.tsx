import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Field = forwardRef<HTMLInputElement, FieldProps>(({ className, label, id, ...props }, ref) => {
  const input = <input ref={ref} id={id} className={cn('input', className)} {...props} />;

  if (!label) return input;

  return (
    <div className="space-y-1">
      <label htmlFor={id} className="text-xs font-medium text-ink-2">
        {label}
      </label>
      {input}
    </div>
  );
});
Field.displayName = 'Field';
