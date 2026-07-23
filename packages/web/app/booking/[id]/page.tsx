'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import type { Booking } from '@/lib/types';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const BOOKING_TONE: Record<Booking['state'], 'neutral' | 'amber' | 'blue' | 'green' | 'red'> = {
  draft: 'neutral',
  payment_pending: 'amber',
  confirmed: 'blue',
  agreement_signed: 'green',
  cancelled: 'red',
};

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('upi');
  const [cancelReason, setCancelReason] = useState('');

  const load = useCallback(async () => {
    try {
      const b = await api.get<Booking>(`/bookings/${id}`);
      setBooking(b);
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : 'Failed to load booking');
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function act(fn: () => Promise<unknown>) {
    setBusy(true);
    setErr(null);
    try {
      await fn();
      await load();
      router.refresh();
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : 'Action failed');
    } finally {
      setBusy(false);
    }
  }

  if (!booking) return <p className="text-sm text-zinc-500">{err ?? 'Loading…'}</p>;

  const pendingPayment = booking.payments?.find((p) => p.status === 'pending');

  return (
    <div className="space-y-6">
      <Link href="/booking" className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to bookings
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-zinc-900">{booking.customerName}</h1>
          <p className="mt-0.5 text-sm text-zinc-500">Unit {booking.unit?.code} · {booking.customerPhone}</p>
        </div>
        <Badge tone={BOOKING_TONE[booking.state]}>{booking.state}</Badge>
      </div>

      {err && <p className="text-sm text-red-600">{err}</p>}

      <Card>
        <CardHeader title="State machine actions" />
        <CardBody className="flex flex-wrap gap-3">
          {booking.state === 'draft' && (
            <Button disabled={busy} onClick={() => act(() => api.post(`/bookings/${id}/request-payment`))}>
              Request payment (lock unit)
            </Button>
          )}

          {booking.state === 'payment_pending' && !pendingPayment && (
            <div className="flex items-end gap-2">
              <div>
                <label className="text-xs text-zinc-500">Amount</label>
                <input className="input" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-zinc-500">Method</label>
                <input className="input" value={method} onChange={(e) => setMethod(e.target.value)} />
              </div>
              <Button
                disabled={busy || !amount}
                onClick={() => act(() => api.post(`/bookings/${id}/payments`, { amount: Number(amount), method }))}
              >
                Record payment
              </Button>
            </div>
          )}

          {booking.state === 'payment_pending' && pendingPayment && (
            <Button
              disabled={busy}
              onClick={() => act(() => api.post(`/bookings/${id}/payments/${pendingPayment.id}/clear`))}
            >
              Clear payment (confirm booking)
            </Button>
          )}

          {booking.state === 'confirmed' && (
            <Button disabled={busy} onClick={() => act(() => api.post(`/bookings/${id}/sign-agreement`))}>
              Sign agreement
            </Button>
          )}

          {booking.state !== 'cancelled' && (
            <div className="flex items-end gap-2">
              <div>
                <label className="text-xs text-zinc-500">Cancel reason</label>
                <input className="input" value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} />
              </div>
              <Button
                variant="danger"
                disabled={busy || !cancelReason}
                onClick={() => act(() => api.post(`/bookings/${id}/cancel`, { reason: cancelReason }))}
              >
                Cancel booking
              </Button>
            </div>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Timeline" />
        <CardBody className="space-y-2 text-sm text-zinc-700">
          <p>Created: {new Date(booking.createdAt).toLocaleString()}</p>
          {booking.holdExpiresAt && <p>Hold expires: {new Date(booking.holdExpiresAt).toLocaleString()}</p>}
          {booking.agreementSignedAt && <p>Agreement signed: {new Date(booking.agreementSignedAt).toLocaleString()}</p>}
          {booking.cancelledAt && <p>Cancelled: {new Date(booking.cancelledAt).toLocaleString()} — {booking.cancelReason}</p>}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Payments" />
        <CardBody>
          {!booking.payments || booking.payments.length === 0 ? (
            <p className="text-sm text-zinc-500">No payments recorded.</p>
          ) : (
            <ul className="space-y-1 text-sm text-zinc-700">
              {booking.payments.map((p) => (
                <li key={p.id}>
                  ₹{Number(p.amount).toLocaleString()} via {p.method} —{' '}
                  <Badge tone={p.status === 'cleared' ? 'green' : p.status === 'failed' ? 'red' : 'amber'}>
                    {p.status}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
