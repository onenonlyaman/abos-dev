'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { NAV_GROUPS } from '@/lib/nav';

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 flex h-screen w-[248px] shrink-0 flex-col bg-[#0e1526] text-[#94a0b8]">
      <Link
        href="/"
        className="flex h-14 items-center gap-2.5 border-b border-white/[0.06] px-5"
      >
        <span className="flex h-[30px] w-[30px] items-center justify-center rounded-lg bg-gradient-to-br from-[#3b7ae0] to-[#2563c9] text-[15px] font-bold text-white">
          A
        </span>
        <span className="text-[15px] font-semibold tracking-tight text-white">ABOS</span>
        <span className="ml-auto text-[10px] font-semibold uppercase tracking-[0.08em] text-[#5c6884]">
          OS
        </span>
      </Link>

      <nav className="flex-1 overflow-y-auto px-3 py-3.5">
        {NAV_GROUPS.map((group, gi) => (
          <div key={group.label ?? gi} className={gi === 0 ? '' : 'mt-3.5'}>
            {group.label && (
              <p className="px-2.5 pb-1.5 text-[10.5px] font-bold uppercase tracking-[0.09em] text-[#5c6884]">
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
                    'group relative mb-0.5 flex items-center gap-3 rounded-lg px-2.5 py-2 text-[13.5px] font-medium transition-colors',
                    active
                      ? 'bg-[#161f35] text-white'
                      : 'text-[#94a0b8] hover:bg-white/[0.04] hover:text-[#cfd6e4]',
                  )}
                >
                  {active && (
                    <span className="absolute -left-3 bottom-1.5 top-1.5 w-[3px] rounded-r bg-brand" />
                  )}
                  <Icon
                    className={cn(
                      'h-[17px] w-[17px] shrink-0',
                      active ? 'text-brand' : 'text-[#94a0b8]/80 group-hover:text-[#cfd6e4]',
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

      <div className="flex items-center gap-2.5 border-t border-white/[0.06] px-3.5 py-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-tint text-[12px] font-semibold text-brand-ink">
          AM
        </span>
        <div className="leading-tight">
          <span className="block text-[12.5px] font-semibold text-[#e7ebf3]">Aman M.</span>
          <span className="text-[11px] text-[#5c6884]">Operations admin</span>
        </div>
      </div>
    </aside>
  );
}
