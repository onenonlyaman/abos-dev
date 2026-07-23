import { type LucideIcon } from 'lucide-react';

const TONES = {
  brand: 'bg-brand-tint text-brand-ink',
  blue: 'bg-info-tint text-info',
  green: 'bg-success-tint text-success',
  amber: 'bg-warning-tint text-warning',
  red: 'bg-danger-tint text-danger',
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
    <div className="rounded-xl border border-line bg-surface p-4 shadow-card">
      <div className="flex items-center justify-between">
        <span className={`flex h-[34px] w-[34px] items-center justify-center rounded-[9px] ${TONES[tone]}`}>
          <Icon className="h-[18px] w-[18px]" strokeWidth={1.9} />
        </span>
      </div>
      <p className="mt-3.5 text-[29px] font-bold leading-none tracking-[-0.02em] text-ink tabular-nums">{value}</p>
      <p className="mt-1.5 text-[12.5px] font-medium text-ink-2">{label}</p>
      {sub && <p className="mt-0.5 text-[11.5px] text-ink-3">{sub}</p>}
    </div>
  );
}
