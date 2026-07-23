'use client';

import { useEffect, useState, useCallback } from 'react';
import { Truck } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import type { Vehicle } from '@/lib/types-extra';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { Table, Thead, Th, Td, Tr } from '@/components/ui/table';

const TONE: Record<string, 'green' | 'amber' | 'red'> = {
  active: 'green',
  maintenance: 'amber',
  decommissioned: 'red',
};

export default function FleetPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [plateNumber, setPlateNumber] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setVehicles(await api.get<Vehicle[]>('/vehicles'));
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
        <h1 className="text-lg font-semibold text-zinc-900">Fleet</h1>
        <p className="mt-1 text-sm text-zinc-500">Vehicle and machine tracking across sites.</p>
      </div>

      <Card>
        <CardHeader title="New vehicle" />
        <CardBody>
          <div className="grid grid-cols-3 gap-3">
            <input className="input" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
            <input
              className="input"
              placeholder="Plate number"
              value={plateNumber}
              onChange={(e) => setPlateNumber(e.target.value)}
            />
            <Button
              disabled={busy || !name || !plateNumber}
              onClick={async () => {
                setBusy(true);
                try {
                  await api.post('/vehicles', { name, plateNumber });
                  setName('');
                  setPlateNumber('');
                  await load();
                } catch (e) {
                  setErr(e instanceof ApiError ? e.message : 'Request failed');
                } finally {
                  setBusy(false);
                }
              }}
            >
              Add vehicle
            </Button>
          </div>
          {err && <p className="mt-3 text-sm text-red-600">{err}</p>}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Fleet" />
        <CardBody className="p-0">
          {loading ? (
            <p className="p-5 text-sm text-zinc-500">Loading…</p>
          ) : vehicles.length === 0 ? (
            <div className="p-5">
              <EmptyState icon={Truck} title="No vehicles yet" description="Add your first vehicle above." />
            </div>
          ) : (
            <Table>
              <Thead>
                <Th>Name</Th>
                <Th>Plate</Th>
                <Th>Status</Th>
              </Thead>
              <tbody>
                {vehicles.map((v) => (
                  <Tr key={v.id}>
                    <Td className="font-medium text-zinc-900">{v.name}</Td>
                    <Td>{v.plateNumber}</Td>
                    <Td>
                      <Badge tone={TONE[v.status]}>{v.status}</Badge>
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
