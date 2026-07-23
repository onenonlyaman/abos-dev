'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { Users, LayoutGrid, List } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import type { Lead, LostReason } from '@/lib/types-extra';
import type { LeadState } from '@/lib/types';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { Table, Thead, Th, Td, Tr } from '@/components/ui/table';
import { PageHeader } from '@/components/ui/page-header';
import { TableSkeleton } from '@/components/ui/skeleton';
import { Disclosure } from '@/components/ui/disclosure';
import { Select } from '@/components/ui/select';
import { Field } from '@/components/ui/field';
import { KanbanBoard } from '@/components/leads/kanban-board';
import { LostReasonDialog } from '@/components/leads/lost-reason-dialog';
import { cn } from '@/lib/utils';

const TONE: Record<LeadState, 'neutral' | 'amber' | 'blue' | 'green' | 'red'> = {
  new: 'neutral',
  contacted: 'blue',
  qualified: 'blue',
  site_visit_scheduled: 'amber',
  site_visit_done: 'amber',
  negotiation: 'amber',
  booked: 'green',
  lost: 'red',
};

const LEAD_STATES: LeadState[] = [
  'new',
  'contacted',
  'qualified',
  'site_visit_scheduled',
  'site_visit_done',
  'negotiation',
  'booked',
  'lost',
];

const SOURCES = ['walk_in', 'referral', 'online', 'broker', 'exhibition'];

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [stateFilter, setStateFilter] = useState('all');
  const [view, setView] = useState<'board' | 'list'>('board');
  const [movingId, setMovingId] = useState<string | null>(null);
  const [lostTarget, setLostTarget] = useState<Lead | null>(null);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [source, setSource] = useState('walk_in');
  const [customSource, setCustomSource] = useState('');
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

  const filteredLeads = useMemo(
    () => (stateFilter === 'all' ? leads : leads.filter((l) => l.state === stateFilter)),
    [leads, stateFilter],
  );

  const resolvedSource = source === 'other' ? customSource : source;

  async function commitMove(lead: Lead, target: LeadState, lostReason?: LostReason) {
    setMovingId(lead.id);
    setErr(null);
    const prev = leads;
    setLeads((cur) => cur.map((l) => (l.id === lead.id ? { ...l, state: target } : l)));
    try {
      await api.patch(`/leads/${lead.id}/state`, { state: target, lostReason, unitId: lead.unitId ?? undefined });
    } catch (e) {
      setLeads(prev);
      setErr(e instanceof ApiError ? e.message : 'Could not move lead');
    } finally {
      setMovingId(null);
    }
  }

  function handleMove(lead: Lead, target: LeadState) {
    if (target === 'lost') {
      setLostTarget(lead);
      return;
    }
    commitMove(lead, target);
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Sales CRM: Leads"
        description="Track every lead from first contact through to a booked unit."
      />

      <Disclosure title="New lead" defaultOpen={leads.length === 0}>
        <div className="grid grid-cols-4 gap-3">
          <Field label="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Field label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <Select label="Source" value={source} onChange={(e) => setSource(e.target.value)}>
            {SOURCES.map((s) => (
              <option key={s} value={s}>
                {s.replace('_', ' ')}
              </option>
            ))}
            <option value="other">Other…</option>
          </Select>
          {source === 'other' && (
            <Field label="Custom source" value={customSource} onChange={(e) => setCustomSource(e.target.value)} />
          )}
        </div>
        <Button
          className="mt-3"
          size="sm"
          disabled={busy || !name || !phone || !resolvedSource}
          onClick={async () => {
            setBusy(true);
            try {
              await api.post('/leads', { name, phone, source: resolvedSource });
              setName('');
              setPhone('');
              setCustomSource('');
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
        {err && <p className="mt-3 text-sm text-danger">{err}</p>}
      </Disclosure>

      <Card>
        <CardHeader
          title="Pipeline"
          description={view === 'board' ? 'Drag a card between stages' : undefined}
          actions={
            <div className="flex items-center gap-2">
              {view === 'list' && leads.length > 0 && (
                <Select
                  aria-label="Filter by state"
                  className="h-8 w-44 text-xs"
                  value={stateFilter}
                  onChange={(e) => setStateFilter(e.target.value)}
                >
                  <option value="all">All states</option>
                  {LEAD_STATES.map((s) => (
                    <option key={s} value={s}>
                      {s.replace(/_/g, ' ')}
                    </option>
                  ))}
                </Select>
              )}
              <div className="flex rounded-lg border border-line bg-surface-2 p-0.5">
                <button
                  type="button"
                  onClick={() => setView('board')}
                  aria-pressed={view === 'board'}
                  className={cn(
                    'flex h-7 w-7 items-center justify-center rounded-md',
                    view === 'board' ? 'bg-surface text-ink shadow-card' : 'text-ink-3 hover:text-ink',
                  )}
                >
                  <LayoutGrid className="h-3.5 w-3.5" strokeWidth={2} />
                </button>
                <button
                  type="button"
                  onClick={() => setView('list')}
                  aria-pressed={view === 'list'}
                  className={cn(
                    'flex h-7 w-7 items-center justify-center rounded-md',
                    view === 'list' ? 'bg-surface text-ink shadow-card' : 'text-ink-3 hover:text-ink',
                  )}
                >
                  <List className="h-3.5 w-3.5" strokeWidth={2} />
                </button>
              </div>
            </div>
          }
        />
        <CardBody className={view === 'board' ? '' : 'p-0'}>
          {err && view === 'board' && <p className="mb-3 text-sm text-danger">{err}</p>}
          {loading ? (
            view === 'board' ? (
              <p className="p-1 text-sm text-ink-3">Loading pipeline…</p>
            ) : (
              <TableSkeleton cols={4} />
            )
          ) : leads.length === 0 ? (
            <div className="p-5">
              <EmptyState icon={Users} title="No leads yet" description="Add your first lead above." />
            </div>
          ) : view === 'board' ? (
            <KanbanBoard leads={leads} onMove={handleMove} movingId={movingId} />
          ) : filteredLeads.length === 0 ? (
            <div className="p-5">
              <EmptyState icon={Users} title="No matching leads" description="Try a different state filter." />
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
                {filteredLeads.map((l) => (
                  <Tr key={l.id}>
                    <Td className="font-medium text-ink">{l.name}</Td>
                    <Td>{l.phone}</Td>
                    <Td className="capitalize">{l.source.replace(/_/g, ' ')}</Td>
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

      {lostTarget && (
        <LostReasonDialog
          leadName={lostTarget.name}
          onCancel={() => setLostTarget(null)}
          onConfirm={(reason) => {
            commitMove(lostTarget, 'lost', reason);
            setLostTarget(null);
          }}
        />
      )}
    </div>
  );
}
