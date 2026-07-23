'use client';

import { useState } from 'react';
import { ChevronDown, Plus } from 'lucide-react';
import { Card, CardBody } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export function Disclosure({
  title,
  description,
  defaultOpen = false,
  open: openProp,
  onOpenChange,
  children,
}: {
  title: string;
  description?: string;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}) {
  const [openState, setOpenState] = useState(defaultOpen);
  const open = openProp ?? openState;
  const setOpen = (next: boolean) => {
    setOpenState(next);
    onOpenChange?.(next);
  };

  return (
    <Card>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <span className="flex items-center gap-2.5">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-brand-tint text-brand-ink">
            <Plus className={cn('h-3.5 w-3.5 transition-transform', open && 'rotate-45')} strokeWidth={2.2} />
          </span>
          <span>
            <span className="block text-sm font-semibold text-ink">{title}</span>
            {description && <span className="block text-xs text-ink-3">{description}</span>}
          </span>
        </span>
        <ChevronDown
          className={cn('h-4 w-4 shrink-0 text-ink-3 transition-transform', open && 'rotate-180')}
          strokeWidth={2}
        />
      </button>
      {open && <CardBody className="border-t border-line pt-4">{children}</CardBody>}
    </Card>
  );
}
