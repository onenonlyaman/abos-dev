'use client';

import { useEffect, useState, useCallback } from 'react';
import { Wallet } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import type { BudgetLine } from '@/lib/types-extra';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { Table, Thead, Th, Td, Tr } from '@/components/ui/table';

const ALERT_TONE = { ok: 'green', warning: 'amber', breach: 'red' } as const;

export default function FinancePage() {
  const [lines, setLines] = useState<BudgetLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLines(await api.get<BudgetLine[]>('/budget-lines'));
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
        <h1 className="text-lg font-semibold text-zinc-900">Finance / Budget</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Preset per-unit baseline cost = allocated cap ÷ expected quantity. 75% consumption
          triggers a warning, 100% a hard breach. Budget lines are created via POST /budget-lines
          once a project and SKU exist.
        </p>
      </div>

      <Card>
        <CardHeader title="Budget lines" />
        <CardBody className="p-0">
          {loading ? (
            <p className="p-5 text-sm text-zinc-500">Loading…</p>
          ) : err ? (
            <p className="p-5 text-sm text-red-600">{err}</p>
          ) : lines.length === 0 ? (
            <div className="p-5">
              <EmptyState
                icon={Wallet}
                title="No budget lines yet"
                description="Create one per project/SKU to enable the 10% cost-deviation trigger and 75%/100% alerts."
              />
            </div>
          ) : (
            <Table>
              <Thead>
                <Th>SKU</Th>
                <Th>Allocated cap</Th>
                <Th>Consumed</Th>
                <Th>% consumed</Th>
                <Th>Status</Th>
              </Thead>
              <tbody>
                {lines.map((l) => (
                  <Tr key={l.id}>
                    <Td className="font-medium text-zinc-900">{l.sku?.code ?? '—'}</Td>
                    <Td>₹{Number(l.allocatedCap).toLocaleString()}</Td>
                    <Td>₹{Number(l.consumedAmount).toLocaleString()}</Td>
                    <Td>{(l.consumedPct * 100).toFixed(1)}%</Td>
                    <Td>
                      <Badge tone={ALERT_TONE[l.alertLevel]}>{l.alertLevel}</Badge>
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
