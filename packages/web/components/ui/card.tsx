import { cn } from '@/lib/utils';

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn('rounded-lg border border-zinc-200 bg-white shadow-sm', className)}>
      {children}
    </div>
  );
}

export function CardHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="border-b border-zinc-200 px-5 py-4">
      <h2 className="text-sm font-semibold text-zinc-900">{title}</h2>
      {description && <p className="mt-0.5 text-sm text-zinc-500">{description}</p>}
    </div>
  );
}

export function CardBody({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('px-5 py-4', className)}>{children}</div>;
}
