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
import { Landmark, FileText, PlusCircle, ArrowUpRight, BookOpen, Layers, HardDrive } from 'lucide-react';

interface GstInvoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  subtotal: number;
  cgstAmount: number;
  sgstAmount: number;
  totalAmount: number;
  status: string;
}

interface JournalEntry {
  id: string;
  entryNumber: string;
  accountName: string;
  debit: number;
  credit: number;
  narration: string;
}

interface TrialBalanceItem {
  accountName: string;
  totalDebit: number;
  totalCredit: number;
  balance: number;
}

interface FixedAsset {
  id: string;
  assetName: string;
  category: string;
  purchaseCost: number;
  accumulatedDepreciation: number;
  netBookValue: number;
}

export default function AccountingPage() {
  const [invoices, setInvoices] = useState<GstInvoice[]>([]);
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [tbItems, setTbItems] = useState<TrialBalanceItem[]>([]);
  const [assets, setAssets] = useState<FixedAsset[]>([]);
  const [err, setErr] = useState<string | null>(null);

  // Form states
  const [customerName, setCustomerName] = useState('');
  const [subtotal, setSubtotal] = useState('');

  const [assetName, setAssetName] = useState('');
  const [assetCost, setAssetCost] = useState('');
  const [depRate, setDepRate] = useState('15');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const [invs, jnls, tb, ast] = await Promise.all([
        api.get<GstInvoice[]>('/accounting/invoices'),
        api.get<JournalEntry[]>('/accounting/journal-entries'),
        api.get<TrialBalanceItem[]>('/accounting/trial-balance'),
        api.get<FixedAsset[]>('/accounting/fixed-assets'),
      ]);
      setInvoices(invs);
      setJournals(jnls);
      setTbItems(tb);
      setAssets(ast);
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : 'Failed to load accounting data');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreateInvoice = async () => {
    if (!customerName || !subtotal) return;
    setBusy(true);
    try {
      await api.post('/accounting/invoices', { customerName, subtotal: Number(subtotal) || 0 });
      setCustomerName('');
      setSubtotal('');
      await load();
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : 'Failed to issue invoice');
    } finally {
      setBusy(false);
    }
  };

  const handleCreateAsset = async () => {
    if (!assetName || !assetCost) return;
    setBusy(true);
    try {
      await api.post('/accounting/fixed-assets', {
        assetName,
        purchaseCost: Number(assetCost) || 0,
        depreciationRate: Number(depRate) || 15,
      });
      setAssetName('');
      setAssetCost('');
      await load();
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : 'Failed to register fixed asset');
    } finally {
      setBusy(false);
    }
  };

  const totalInvoiceVal = invoices.reduce((acc, i) => acc + Number(i.totalAmount), 0);
  const totalGstTax = invoices.reduce((acc, i) => acc + Number(i.cgstAmount) + Number(i.sgstAmount), 0);

  return (
    <div className="space-y-7">
      <PageHeader
        title="Accounting & Tax Automation Engine"
        description="GST tax invoices, credit/debit notes, double-entry general ledger, Trial Balance, and Fixed Asset depreciation schedules."
      />

      {err && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl">{err}</div>}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat icon={Landmark} tone="brand" value={`₹ ${totalInvoiceVal.toLocaleString()}`} label="Total Billed Invoices" sub="Live DB query" />
        <Stat icon={FileText} tone="green" value={`₹ ${totalGstTax.toLocaleString()}`} label="GST Liability (18%)" sub="CGST + SGST total" />
        <Stat icon={Layers} tone="blue" value={String(tbItems.length)} label="Trial Balance Accounts" sub="Balanced Ledgers" />
        <Stat icon={HardDrive} tone="amber" value={String(assets.length)} label="Fixed Assets Register" sub="Depreciation Tracked" />
      </div>

      {/* Action Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Disclosure title="Generate Tax Compliant GST Invoice">
          <div className="space-y-3">
            <Field label="Customer / Party Name" placeholder="e.g. Rahul Mehta" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
            <Field label="Subtotal Amount (₹)" type="number" placeholder="100000" value={subtotal} onChange={(e) => setSubtotal(e.target.value)} />
            <Button size="sm" className="w-full" disabled={busy || !customerName || !subtotal} onClick={handleCreateInvoice}>
              <PlusCircle className="w-3.5 h-3.5 mr-1.5" /> Issue GST Invoice
            </Button>
          </div>
        </Disclosure>

        <Disclosure title="Register Fixed Asset & Depreciation Schedule">
          <div className="space-y-3">
            <Field label="Asset Name" placeholder="e.g. Tower Crane #2 - Model X500" value={assetName} onChange={(e) => setAssetName(e.target.value)} />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Purchase Cost (₹)" type="number" placeholder="4500000" value={assetCost} onChange={(e) => setAssetCost(e.target.value)} />
              <Field label="Depreciation Rate (%)" type="number" value={depRate} onChange={(e) => setDepRate(e.target.value)} />
            </div>
            <Button size="sm" className="w-full" disabled={busy || !assetName || !assetCost} onClick={handleCreateAsset}>
              <PlusCircle className="w-3.5 h-3.5 mr-1.5" /> Register Asset
            </Button>
          </div>
        </Disclosure>
      </div>

      {/* Trial Balance Aggregation */}
      <Card>
        <CardHeader title="General Ledger Trial Balance" description="Balanced debits and credits aggregated from journal entries" />
        <CardBody className="p-0 overflow-x-auto">
          {tbItems.length === 0 ? (
            <div className="p-5 text-center text-xs text-zinc-500">No balanced ledger entries found in database.</div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-950 text-zinc-400 uppercase border-b border-zinc-800">
                <tr>
                  <th className="p-3.5">Account Name</th>
                  <th className="p-3.5">Total Debit (₹)</th>
                  <th className="p-3.5">Total Credit (₹)</th>
                  <th className="p-3.5">Net Balance (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 text-zinc-200">
                {tbItems.map((item, idx) => (
                  <tr key={idx} className="hover:bg-zinc-900/60 transition">
                    <td className="p-3.5 font-medium text-zinc-100">{item.accountName}</td>
                    <td className="p-3.5 font-mono text-emerald-400">₹ {Number(item.totalDebit).toLocaleString()}</td>
                    <td className="p-3.5 font-mono text-amber-400">₹ {Number(item.totalCredit).toLocaleString()}</td>
                    <td className="p-3.5 font-mono font-semibold text-zinc-100">₹ {Number(item.balance).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardBody>
      </Card>

      {/* Fixed Assets & Depreciation Schedule */}
      <Card>
        <CardHeader title="Fixed Assets Register & Net Book Value" description="Straight-line depreciation schedules for capital machinery" />
        <CardBody className="p-0 overflow-x-auto">
          {assets.length === 0 ? (
            <div className="p-5 text-center text-xs text-zinc-500">No fixed assets registered in database.</div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-950 text-zinc-400 uppercase border-b border-zinc-800">
                <tr>
                  <th className="p-3.5">Asset Name</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Purchase Cost</th>
                  <th className="p-3.5">Accumulated Dep.</th>
                  <th className="p-3.5">Net Book Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 text-zinc-200">
                {assets.map((ast) => (
                  <tr key={ast.id} className="hover:bg-zinc-900/60 transition">
                    <td className="p-3.5 font-medium text-zinc-100">{ast.assetName}</td>
                    <td className="p-3.5"><Badge tone="blue">{ast.category}</Badge></td>
                    <td className="p-3.5 font-mono">₹ {Number(ast.purchaseCost).toLocaleString()}</td>
                    <td className="p-3.5 font-mono text-red-400">₹ {Number(ast.accumulatedDepreciation).toLocaleString()}</td>
                    <td className="p-3.5 font-mono font-semibold text-emerald-400">₹ {Number(ast.netBookValue).toLocaleString()}</td>
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
