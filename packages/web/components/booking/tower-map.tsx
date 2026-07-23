'use client';

import { useMemo } from 'react';
import { Building2 } from 'lucide-react';
import type { Unit, Booking } from '@/lib/types';
import { cn } from '@/lib/utils';

const STATUS_STYLE: Record<Unit['status'], string> = {
  available: 'border-success/40 bg-success-tint text-success hover:border-success',
  held: 'border-warning/40 bg-warning-tint text-warning hover:border-warning',
  booked: 'border-info/40 bg-info-tint text-info hover:border-info',
};

const LEGEND: { status: Unit['status']; label: string }[] = [
  { status: 'available', label: 'Available' },
  { status: 'held', label: 'On hold' },
  { status: 'booked', label: 'Booked' },
];

export function TowerMap({
  units,
  bookingsByUnitId,
  selectedUnitId,
  onSelectUnit,
}: {
  units: Unit[];
  bookingsByUnitId: Record<string, Booking>;
  selectedUnitId: string | null;
  onSelectUnit: (unit: Unit) => void;
}) {
  const floors = useMemo(() => {
    const byFloor = new Map<number, Unit[]>();
    for (const u of units) {
      if (!byFloor.has(u.floor)) byFloor.set(u.floor, []);
      byFloor.get(u.floor)!.push(u);
    }
    return [...byFloor.entries()]
      .sort((a, b) => b[0] - a[0])
      .map(([floor, list]) => [floor, list.slice().sort((a, b) => a.code.localeCompare(b.code))] as const);
  }, [units]);

  if (units.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-line-strong px-6 py-16 text-center">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-surface-2 text-ink-3">
          <Building2 className="h-5 w-5" strokeWidth={1.6} />
        </span>
        <p className="mt-3 text-sm font-semibold text-ink">No units in this project</p>
        <p className="mt-1 max-w-sm text-[13px] text-ink-3">Add units under Setup to see the tower map.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center gap-4">
        {LEGEND.map((l) => (
          <span key={l.status} className="flex items-center gap-1.5 text-xs font-medium text-ink-2">
            <span className={cn('h-2.5 w-2.5 rounded-sm border', STATUS_STYLE[l.status])} />
            {l.label}
          </span>
        ))}
      </div>

      <div className="space-y-1.5">
        {floors.map(([floor, list]) => (
          <div key={floor} className="flex items-stretch gap-3">
            <div className="flex w-14 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-xs font-semibold text-ink-3">
              F{floor}
            </div>
            <div className="flex flex-1 flex-wrap gap-2 py-0.5">
              {list.map((u) => {
                const booking = bookingsByUnitId[u.id];
                const selected = u.id === selectedUnitId;
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => onSelectUnit(u)}
                    title={`${u.code} · ₹${Number(u.baseRate).toLocaleString()} · ${u.status}`}
                    className={cn(
                      'group relative flex h-16 w-20 flex-col items-center justify-center rounded-lg border text-xs font-semibold transition-all',
                      STATUS_STYLE[u.status],
                      selected && 'ring-2 ring-brand ring-offset-1 ring-offset-canvas',
                    )}
                  >
                    <span className="font-mono text-[12.5px]">{u.code}</span>
                    <span className="mt-0.5 text-[10px] font-medium opacity-70">
                      {booking ? booking.state.replace(/_/g, ' ') : u.status}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
