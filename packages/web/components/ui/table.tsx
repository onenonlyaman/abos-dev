import { cn } from '@/lib/utils';

export function Table({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">{children}</table>
    </div>
  );
}

export function Thead({ children }: { children: React.ReactNode }) {
  return (
    <thead className="border-b border-zinc-200 text-xs uppercase tracking-wide text-zinc-500">
      <tr>{children}</tr>
    </thead>
  );
}

export function Th({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <th className={cn('px-5 py-2.5 font-medium', className)}>{children}</th>;
}

export function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={cn('px-5 py-3 text-zinc-800', className)}>{children}</td>;
}

export function Tr({ children }: { children: React.ReactNode }) {
  return <tr className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50">{children}</tr>;
}
