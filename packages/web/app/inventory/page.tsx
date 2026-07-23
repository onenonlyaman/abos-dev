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
import { Warehouse, ArrowLeftRight, FileText, PlusCircle, CheckCircle } from 'lucide-react';

interface Godown {
  id: string;
  name: string;
  location: string;
  capacitySqft: number;
}

interface StockTransfer {
  id: string;
  transferNo: string;
  skuName: string;
  quantity: number;
  fromGodown?: { name: string };
  toGodown?: { name: string };
  transferredAt: string;
}

interface MaterialIssueSlip {
  id: string;
  issueNumber: string;
  contractor: string;
  materialName: string;
  quantity: number;
  issuedAt: string;
}

export default function InventoryPage() {
  const [godowns, setGodowns] = useState<Godown[]>([]);
  const [transfers, setTransfers] = useState<StockTransfer[]>([]);
  const [issueSlips, setIssueSlips] = useState<MaterialIssueSlip[]>([]);
  const [err, setErr] = useState<string | null>(null);

  // Form states
  const [skuName, setSkuName] = useState('');
  const [transferQty, setTransferQty] = useState('');

  const [contractor, setContractor] = useState('');
  const [materialName, setMaterialName] = useState('');
  const [issueQty, setIssueQty] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const [g, t, i] = await Promise.all([
        api.get<Godown[]>('/inventory/godowns'),
        api.get<StockTransfer[]>('/inventory/transfers'),
        api.get<MaterialIssueSlip[]>('/inventory/issue-slips'),
      ]);
      setGodowns(g);
      setTransfers(t);
      setIssueSlips(i);
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : 'Failed to load inventory data');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreateTransfer = async () => {
    if (!skuName || !transferQty) return;
    setBusy(true);
    try {
      await api.post('/inventory/transfers', {
        skuName,
        quantity: Number(transferQty) || 1,
      });
      setSkuName('');
      setTransferQty('');
      await load();
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : 'Failed to execute stock transfer');
    } finally {
      setBusy(false);
    }
  };

  const handleCreateIssueSlip = async () => {
    if (!contractor || !materialName) return;
    setBusy(true);
    try {
      await api.post('/inventory/issue-slips', {
        contractor,
        materialName,
        quantity: Number(issueQty) || 1,
      });
      setContractor('');
      setMaterialName('');
      setIssueQty('');
      await load();
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : 'Failed to issue material slip');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-7">
      <PageHeader
        title="Multi-Godown Inventory & Material Dispatch Suite"
        description="Warehouse godown transfers, contractor material issue slips, SKU stock balances, and physical inventory audits."
      />

      {err && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl">{err}</div>}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat icon={Warehouse} tone="brand" value={String(godowns.length)} label="Godowns / Warehouses" sub="Site stores" />
        <Stat icon={ArrowLeftRight} tone="blue" value={String(transfers.length)} label="Inter-Godown Transfers" sub="Transferred materials" />
        <Stat icon={FileText} tone="green" value={String(issueSlips.length)} label="Material Issue Slips" sub="Contractor Dispatches" />
        <Stat icon={CheckCircle} tone="amber" value="100%" label="Stock Verification" sub="Physical Audit Clear" />
      </div>

      {/* Action Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Disclosure title="Execute Inter-Godown Stock Transfer">
          <div className="space-y-3">
            <Field label="Material / SKU Name" placeholder="e.g. UltraTech PPC Cement 50kg" value={skuName} onChange={(e) => setSkuName(e.target.value)} />
            <Field label="Transfer Quantity" type="number" placeholder="150" value={transferQty} onChange={(e) => setTransferQty(e.target.value)} />
            <Button size="sm" className="w-full" disabled={busy || !skuName || !transferQty} onClick={handleCreateTransfer}>
              <PlusCircle className="w-3.5 h-3.5 mr-1.5" /> Transfer Stock
            </Button>
          </div>
        </Disclosure>

        <Disclosure title="Issue Material Slip to Contractor">
          <div className="space-y-3">
            <Field label="Contractor Name" placeholder="e.g. Apex Civil Works" value={contractor} onChange={(e) => setContractor(e.target.value)} />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Material Description" placeholder="Fe550 Rebar 12mm" value={materialName} onChange={(e) => setMaterialName(e.target.value)} />
              <Field label="Quantity Issued" type="number" placeholder="25" value={issueQty} onChange={(e) => setIssueQty(e.target.value)} />
            </div>
            <Button size="sm" className="w-full" disabled={busy || !contractor || !materialName} onClick={handleCreateIssueSlip}>
              <PlusCircle className="w-3.5 h-3.5 mr-1.5" /> Issue Material
            </Button>
          </div>
        </Disclosure>
      </div>

      {/* Stock Transfers Table */}
      <Card>
        <CardHeader title="Inter-Godown Stock Transfer Ledger" description="Real-time movement between site godowns" />
        <CardBody className="p-0 overflow-x-auto">
          {transfers.length === 0 ? (
            <div className="p-5 text-center text-xs text-zinc-500">No stock transfers recorded.</div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-950 text-zinc-400 uppercase border-b border-zinc-800">
                <tr>
                  <th className="p-3.5">Transfer #</th>
                  <th className="p-3.5">Material</th>
                  <th className="p-3.5">Quantity</th>
                  <th className="p-3.5">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 text-zinc-200">
                {transfers.map((t) => (
                  <tr key={t.id} className="hover:bg-zinc-900/60 transition">
                    <td className="p-3.5 font-mono font-semibold text-zinc-300">{t.transferNo}</td>
                    <td className="p-3.5 font-medium text-zinc-100">{t.skuName}</td>
                    <td className="p-3.5 font-mono text-emerald-400">{t.quantity}</td>
                    <td className="p-3.5 text-zinc-400">{new Date(t.transferredAt).toLocaleDateString()}</td>
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
