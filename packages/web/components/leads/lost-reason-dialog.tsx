'use client';

import { useState } from 'react';
import type { LostReason } from '@/lib/types-extra';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

const REASONS: LostReason[] = ['price', 'location', 'competitor', 'financing', 'no_response', 'other'];

export function LostReasonDialog({
  leadName,
  onConfirm,
  onCancel,
}: {
  leadName: string;
  onConfirm: (reason: LostReason) => void;
  onCancel: () => void;
}) {
  const [reason, setReason] = useState<LostReason>('price');

  return (
    <>
      <div className="fixed inset-0 z-40 bg-ink/30" onClick={onCancel} aria-hidden="true" />
      <div
        role="dialog"
        aria-label="Mark lead as lost"
        className="fixed left-1/2 top-1/2 z-50 w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-line bg-surface p-5 shadow-lift"
      >
        <p className="text-sm font-semibold text-ink">Mark {leadName} as lost</p>
        <p className="mt-1 text-[13px] text-ink-3">A reason is required to close this lead out of the pipeline.</p>
        <div className="mt-4">
          <Select label="Reason" value={reason} onChange={(e) => setReason(e.target.value as LostReason)}>
            {REASONS.map((r) => (
              <option key={r} value={r}>
                {r.replace(/_/g, ' ')}
              </option>
            ))}
          </Select>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="danger" size="sm" onClick={() => onConfirm(reason)}>
            Mark as lost
          </Button>
        </div>
      </div>
    </>
  );
}
