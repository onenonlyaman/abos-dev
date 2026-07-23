'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { Wallet, IndianRupee, TrendingDown, AlertTriangle, ShieldAlert } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import type { BudgetLine } from '@/lib/types-extra';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { Table, Thead, Th, Td, Tr } from '@/components/ui/table';
import { PageHeader } from '@/components/ui/page-header';
import { TableSkeleton, StatSkeleton } from '@/components/ui/skeleton';
import { Select } from '@/components/ui/select';
import { Stat } from '@/components/ui/stat';

const ALERT_TONE = { ok: 'green', warning: 'amber', breach: 'red' } as const;
const ALERT_LEVELS: (keyof typeof ALERT_TONE)[] = ['ok', 'warning', 'breach'];

export default function FinancePage() {
  const [lines, setLines] = useState<BudgetLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [alertFilter, setAlertFilter] = useState('all');

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

  const filteredLines = useMemo(
    () => (alertFilter === 'all' ? lines : lines.filter((l) => l.alertLevel === alertFilter)),
    [lines, alertFilter],
  );

  const totals = useMemo(
    () => ({
      allocated: lines.reduce((sum, l) => sum + Number(l.allocatedCap), 0),
      consumed: lines.reduce((sum, l) => sum + Number(l.consumedAmount), 0),
      breaches: lines.filter((l) => l.alertLevel === 'breach').length,
      warnings: lines.filter((l) => l.alertLevel === 'warning').length,
    }),
    [lines],
  );

  return (
    <div className="space-y-8">
      <PageHeader
        title="Finance / Budget"
        description="Preset per-unit baseline cost = allocated cap ÷ expected quantity. 75% consumption triggers a warning, 100% a hard breach. Budget lines are created via POST /budget-lines once a project and SKU exist."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)
        ) : (
          <>
            <Stat icon={IndianRupee} tone="brand" value={`₹${totals.allocated.toLocaleString()}`} label="Allocated" />
            <Stat icon={TrendingDown} tone="blue" value={`₹${totals.consumed.toLocaleString()}`} label="Consumed" />
            <Stat icon={AlertTriangle} tone="amber" value={totals.warnings} label="Warnings" />
            <Stat icon={ShieldAlert} tone="red" value={totals.breaches} label="Breaches" />
          </>
        )}
      </div>

      <Card>
        <CardHeader
          title="Budget lines"
          actions={
            lines.length > 0 && (
              <Select
                aria-label="Filter by alert level"
                className="h-8 w-36 text-xs"
                value={alertFilter}
                onChange={(e) => setAlertFilter(e.target.value)}
              >
                <option value="all">All levels</option>
                {ALERT_LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </Select>
            )
          }
        />
        <CardBody className="p-0">
          {loading ? (
            <TableSkeleton cols={5} />
          ) : err ? (
            <p className="p-5 text-sm text-danger">{err}</p>
          ) : lines.length === 0 ? (
            <div className="p-5">
              <EmptyState
                icon={Wallet}
                title="No budget lines yet"
                description="Create one per project/SKU to enable the 10% cost-deviation trigger and 75%/100% alerts."
              />
            </div>
          ) : filteredLines.length === 0 ? (
            <div className="p-5">
              <EmptyState icon={Wallet} title="No matching lines" description="Try a different alert filter." />
            </div>
          ) : (
            <Table>
              <Thead>
                <Th>SKU</Th>
                <Th className="text-right">Allocated cap</Th>
                <Th className="text-right">Consumed</Th>
                <Th className="text-right">% consumed</Th>
                <Th>Status</Th>
              </Thead>
              <tbody>
                {filteredLines.map((l) => (
                  <Tr key={l.id}>
                    <Td className="font-mono text-[12.5px] font-semibold text-ink">{l.sku?.code ?? '–'}</Td>
                    <Td className="text-right tabular-nums">₹{Number(l.allocatedCap).toLocaleString()}</Td>
                    <Td className="text-right tabular-nums">₹{Number(l.consumedAmount).toLocaleString()}</Td>
                    <Td className="text-right tabular-nums">{(l.consumedPct * 100).toFixed(1)}%</Td>
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
