import { cn } from '@/lib/utils';

const TONES = {
  neutral: 'bg-surface-2 text-ink-2 border border-line',
  blue: 'bg-info-tint text-ink border border-line-strong',
  amber: 'bg-warning-tint text-ink border border-line-strong',
  green: 'bg-success-tint text-ink font-bold border border-line-strong',
  red: 'bg-danger-tint text-ink font-bold border border-line-strong',
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
        'inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-semibold uppercase tracking-wider',
        TONES[tone],
      )}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-brand" />}
      {children}
    </span>
  );
}
