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
import { FileText, AlertTriangle, TrendingUp, CheckCircle, PlusCircle } from 'lucide-react';

interface VarianceReport {
  itemCode: string;
  description: string;
  estimatedCost: number;
  actualCost: number;
  varianceAmount: number;
  isOverBudget: boolean;
}

export default function BoqPage() {
  const [varianceList, setVarianceList] = useState<VarianceReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // Form states
  const [itemCode, setItemCode] = useState('');
  const [description, setDescription] = useState('');
  const [estQty, setEstQty] = useState('');
  const [estRate, setEstRate] = useState('');
  const [actCost, setActCost] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await api.get<VarianceReport[]>('/boq/variance');
      setVarianceList(data);
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : 'Failed to load BOQ variance report');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreateItem = async () => {
    if (!itemCode || !description) return;
    setBusy(true);
    try {
      await api.post('/boq', {
        itemCode,
        description,
        estimatedQty: Number(estQty) || 1,
        estimatedRate: Number(estRate) || 0,
        actualCost: Number(actCost) || 0,
      });
      setItemCode('');
      setDescription('');
      setEstQty('');
      setEstRate('');
      setActCost('');
      await load();
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : 'Failed to create BOQ item');
    } finally {
      setBusy(false);
    }
  };

  const totalEstimated = varianceList.reduce((acc, i) => acc + Number(i.estimatedCost), 0);
  const totalActual = varianceList.reduce((acc, i) => acc + Number(i.actualCost), 0);
  const breachCount = varianceList.filter((i) => i.isOverBudget).length;

  return (
    <div className="space-y-7">
      <PageHeader
        title="BOQ Management (Bill of Quantities)"
        description="Quantity estimation, actual vs. estimated cost comparison, variance tracking, and material predictions."
      />

      {err && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl">{err}</div>}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat icon={FileText} tone="brand" value={`₹ ${totalEstimated.toLocaleString()}`} label="Estimated BOQ Cap" sub="Live DB aggregation" />
        <Stat icon={TrendingUp} tone="blue" value={`₹ ${totalActual.toLocaleString()}`} label="Consumed to Date" sub="Live DB aggregation" />
        <Stat icon={AlertTriangle} tone="amber" value={String(breachCount)} label="Variance Flagged" sub="Exceeding estimated rates" />
        <Stat icon={CheckCircle} tone="green" value={String(varianceList.length)} label="BOQ Line Items" sub="Active in database" />
      </div>

      <Disclosure title="Add New BOQ Estimated Line Item">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Item Code" placeholder="e.g. BOQ-STL-05" value={itemCode} onChange={(e) => setItemCode(e.target.value)} />
            <Field label="Description" placeholder="e.g. Fe550 TMT Rebar 16mm" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Estimated Quantity" type="number" placeholder="500" value={estQty} onChange={(e) => setEstQty(e.target.value)} />
            <Field label="Estimated Rate (₹)" type="number" placeholder="60000" value={estRate} onChange={(e) => setEstRate(e.target.value)} />
            <Field label="Actual Cost to Date (₹)" type="number" placeholder="0" value={actCost} onChange={(e) => setActCost(e.target.value)} />
          </div>
          <Button size="sm" className="w-full" disabled={busy || !itemCode || !description} onClick={handleCreateItem}>
            <PlusCircle className="w-3.5 h-3.5 mr-1.5" /> Add BOQ Item
          </Button>
        </div>
      </Disclosure>

      <Card>
        <CardHeader title="Bill of Quantities Variance Grid" description="Live database query comparing estimated budget caps against actual site procurement" />
        <CardBody className="p-0 overflow-x-auto">
          {varianceList.length === 0 ? (
            <div className="p-5">
              <EmptyState icon={FileText} title="No BOQ items found" description="Add your first BOQ line item above." />
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-950 text-zinc-400 uppercase border-b border-zinc-800">
                <tr>
                  <th className="p-3.5">Code</th>
                  <th className="p-3.5">Description</th>
                  <th className="p-3.5">Est. Cost</th>
                  <th className="p-3.5">Actual Cost</th>
                  <th className="p-3.5">Variance</th>
                  <th className="p-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 text-zinc-200">
                {varianceList.map((item, idx) => (
                  <tr key={idx} className="hover:bg-zinc-900/60 transition">
                    <td className="p-3.5 font-mono font-semibold text-zinc-400">{item.itemCode}</td>
                    <td className="p-3.5 font-medium text-zinc-100">{item.description}</td>
                    <td className="p-3.5 font-mono">₹ {Number(item.estimatedCost).toLocaleString()}</td>
                    <td className="p-3.5 font-mono">₹ {Number(item.actualCost).toLocaleString()}</td>
                    <td className={`p-3.5 font-mono font-semibold ${item.isOverBudget ? 'text-red-400' : 'text-emerald-400'}`}>
                      ₹ {Number(item.varianceAmount).toLocaleString()}
                    </td>
                    <td className="p-3.5">
                      <Badge tone={item.isOverBudget ? 'red' : 'green'}>{item.isOverBudget ? 'Cost Breach' : 'On Track'}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
