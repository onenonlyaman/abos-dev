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
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-zinc-300 px-6 py-16 text-center">
      <Icon className="h-8 w-8 text-zinc-300" strokeWidth={1.5} />
      <p className="mt-3 text-sm font-medium text-zinc-900">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-zinc-500">{description}</p>
    </div>
  );
}
