import { cn } from '@/lib/utils';

const TONES = {
  neutral: 'bg-surface-2 text-ink-2',
  blue: 'bg-info-tint text-info',
  amber: 'bg-warning-tint text-warning',
  green: 'bg-success-tint text-success',
  red: 'bg-danger-tint text-danger',
} as const;

export function Badge({
  tone = 'neutral',
  dot = true,
  children,
}: {
  tone?: keyof typeof TONES;
  dot?: boolean;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-semibold',
        TONES[tone],
      )}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}
