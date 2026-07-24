import { type LucideIcon } from 'lucide-react';

const TONES = {
  brand: 'bg-brand text-brand-ink',
  blue: 'bg-surface-2 text-ink border border-line',
  green: 'bg-surface-2 text-ink border border-line',
  amber: 'bg-surface-2 text-ink border border-line',
  red: 'bg-surface-2 text-ink border border-line',
} as const;

export function Stat({
  icon: Icon,
  value,
  label,
  sub,
  tone = 'brand',
}: {
  icon: LucideIcon;
  value: React.ReactNode;
  label: string;
  sub?: string;
  tone?: keyof typeof TONES;
}) {
  return (
    <div className="rounded-md border border-line bg-surface p-4 shadow-card">
      <div className="flex items-center justify-between">
        <span className={`flex h-[32px] w-[32px] items-center justify-center rounded-md ${TONES[tone]}`}>
          <Icon className="h-[16px] w-[16px]" strokeWidth={2} />
        </span>
      </div>
      <p className="mt-3.5 text-[28px] font-bold leading-none tracking-tight text-ink tabular-nums">{value}</p>
      <p className="mt-1.5 text-[12px] font-medium uppercase tracking-wider text-ink-2">{label}</p>
      {sub && <p className="mt-0.5 text-[11px] text-ink-3">{sub}</p>}
    </div>
  );
}
