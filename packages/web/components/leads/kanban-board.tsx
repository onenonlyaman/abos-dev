'use client';

import { useState } from 'react';
import { Phone } from 'lucide-react';
import type { LeadState } from '@/lib/types';
import type { Lead } from '@/lib/types-extra';
import { cn } from '@/lib/utils';

const COLUMNS: { state: LeadState; label: string }[] = [
  { state: 'new', label: 'New' },
  { state: 'contacted', label: 'Contacted' },
  { state: 'qualified', label: 'Qualified' },
  { state: 'site_visit_scheduled', label: 'Visit scheduled' },
  { state: 'site_visit_done', label: 'Visit done' },
  { state: 'negotiation', label: 'Negotiation' },
  { state: 'booked', label: 'Booked' },
  { state: 'lost', label: 'Lost' },
];

const COLUMN_ACCENT: Record<LeadState, string> = {
  new: 'bg-ink-3',
  contacted: 'bg-info',
  qualified: 'bg-info',
  site_visit_scheduled: 'bg-warning',
  site_visit_done: 'bg-warning',
  negotiation: 'bg-warning',
  booked: 'bg-success',
  lost: 'bg-danger',
};

export function KanbanBoard({
  leads,
  onMove,
  movingId,
}: {
  leads: Lead[];
  onMove: (lead: Lead, target: LeadState) => void;
  movingId: string | null;
}) {
  const [dragId, setDragId] = useState<string | null>(null);
  const [overCol, setOverCol] = useState<LeadState | null>(null);

  const byState = (state: LeadState) => leads.filter((l) => l.state === state);

  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex gap-3" style={{ minWidth: COLUMNS.length * 232 }}>
        {COLUMNS.map((col) => {
          const items = byState(col.state);
          const isOver = overCol === col.state;
          return (
            <div
              key={col.state}
              onDragOver={(e) => {
                e.preventDefault();
                setOverCol(col.state);
              }}
              onDragLeave={() => setOverCol((c) => (c === col.state ? null : c))}
              onDrop={(e) => {
                e.preventDefault();
                setOverCol(null);
                const id = e.dataTransfer.getData('text/plain');
                const lead = leads.find((l) => l.id === id);
                setDragId(null);
                if (lead && lead.state !== col.state) onMove(lead, col.state);
              }}
              className={cn(
                'flex w-[220px] shrink-0 flex-col rounded-xl border bg-surface-2 transition-colors',
                isOver ? 'border-brand bg-brand-tint/40' : 'border-line',
              )}
            >
              <div className="flex items-center gap-2 border-b border-line px-3 py-2.5">
                <span className={cn('h-1.5 w-1.5 rounded-full', COLUMN_ACCENT[col.state])} />
                <span className="text-xs font-semibold text-ink">{col.label}</span>
                <span className="ml-auto text-[11px] font-medium tabular-nums text-ink-3">{items.length}</span>
              </div>

              <div className="flex-1 space-y-2 p-2">
                {items.map((lead) => (
                  <div
                    key={lead.id}
                    draggable
                    onDragStart={(e) => {
                      setDragId(lead.id);
                      e.dataTransfer.setData('text/plain', lead.id);
                      e.dataTransfer.effectAllowed = 'move';
                    }}
                    onDragEnd={() => setDragId(null)}
                    className={cn(
                      'cursor-grab select-none rounded-lg border border-line bg-surface p-2.5 shadow-card active:cursor-grabbing',
                      dragId === lead.id && 'opacity-40',
                      movingId === lead.id && 'animate-pulse',
                    )}
                  >
                    <p className="text-[13px] font-semibold text-ink">{lead.name}</p>
                    <p className="mt-1 flex items-center gap-1 text-[11.5px] text-ink-3">
                      <Phone className="h-3 w-3" strokeWidth={2} />
                      {lead.phone}
                    </p>
                    {lead.unit?.code && (
                      <p className="mt-1 font-mono text-[11px] font-semibold text-ink-2">{lead.unit.code}</p>
                    )}
                    <p className="mt-1.5 text-[10.5px] uppercase tracking-wide text-ink-3">
                      {lead.source.replace(/_/g, ' ')}
                    </p>
                  </div>
                ))}
                {items.length === 0 && (
                  <div className="rounded-lg border border-dashed border-line-strong py-6 text-center text-[11px] text-ink-3">
                    Empty
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
