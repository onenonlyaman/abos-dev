'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Stat } from '@/components/ui/stat';
import { EmptyState } from '@/components/ui/empty-state';
import { Disclosure } from '@/components/ui/disclosure';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { api, ApiError } from '@/lib/api';
import { User, KeyRound, Ticket, PlusCircle, CheckCircle } from 'lucide-react';

interface Booking {
  id: string;
  customerName: string;
  customerPhone: string;
  state: string;
  unit?: { code: string; project?: { name: string } };
  payments?: { amount: number; status: string; createdAt: string }[];
}

interface TicketItem {
  id: string;
  ticketNumber: string;
  customerName: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
}

export default function CustomerPortalPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // Form states
  const [customerName, setCustomerName] = useState('');
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('Construction Milestone');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await api.get<{ bookings: Booking[]; tickets: TicketItem[] }>('/portals/customer');
      setBookings(data.bookings || []);
      setTickets(data.tickets || []);
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : 'Failed to load Customer Portal');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreateTicket = async () => {
    if (!customerName || !subject) return;
    setBusy(true);
    try {
      await api.post('/portals/customer/tickets', {
        customerName,
        subject,
        category,
      });
      setCustomerName('');
      setSubject('');
      await load();
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : 'Failed to submit support ticket');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-7">
      <PageHeader
        title="Customer Homebuyer Portal"
        description="Self-service portal for home buyers: Unit booking status, payment demand notices, and helpdesk support."
      />

      {err && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl">{err}</div>}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat icon={KeyRound} tone="brand" value={String(bookings.length)} label="Active Bookings" sub="Registered units" />
        <Stat icon={CheckCircle} tone="green" value={String(bookings.filter(b => b.state === 'agreement_signed').length)} label="Signed Agreements" sub="Clear Title Verified" />
        <Stat icon={Ticket} tone="blue" value={String(tickets.length)} label="Support Tickets" sub="Helpdesk cases" />
        <Stat icon={User} tone="amber" value="100%" label="Homebuyer Access" sub="Self-service enabled" />
      </div>

      <Disclosure title="Submit Support / Demand Notice Ticket">
        <div className="space-y-3">
          <Field label="Your Name" placeholder="e.g. Priya Sharma" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
          <Field label="Subject / Issue" placeholder="Query regarding Floor 6 milestone payment clearance" value={subject} onChange={(e) => setSubject(e.target.value)} />
          <Button size="sm" className="w-full" disabled={busy || !customerName || !subject} onClick={handleCreateTicket}>
            <PlusCircle className="w-3.5 h-3.5 mr-1.5" /> Submit Ticket
          </Button>
        </div>
      </Disclosure>

      {/* Bookings & Payments */}
      <Card>
        <CardHeader title="Your Purchased Property Units" description="Construction milestone & payment progress" />
        <CardBody className="space-y-3">
          {bookings.length === 0 ? (
            <EmptyState icon={KeyRound} title="No unit bookings found" description="Confirmed bookings linked to your account will appear here." />
          ) : (
            bookings.map((b) => (
              <div key={b.id} className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-sm text-zinc-100">{b.unit?.project?.name} - Unit {b.unit?.code}</div>
                  <Badge tone="blue">{b.state}</Badge>
                </div>
                <div className="text-xs text-zinc-400">Buyer: {b.customerName} ({b.customerPhone})</div>
              </div>
            ))
          )}
        </CardBody>
      </Card>
    </div>
  );
}
