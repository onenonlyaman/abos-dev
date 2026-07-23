'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { KeyRound, LayoutGrid, List } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import type { Booking, Project, Spv, Unit } from '@/lib/types';
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
import { TowerMap } from '@/components/booking/tower-map';
import { UnitDetailPanel } from '@/components/booking/unit-detail-panel';
import { cn } from '@/lib/utils';

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

const BOOKING_STATES: Booking['state'][] = ['draft', 'payment_pending', 'confirmed', 'agreement_signed', 'cancelled'];
const UNIT_STATUSES: Unit['status'][] = ['available', 'held', 'booked'];

export default function BookingPage() {
  const [spvs, setSpvs] = useState<Spv[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [unitFilter, setUnitFilter] = useState('all');
  const [bookingFilter, setBookingFilter] = useState('all');
  const [view, setView] = useState<'map' | 'list'>('map');
  const [mapProjectId, setMapProjectId] = useState('');
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [bookingPanelOpen, setBookingPanelOpen] = useState(false);
  const [prefillUnitId, setPrefillUnitId] = useState<string | null>(null);

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

  useEffect(() => {
    if (!mapProjectId && projects.length > 0) setMapProjectId(projects[0].id);
  }, [projects, mapProjectId]);

  const filteredUnits = useMemo(
    () => (unitFilter === 'all' ? units : units.filter((u) => u.status === unitFilter)),
    [units, unitFilter],
  );
  const filteredBookings = useMemo(
    () => (bookingFilter === 'all' ? bookings : bookings.filter((b) => b.state === bookingFilter)),
    [bookings, bookingFilter],
  );

  const bookingsByUnitId = useMemo(() => {
    const map: Record<string, Booking> = {};
    for (const b of bookings) {
      if (b.state === 'cancelled') continue;
      map[b.unitId] = b;
    }
    return map;
  }, [bookings]);

  const mapUnits = useMemo(
    () => units.filter((u) => u.projectId === mapProjectId),
    [units, mapProjectId],
  );

  return (
    <div className="space-y-8">
      <PageHeader
        title="Booking & Units"
        description="Track unit inventory and manage bookings from hold to signed agreement."
      />

      {error && (
        <Card>
          <CardBody>
            <p className="text-sm text-danger">{error}</p>
          </CardBody>
        </Card>
      )}

      <Disclosure
        title="Add SPV / project / unit"
        description="Set up the company structure before creating units"
        defaultOpen={spvs.length === 0}
      >
        <SetupPanel spvs={spvs} projects={projects} onChanged={load} />
      </Disclosure>

      <Card>
        <CardHeader
          title="Units"
          description="Click a unit for detail, or switch to the list view"
          actions={
            <div className="flex items-center gap-2">
              {view === 'map' && projects.length > 0 && (
                <Select
                  aria-label="Project"
                  className="h-8 w-44 text-xs"
                  value={mapProjectId}
                  onChange={(e) => setMapProjectId(e.target.value)}
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </Select>
              )}
              {view === 'list' && units.length > 0 && (
                <Select
                  aria-label="Filter by status"
                  className="h-8 w-36 text-xs"
                  value={unitFilter}
                  onChange={(e) => setUnitFilter(e.target.value)}
                >
                  <option value="all">All statuses</option>
                  {UNIT_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </Select>
              )}
              <div className="flex rounded-lg border border-line bg-surface-2 p-0.5">
                <button
                  type="button"
                  onClick={() => setView('map')}
                  aria-pressed={view === 'map'}
                  className={cn(
                    'flex h-7 w-7 items-center justify-center rounded-md',
                    view === 'map' ? 'bg-surface text-ink shadow-card' : 'text-ink-3 hover:text-ink',
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
        <CardBody className={view === 'map' ? '' : 'p-0'}>
          {loading ? (
            <TableSkeleton cols={6} />
          ) : units.length === 0 ? (
            <div className="p-5">
              <EmptyState
                icon={KeyRound}
                title="No units yet"
                description="Create an SPV, project, and unit above to start booking."
              />
            </div>
          ) : view === 'map' ? (
            <TowerMap
              units={mapUnits}
              bookingsByUnitId={bookingsByUnitId}
              selectedUnitId={selectedUnit?.id ?? null}
              onSelectUnit={setSelectedUnit}
            />
          ) : filteredUnits.length === 0 ? (
            <div className="p-5">
              <EmptyState icon={KeyRound} title="No matching units" description="Try a different status filter." />
            </div>
          ) : (
            <Table>
              <Thead>
                <Th>Code</Th>
                <Th>Project</Th>
                <Th className="text-right">Floor</Th>
                <Th className="text-right">Area (sqft)</Th>
                <Th className="text-right">Base rate</Th>
                <Th>Status</Th>
              </Thead>
              <tbody>
                {filteredUnits.map((u) => (
                  <Tr key={u.id}>
                    <Td className="font-mono text-[12.5px] font-semibold text-ink">{u.code}</Td>
                    <Td>{u.project?.name ?? '–'}</Td>
                    <Td className="text-right tabular-nums">{u.floor}</Td>
                    <Td className="text-right tabular-nums">{Number(u.areaSqft).toLocaleString()}</Td>
                    <Td className="text-right tabular-nums">₹{Number(u.baseRate).toLocaleString()}</Td>
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

      <Disclosure
        title="Start a booking"
        description="Creates a draft booking against an available unit"
        open={bookingPanelOpen}
        onOpenChange={setBookingPanelOpen}
      >
        <CreateBookingPanel
          units={units}
          initialUnitId={prefillUnitId}
          onCreated={() => {
            load();
            setBookingPanelOpen(false);
            setPrefillUnitId(null);
          }}
        />
      </Disclosure>

      <Card>
        <CardHeader
          title="Bookings"
          description="Every booking, past and present"
          actions={
            bookings.length > 0 && (
              <Select
                aria-label="Filter by state"
                className="h-8 w-40 text-xs"
                value={bookingFilter}
                onChange={(e) => setBookingFilter(e.target.value)}
              >
                <option value="all">All states</option>
                {BOOKING_STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            )
          }
        />
        <CardBody className="p-0">
          {loading ? (
            <TableSkeleton cols={5} />
          ) : bookings.length === 0 ? (
            <div className="p-5">
              <EmptyState
                icon={KeyRound}
                title="No bookings yet"
                description="Start a draft booking against an available unit."
              />
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="p-5">
              <EmptyState icon={KeyRound} title="No matching bookings" description="Try a different state filter." />
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
                {filteredBookings.map((b) => (
                  <Tr key={b.id}>
                    <Td className="font-medium text-ink">{b.customerName}</Td>
                    <Td>{b.unit?.code ?? '–'}</Td>
                    <Td>
                      <Badge tone={BOOKING_TONE[b.state]}>{b.state}</Badge>
                    </Td>
                    <Td>{new Date(b.createdAt).toLocaleString()}</Td>
                    <Td>
                      <Link href={`/booking/${b.id}`} className="text-sm font-medium text-ink underline">
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

      {selectedUnit && (
        <UnitDetailPanel
          unit={selectedUnit}
          booking={bookingsByUnitId[selectedUnit.id]}
          onClose={() => setSelectedUnit(null)}
          onStartBooking={(unit) => {
            setSelectedUnit(null);
            setPrefillUnitId(unit.id);
            setBookingPanelOpen(true);
          }}
        />
      )}
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
    <div>
      <div className="grid grid-cols-3 gap-6">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-3">1. SPV</p>
          <Field label="Name" value={spvName} onChange={(e) => setSpvName(e.target.value)} />
          <Field label="Legal name" value={spvLegal} onChange={(e) => setSpvLegal(e.target.value)} />
          <Field label="GSTIN" value={spvGstin} onChange={(e) => setSpvGstin(e.target.value)} />
          <Button
            size="sm"
            className="w-full"
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
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-3">2. Project</p>
          <Select
            label="SPV"
            value={projSpvId}
            onChange={(e) => setProjSpvId(e.target.value)}
            disabled={spvs.length === 0}
          >
            <option value="">{spvs.length === 0 ? 'Create an SPV first' : 'Select SPV'}</option>
            {spvs.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
          <Field label="Name" value={projName} onChange={(e) => setProjName(e.target.value)} disabled={!projSpvId} />
          <Field label="Code" value={projCode} onChange={(e) => setProjCode(e.target.value)} disabled={!projSpvId} />
          <Field label="City" value={projCity} onChange={(e) => setProjCity(e.target.value)} disabled={!projSpvId} />
          <Button
            size="sm"
            className="w-full"
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
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-3">3. Unit</p>
          <Select
            label="Project"
            value={unitProjectId}
            onChange={(e) => setUnitProjectId(e.target.value)}
            disabled={projects.length === 0}
          >
            <option value="">{projects.length === 0 ? 'Create a project first' : 'Select project'}</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
          <Field
            label="Unit code"
            placeholder="A-101"
            value={unitCode}
            onChange={(e) => setUnitCode(e.target.value)}
            disabled={!unitProjectId}
          />
          <Field
            label="Floor"
            type="number"
            value={unitFloor}
            onChange={(e) => setUnitFloor(e.target.value)}
            disabled={!unitProjectId}
          />
          <Field
            label="Area (sqft)"
            type="number"
            value={unitArea}
            onChange={(e) => setUnitArea(e.target.value)}
            disabled={!unitProjectId}
          />
          <Field
            label="Base rate"
            type="number"
            value={unitRate}
            onChange={(e) => setUnitRate(e.target.value)}
            disabled={!unitProjectId}
          />
          <Button
            size="sm"
            className="w-full"
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
      {err && <p className="mt-3 text-sm text-danger">{err}</p>}
    </div>
  );
}

function CreateBookingPanel({
  units,
  initialUnitId,
  onCreated,
}: {
  units: Unit[];
  initialUnitId: string | null;
  onCreated: () => void;
}) {
  const [unitId, setUnitId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const availableUnits = units.filter((u) => u.status === 'available');

  useEffect(() => {
    if (initialUnitId) setUnitId(initialUnitId);
  }, [initialUnitId]);

  return (
    <div>
      <div className="grid grid-cols-4 gap-3">
        <Select label="Unit" value={unitId} onChange={(e) => setUnitId(e.target.value)} disabled={availableUnits.length === 0}>
          <option value="">{availableUnits.length === 0 ? 'No available units' : 'Select available unit'}</option>
          {availableUnits.map((u) => (
            <option key={u.id} value={u.id}>
              {u.project?.name} · {u.code}
            </option>
          ))}
        </Select>
        <Field label="Customer name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
        <Field label="Customer phone" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
        <Button
          className="self-end"
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
      {err && <p className="mt-3 text-sm text-danger">{err}</p>}
      {availableUnits.length === 0 && units.length > 0 && (
        <p className="mt-3 text-sm text-ink-2">No available units right now.</p>
      )}
    </div>
  );
}
