'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { X, KeyRound, ArrowRight } from 'lucide-react';
import type { Unit, Booking } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const UNIT_TONE: Record<Unit['status'], 'green' | 'amber' | 'blue'> = {
  available: 'green',
  held: 'amber',
  booked: 'blue',
};

const BOOKING_TONE: Record<Booking['state'], 'neutral' | 'amber' | 'blue' | 'green' | 'red'> = {
  draft: 'neutral',
  payment_pending: 'amber',
  confirmed: 'blue',
  agreement_signed: 'green',
  cancelled: 'red',
};

export function UnitDetailPanel({
  unit,
  booking,
  onClose,
  onStartBooking,
}: {
  unit: Unit;
  booking: Booking | undefined;
  onClose: () => void;
  onStartBooking: (unit: Unit) => void;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <>
      <div className="fixed inset-0 z-20 bg-ink/30" onClick={onClose} aria-hidden="true" />
      <aside
        role="dialog"
        aria-label={`Unit ${unit.code} detail`}
        className="fixed inset-y-0 right-0 z-30 flex w-[380px] flex-col border-l border-line bg-surface shadow-lift"
      >
        <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
          <div>
            <p className="font-mono text-lg font-bold text-ink">{unit.code}</p>
            <p className="mt-0.5 text-[13px] text-ink-3">{unit.project?.name ?? 'Unassigned project'}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close panel"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-3 hover:bg-surface-2 hover:text-ink"
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          <div className="flex items-center gap-2">
            <Badge tone={UNIT_TONE[unit.status]}>{unit.status}</Badge>
          </div>

          <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-xs font-medium text-ink-3">Floor</dt>
              <dd className="mt-0.5 font-semibold tabular-nums text-ink">{unit.floor}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-ink-3">Area</dt>
              <dd className="mt-0.5 font-semibold tabular-nums text-ink">
                {Number(unit.areaSqft).toLocaleString()} sqft
              </dd>
            </div>
            <div className="col-span-2">
              <dt className="text-xs font-medium text-ink-3">Base rate</dt>
              <dd className="mt-0.5 text-xl font-bold tabular-nums text-ink">
                ₹{Number(unit.baseRate).toLocaleString()}
              </dd>
            </div>
          </dl>

          <div className="mt-6 border-t border-line pt-5">
            {booking ? (
              <>
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-3">Linked booking</p>
                <div className="mt-2.5 rounded-lg border border-line bg-surface-2 p-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-ink">{booking.customerName}</span>
                    <Badge tone={BOOKING_TONE[booking.state]}>{booking.state}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-ink-3">{booking.customerPhone}</p>
                  <Link
                    href={`/booking/${booking.id}`}
                    className="mt-3 inline-flex items-center gap-1 text-[13px] font-semibold text-brand hover:text-brand-ink"
                  >
                    Manage booking <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
                  </Link>
                </div>
              </>
            ) : unit.status === 'available' ? (
              <>
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-3">No booking yet</p>
                <p className="mt-1.5 text-[13px] leading-relaxed text-ink-2">
                  This unit is open. Start a draft booking to lock it for a customer.
                </p>
                <Button className="mt-4 w-full" onClick={() => onStartBooking(unit)}>
                  <KeyRound className="h-4 w-4" strokeWidth={2} /> Start booking
                </Button>
              </>
            ) : (
              <p className="text-[13px] text-ink-3">No booking record found for this unit yet.</p>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
