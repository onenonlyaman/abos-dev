'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Building2,
  KeyRound,
  Users,
  Truck,
  Warehouse,
  Wallet,
  ListChecks,
  IdCard,
  LayoutGrid,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/', label: 'Overview', icon: LayoutGrid },
  { href: '/booking', label: 'Booking & Units', icon: KeyRound },
  { href: '/leads', label: 'Sales CRM', icon: Users },
  { href: '/procurement', label: 'Procurement', icon: Building2 },
  { href: '/inventory', label: 'Inventory', icon: Warehouse },
  { href: '/finance', label: 'Finance / Budget', icon: Wallet },
  { href: '/tasks', label: 'Tasks', icon: ListChecks },
  { href: '/hr', label: 'HR', icon: IdCard },
  { href: '/fleet', label: 'Fleet', icon: Truck },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col border-r border-zinc-200 bg-white">
      <div className="flex h-14 items-center border-b border-zinc-200 px-5">
        <span className="text-sm font-semibold tracking-tight text-zinc-900">ABOS</span>
        <span className="ml-2 text-xs text-zinc-400">Enterprise OS</span>
      </div>
      <nav className="flex-1 space-y-0.5 px-2 py-3">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                active ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:bg-zinc-100',
              )}
            >
              <Icon className="h-4 w-4" strokeWidth={1.75} />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-zinc-200 px-5 py-3 text-xs text-zinc-400">v0.1.0 · dev</div>
    </aside>
  );
}
