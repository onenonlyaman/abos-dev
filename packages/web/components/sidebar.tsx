'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { NAV_GROUPS } from '@/lib/nav';

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 flex h-screen w-[240px] shrink-0 flex-col border-r border-line bg-surface text-ink-2">
      <Link
        href="/"
        className="flex h-14 items-center gap-2.5 border-b border-line px-5"
      >
        <span className="flex h-[26px] w-[26px] items-center justify-center rounded-md bg-brand text-[13px] font-bold text-brand-ink">
          A
        </span>
        <span className="text-[14px] font-bold tracking-wider uppercase text-ink">ABOS</span>
        <span className="ml-auto text-[9.5px] font-bold uppercase tracking-widest text-ink-3">
          ENTERPRISE
        </span>
      </Link>

      <nav className="flex-1 overflow-y-auto px-2.5 py-3">
        {NAV_GROUPS.map((group, gi) => (
          <div key={group.label ?? gi} className={gi === 0 ? '' : 'mt-3'}>
            {group.label && (
              <p className="px-2 pb-1 text-[10px] font-bold uppercase tracking-widest text-ink-3">
                {group.label}
              </p>
            )}
            {group.items.map(({ href, label, icon: Icon }) => {
              const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'group relative mb-0.5 flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[12.5px] font-medium transition-colors',
                    active
                      ? 'bg-surface-2 text-ink border-l-2 border-brand font-semibold'
                      : 'text-ink-2 hover:bg-surface-2/60 hover:text-ink',
                  )}
                >
                  <Icon
                    className={cn(
                      'h-[15px] w-[15px] shrink-0',
                      active ? 'text-ink' : 'text-ink-3 group-hover:text-ink-2',
                    )}
                    strokeWidth={1.9}
                  />
                  <span className="truncate">{label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="flex items-center gap-2.5 border-t border-line px-3.5 py-3">
        <span className="flex h-7 w-7 items-center justify-center rounded-md border border-line bg-surface-2 text-[11px] font-semibold text-ink">
          AM
        </span>
        <div className="leading-tight">
          <span className="block text-[12px] font-semibold text-ink">Aman M.</span>
          <span className="text-[10px] text-ink-3 uppercase tracking-wider">Enterprise Admin</span>
        </div>
      </div>
    </aside>
  );
}
