'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { KeyRound } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import type { Booking, Project, Spv, Unit } from '@/lib/types';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { Table, Thead, Th, Td, Tr } from '@/components/ui/table';

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

export default function BookingPage() {
  const [spvs, setSpvs] = useState<Spv[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [s, p, u, b] = await Promise.all([
        api.get<Spv[]>('/spvs'),
        api.get<Project[]>('/projects'),
        api.get<Unit[]>('/units'),
        api.get<Booking[]>('/bookings'),
      ]);
      setSpvs(s);
      setProjects(p);
      setUnits(u);
      setBookings(b);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Failed to reach API');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <p className="text-sm text-zinc-500">Loading…</p>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-lg font-semibold text-zinc-900">Booking &amp; Units</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Unit inventory and the draft → payment_pending → confirmed → agreement_signed booking
          state machine, backed by an atomic per-unit hold lock.
        </p>
      </div>

      {error && (
        <Card>
          <CardBody>
            <p className="text-sm text-red-600">{error}</p>
          </CardBody>
        </Card>
      )}

      <SetupPanel spvs={spvs} projects={projects} onChanged={load} />

      <Card>
        <CardHeader title="Units" description="Inventory across all projects" />
        <CardBody className="p-0">
          {units.length === 0 ? (
            <div className="p-5">
              <EmptyState
                icon={KeyRound}
                title="No units yet"
                description="Create an SPV, project, and unit above to start booking."
              />
            </div>
          ) : (
            <Table>
              <Thead>
                <Th>Code</Th>
                <Th>Project</Th>
                <Th>Floor</Th>
                <Th>Area (sqft)</Th>
                <Th>Base rate</Th>
                <Th>Status</Th>
              </Thead>
              <tbody>
                {units.map((u) => (
                  <Tr key={u.id}>
                    <Td className="font-medium text-zinc-900">{u.code}</Td>
                    <Td>{u.project?.name ?? '—'}</Td>
                    <Td>{u.floor}</Td>
                    <Td>{Number(u.areaSqft).toLocaleString()}</Td>
                    <Td>₹{Number(u.baseRate).toLocaleString()}</Td>
                    <Td>
                      <Badge tone={UNIT_TONE[u.status]}>{u.status}</Badge>
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          )}
        </CardBody>
      </Card>

      <CreateBookingPanel units={units} onCreated={load} />

      <Card>
        <CardHeader title="Bookings" description="Full state-machine history" />
        <CardBody className="p-0">
          {bookings.length === 0 ? (
            <div className="p-5">
              <EmptyState
                icon={KeyRound}
                title="No bookings yet"
                description="Start a draft booking against an available unit."
              />
            </div>
          ) : (
            <Table>
              <Thead>
                <Th>Customer</Th>
                <Th>Unit</Th>
                <Th>State</Th>
                <Th>Created</Th>
                <Th />
              </Thead>
              <tbody>
                {bookings.map((b) => (
                  <Tr key={b.id}>
                    <Td className="font-medium text-zinc-900">{b.customerName}</Td>
                    <Td>{b.unit?.code ?? '—'}</Td>
                    <Td>
                      <Badge tone={BOOKING_TONE[b.state]}>{b.state}</Badge>
                    </Td>
                    <Td>{new Date(b.createdAt).toLocaleString()}</Td>
                    <Td>
                      <Link href={`/booking/${b.id}`} className="text-sm font-medium text-zinc-900 underline">
                        Manage
                      </Link>
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

function SetupPanel({
  spvs,
  projects,
  onChanged,
}: {
  spvs: Spv[];
  projects: Project[];
  onChanged: () => void;
}) {
  const [open, setOpen] = useState(spvs.length === 0);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [spvName, setSpvName] = useState('');
  const [spvLegal, setSpvLegal] = useState('');
  const [spvGstin, setSpvGstin] = useState('');

  const [projSpvId, setProjSpvId] = useState('');
  const [projName, setProjName] = useState('');
  const [projCode, setProjCode] = useState('');
  const [projCity, setProjCity] = useState('');

  const [unitProjectId, setUnitProjectId] = useState('');
  const [unitCode, setUnitCode] = useState('');
  const [unitFloor, setUnitFloor] = useState('');
  const [unitArea, setUnitArea] = useState('');
  const [unitRate, setUnitRate] = useState('');

  async function submit(fn: () => Promise<unknown>) {
    setBusy(true);
    setErr(null);
    try {
      await fn();
      onChanged();
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : 'Request failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <CardHeader title="Setup" description="SPV → Project → Unit hierarchy" />
      <CardBody>
        {!open ? (
          <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
            Add SPV / project / unit
          </Button>
        ) : (
          <div className="grid grid-cols-3 gap-6">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase text-zinc-500">1. SPV</p>
              <input className="input" placeholder="Name" value={spvName} onChange={(e) => setSpvName(e.target.value)} />
              <input className="input" placeholder="Legal name" value={spvLegal} onChange={(e) => setSpvLegal(e.target.value)} />
              <input className="input" placeholder="GSTIN" value={spvGstin} onChange={(e) => setSpvGstin(e.target.value)} />
              <Button
                size="sm"
                disabled={busy || !spvName || !spvLegal || !spvGstin}
                onClick={() =>
                  submit(async () => {
                    await api.post('/spvs', { name: spvName, legalName: spvLegal, gstin: spvGstin });
                    setSpvName('');
                    setSpvLegal('');
                    setSpvGstin('');
                  })
                }
              >
                Create SPV
              </Button>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase text-zinc-500">2. Project</p>
              <select className="input" value={projSpvId} onChange={(e) => setProjSpvId(e.target.value)}>
                <option value="">Select SPV</option>
                {spvs.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <input className="input" placeholder="Name" value={projName} onChange={(e) => setProjName(e.target.value)} />
              <input className="input" placeholder="Code" value={projCode} onChange={(e) => setProjCode(e.target.value)} />
              <input className="input" placeholder="City" value={projCity} onChange={(e) => setProjCity(e.target.value)} />
              <Button
                size="sm"
                disabled={busy || !projSpvId || !projName || !projCode || !projCity}
                onClick={() =>
                  submit(async () => {
                    await api.post('/projects', { spvId: projSpvId, name: projName, code: projCode, city: projCity });
                    setProjName('');
                    setProjCode('');
                    setProjCity('');
                  })
                }
              >
                Create project
              </Button>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase text-zinc-500">3. Unit</p>
              <select className="input" value={unitProjectId} onChange={(e) => setUnitProjectId(e.target.value)}>
                <option value="">Select project</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <input className="input" placeholder="Unit code (e.g. A-101)" value={unitCode} onChange={(e) => setUnitCode(e.target.value)} />
              <input className="input" placeholder="Floor" type="number" value={unitFloor} onChange={(e) => setUnitFloor(e.target.value)} />
              <input className="input" placeholder="Area (sqft)" type="number" value={unitArea} onChange={(e) => setUnitArea(e.target.value)} />
              <input className="input" placeholder="Base rate" type="number" value={unitRate} onChange={(e) => setUnitRate(e.target.value)} />
              <Button
                size="sm"
                disabled={busy || !unitProjectId || !unitCode || !unitFloor || !unitArea || !unitRate}
                onClick={() =>
                  submit(async () => {
                    await api.post('/units', {
                      projectId: unitProjectId,
                      code: unitCode,
                      floor: Number(unitFloor),
                      areaSqft: Number(unitArea),
                      baseRate: Number(unitRate),
                    });
                    setUnitCode('');
                    setUnitFloor('');
                    setUnitArea('');
                    setUnitRate('');
                  })
                }
              >
                Create unit
              </Button>
            </div>
          </div>
        )}
        {err && <p className="mt-3 text-sm text-red-600">{err}</p>}
      </CardBody>
    </Card>
  );
}

function CreateBookingPanel({ units, onCreated }: { units: Unit[]; onCreated: () => void }) {
  const [unitId, setUnitId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const availableUnits = units.filter((u) => u.status === 'available');

  return (
    <Card>
      <CardHeader title="Start a booking" description="Creates a draft booking against an available unit" />
      <CardBody>
        <div className="grid grid-cols-4 gap-3">
          <select className="input" value={unitId} onChange={(e) => setUnitId(e.target.value)}>
            <option value="">Select available unit</option>
            {availableUnits.map((u) => (
              <option key={u.id} value={u.id}>
                {u.project?.name} · {u.code}
              </option>
            ))}
          </select>
          <input
            className="input"
            placeholder="Customer name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />
          <input
            className="input"
            placeholder="Customer phone"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
          />
          <Button
            disabled={busy || !unitId || !customerName || !customerPhone}
            onClick={async () => {
              setBusy(true);
              setErr(null);
              try {
                await api.post('/bookings', { unitId, customerName, customerPhone });
                setUnitId('');
                setCustomerName('');
                setCustomerPhone('');
                onCreated();
              } catch (e) {
                setErr(e instanceof ApiError ? e.message : 'Request failed');
              } finally {
                setBusy(false);
              }
            }}
          >
            Create draft booking
          </Button>
        </div>
        {err && <p className="mt-3 text-sm text-red-600">{err}</p>}
        {availableUnits.length === 0 && units.length > 0 && (
          <p className="mt-3 text-sm text-zinc-500">No available units right now.</p>
        )}
      </CardBody>
    </Card>
  );
}
