'use client';

import { useEffect, useState, useCallback } from 'react';
import { Users } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import type { Lead } from '@/lib/types-extra';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { Table, Thead, Th, Td, Tr } from '@/components/ui/table';

const TONE: Record<string, 'neutral' | 'amber' | 'blue' | 'green' | 'red'> = {
  new: 'neutral',
  contacted: 'blue',
  qualified: 'blue',
  site_visit_scheduled: 'amber',
  site_visit_done: 'amber',
  negotiation: 'amber',
  booked: 'green',
  lost: 'red',
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [source, setSource] = useState('walk_in');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setLeads(await api.get<Lead[]>('/leads'));
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : 'Failed to reach API');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-lg font-semibold text-zinc-900">Sales CRM — Leads</h1>
        <p className="mt-1 text-sm text-zinc-500">
          new → contacted → qualified → site_visit_scheduled → site_visit_done → negotiation → booked,
          with lost as a terminal state from any point.
        </p>
      </div>

      <Card>
        <CardHeader title="New lead" />
        <CardBody>
          <div className="grid grid-cols-4 gap-3">
            <input className="input" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
            <input className="input" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <input className="input" placeholder="Source" value={source} onChange={(e) => setSource(e.target.value)} />
            <Button
              disabled={busy || !name || !phone}
              onClick={async () => {
                setBusy(true);
                try {
                  await api.post('/leads', { name, phone, source });
                  setName('');
                  setPhone('');
                  await load();
                } catch (e) {
                  setErr(e instanceof ApiError ? e.message : 'Request failed');
                } finally {
                  setBusy(false);
                }
              }}
            >
              Add lead
            </Button>
          </div>
          {err && <p className="mt-3 text-sm text-red-600">{err}</p>}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Pipeline" />
        <CardBody className="p-0">
          {loading ? (
            <p className="p-5 text-sm text-zinc-500">Loading…</p>
          ) : leads.length === 0 ? (
            <div className="p-5">
              <EmptyState icon={Users} title="No leads yet" description="Add your first lead above." />
            </div>
          ) : (
            <Table>
              <Thead>
                <Th>Name</Th>
                <Th>Phone</Th>
                <Th>Source</Th>
                <Th>State</Th>
              </Thead>
              <tbody>
                {leads.map((l) => (
                  <Tr key={l.id}>
                    <Td className="font-medium text-zinc-900">{l.name}</Td>
                    <Td>{l.phone}</Td>
                    <Td>{l.source}</Td>
                    <Td>
                      <Badge tone={TONE[l.state]}>{l.state}</Badge>
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
