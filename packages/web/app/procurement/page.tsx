'use client';

import { useEffect, useState, useCallback } from 'react';
import { Building2 } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import type { Vendor, PurchaseOrder } from '@/lib/types-extra';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { Table, Thead, Th, Td, Tr } from '@/components/ui/table';

const PO_TONE: Record<string, 'neutral' | 'amber' | 'blue' | 'green' | 'red'> = {
  draft: 'neutral',
  pending_approval: 'amber',
  approved: 'green',
  rejected: 'red',
  grn_received: 'blue',
  invoiced: 'blue',
};

export default function ProcurementPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [gstin, setGstin] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const [v, o] = await Promise.all([api.get<Vendor[]>('/vendors'), api.get<PurchaseOrder[]>('/purchase-orders')]);
      setVendors(v);
      setOrders(o);
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
        <h1 className="text-lg font-semibold text-zinc-900">Procurement</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Vendor master and purchase orders. A PO line flagged at ≥10% over the project&apos;s
          baseline unit cost holds at pending_approval instead of auto-approving.
        </p>
      </div>

      <Card>
        <CardHeader title="New vendor" />
        <CardBody>
          <div className="grid grid-cols-3 gap-3">
            <input className="input" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
            <input className="input" placeholder="GSTIN" value={gstin} onChange={(e) => setGstin(e.target.value)} />
            <Button
              disabled={busy || !name || !gstin}
              onClick={async () => {
                setBusy(true);
                try {
                  await api.post('/vendors', { name, gstin });
                  setName('');
                  setGstin('');
                  await load();
                } catch (e) {
                  setErr(e instanceof ApiError ? e.message : 'Request failed');
                } finally {
                  setBusy(false);
                }
              }}
            >
              Add vendor
            </Button>
          </div>
          {err && <p className="mt-3 text-sm text-red-600">{err}</p>}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Vendors" />
        <CardBody className="p-0">
          {loading ? (
            <p className="p-5 text-sm text-zinc-500">Loading…</p>
          ) : vendors.length === 0 ? (
            <div className="p-5">
              <EmptyState icon={Building2} title="No vendors yet" description="Add your first vendor above." />
            </div>
          ) : (
            <Table>
              <Thead>
                <Th>Name</Th>
                <Th>GSTIN</Th>
                <Th>Quality score</Th>
              </Thead>
              <tbody>
                {vendors.map((v) => (
                  <Tr key={v.id}>
                    <Td className="font-medium text-zinc-900">{v.name}</Td>
                    <Td>{v.gstin}</Td>
                    <Td>{v.qualityScore}</Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Purchase orders" />
        <CardBody className="p-0">
          {orders.length === 0 ? (
            <div className="p-5">
              <EmptyState
                icon={Building2}
                title="No purchase orders yet"
                description="POs are created via the API once vendors, projects, and SKUs exist (POST /purchase-orders)."
              />
            </div>
          ) : (
            <Table>
              <Thead>
                <Th>Vendor</Th>
                <Th>Status</Th>
                <Th>Lines</Th>
                <Th>Created</Th>
              </Thead>
              <tbody>
                {orders.map((o) => (
                  <Tr key={o.id}>
                    <Td className="font-medium text-zinc-900">{o.vendor?.name ?? '—'}</Td>
                    <Td>
                      <Badge tone={PO_TONE[o.status]}>{o.status}</Badge>
                    </Td>
                    <Td>{o.lines.length}</Td>
                    <Td>{new Date(o.createdAt).toLocaleString()}</Td>
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
