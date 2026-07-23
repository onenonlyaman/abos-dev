'use client';

import { useEffect, useState, useCallback } from 'react';
import { Warehouse } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import type { Sku } from '@/lib/types-extra';
import type { Project } from '@/lib/types';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { Table, Thead, Th, Td, Tr } from '@/components/ui/table';

export default function InventoryPage() {
  const [skus, setSkus] = useState<Sku[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [projectId, setProjectId] = useState('');
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [uom, setUom] = useState('bags');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const [s, p] = await Promise.all([api.get<Sku[]>('/skus'), api.get<Project[]>('/projects')]);
      setSkus(s);
      setProjects(p);
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
        <h1 className="text-lg font-semibold text-zinc-900">Inventory</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Flexible SKU master with freehand UOMs. currentStock = initial + inward − outward,
          applied atomically per adjustment.
        </p>
      </div>

      <Card>
        <CardHeader title="New SKU" />
        <CardBody>
          <div className="grid grid-cols-5 gap-3">
            <select className="input" value={projectId} onChange={(e) => setProjectId(e.target.value)}>
              <option value="">Project</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <input className="input" placeholder="Code" value={code} onChange={(e) => setCode(e.target.value)} />
            <input className="input" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
            <input className="input" placeholder="UOM (kg, bags, m³…)" value={uom} onChange={(e) => setUom(e.target.value)} />
            <Button
              disabled={busy || !projectId || !code || !name || !uom}
              onClick={async () => {
                setBusy(true);
                try {
                  await api.post('/skus', { projectId, code, name, uom });
                  setCode('');
                  setName('');
                  await load();
                } catch (e) {
                  setErr(e instanceof ApiError ? e.message : 'Request failed');
                } finally {
                  setBusy(false);
                }
              }}
            >
              Add SKU
            </Button>
          </div>
          {err && <p className="mt-3 text-sm text-red-600">{err}</p>}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="SKU master" />
        <CardBody className="p-0">
          {loading ? (
            <p className="p-5 text-sm text-zinc-500">Loading…</p>
          ) : skus.length === 0 ? (
            <div className="p-5">
              <EmptyState icon={Warehouse} title="No SKUs yet" description="Add your first SKU above." />
            </div>
          ) : (
            <Table>
              <Thead>
                <Th>Code</Th>
                <Th>Name</Th>
                <Th>UOM</Th>
                <Th>Stock</Th>
                <Th>Safety stock</Th>
              </Thead>
              <tbody>
                {skus.map((s) => {
                  const low = Number(s.currentStock) < Number(s.safetyStock);
                  return (
                    <Tr key={s.id}>
                      <Td className="font-medium text-zinc-900">{s.code}</Td>
                      <Td>{s.name}</Td>
                      <Td>{s.uom}</Td>
                      <Td>
                        {s.currentStock} {low && <Badge tone="red">low stock</Badge>}
                      </Td>
                      <Td>{s.safetyStock}</Td>
                    </Tr>
                  );
                })}
              </tbody>
            </Table>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
