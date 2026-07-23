import { type LucideIcon } from 'lucide-react';

export function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-line-strong px-6 py-16 text-center">
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-surface-2 text-ink-3">
        <Icon className="h-5 w-5" strokeWidth={1.6} />
      </span>
      <p className="mt-3 text-sm font-semibold text-ink">{title}</p>
      <p className="mt-1 max-w-sm text-[13px] text-ink-3">{description}</p>
    </div>
  );
}
