'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Bell, Sun, Moon, ShieldAlert, Sparkles } from 'lucide-react';
import { navItemForPath } from '@/lib/nav';

function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.getAttribute('data-theme') === 'dark');
  }, []);

  function toggle() {
    const next = dark ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try {
      localStorage.setItem('abos-theme', next);
    } catch {
      /* ignore */
    }
    setDark(!dark);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle theme"
      className="flex h-[32px] w-[32px] items-center justify-center rounded-md border border-line bg-surface text-ink-2 transition-colors hover:bg-surface-2"
    >
      {dark ? <Sun className="h-3.5 w-3.5" strokeWidth={1.9} /> : <Moon className="h-3.5 w-3.5" strokeWidth={1.9} />}
    </button>
  );
}

export function Topbar() {
  const pathname = usePathname();
  const current = navItemForPath(pathname);
  const onDetail = current && pathname !== current.href;

  const openCmd = () => {
    const event = new KeyboardEvent('keydown', { key: 'k', metaKey: true, ctrlKey: true });
    window.dispatchEvent(event);
  };

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b border-line bg-surface px-6">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[12px] uppercase tracking-wider">
        <Link href="/" className="text-ink-2 transition-colors hover:text-ink">
          ABOS
        </Link>
        {current && current.href !== '/' && (
          <>
            <span className="text-ink-3/60">/</span>
            {onDetail ? (
              <Link href={current.href} className="text-ink-2 transition-colors hover:text-ink">
                {current.label}
              </Link>
            ) : (
              <span className="font-bold text-ink">{current.label}</span>
            )}
          </>
        )}
        {onDetail && (
          <>
            <span className="text-ink-3/60">/</span>
            <span className="font-bold text-ink">Detail</span>
          </>
        )}
      </nav>

      {/* Command Palette Trigger */}
      <button
        type="button"
        onClick={openCmd}
        className="ml-auto hidden items-center gap-2 rounded-md border border-line bg-surface-2 px-3 py-[6px] text-[12px] text-ink-3 transition hover:border-line-strong sm:flex"
      >
        <Search className="h-[14px] w-[14px]" strokeWidth={2} />
        <span className="w-44 truncate text-left">Search modules, actions…</span>
        <kbd className="rounded border border-line bg-surface px-1.5 py-px font-mono text-[10px] text-ink-2">
          ⌘K
        </kbd>
      </button>

      {/* Role Workspaces Button */}
      <Link
        href="/workspaces"
        className="hidden md:flex items-center space-x-1.5 px-2.5 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-md border border-line bg-surface text-ink-2 hover:bg-surface-2 transition"
      >
        <ShieldAlert className="w-3.5 h-3.5 text-ink" />
        <span>24 Role Workspaces</span>
      </Link>

      {/* AI Copilot Button */}
      <Link
        href="/copilot"
        className="flex items-center space-x-1.5 px-2.5 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-md bg-brand text-brand-ink hover:opacity-90 transition border border-brand"
      >
        <Sparkles className="w-3.5 h-3.5 text-brand-ink" />
        <span>AI Copilot</span>
      </Link>

      <button
        type="button"
        aria-label="Notifications"
        className="relative flex h-[32px] w-[32px] items-center justify-center rounded-md border border-line bg-surface text-ink-2 transition-colors hover:bg-surface-2"
      >
        <Bell className="h-3.5 w-3.5" strokeWidth={1.9} />
        <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-brand" />
      </button>

      <ThemeToggle />
    </header>
  );
}
