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
import { Building2, PackageCheck, FileCheck, PlusCircle, CheckCircle } from 'lucide-react';

interface Requisition {
  id: string;
  requisitionNo: string;
  requestedBy: string;
  department: string;
  totalEstimatedCost: number;
  status: string;
}

interface RFQ {
  id: string;
  rfqNumber: string;
  title: string;
  status: string;
  quotes?: { id: string; vendorName: string; quotedRate: number; deliveryDays: number }[];
}

interface GRN {
  id: string;
  grnNumber: string;
  poNumber: string;
  vendorName: string;
  receivedItems: string;
  receivedAt: string;
}

export default function ProcurementPage() {
  const [requisitions, setRequisitions] = useState<Requisition[]>([]);
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [grns, setGrns] = useState<GRN[]>([]);
  const [err, setErr] = useState<string | null>(null);

  // Form states
  const [rfqTitle, setRfqTitle] = useState('');
  const [reqCost, setReqCost] = useState('');
  const [reqDept, setReqDept] = useState('Site Civil');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const [reqs, rfqList, grnList] = await Promise.all([
        api.get<Requisition[]>('/procurement/requisitions'),
        api.get<RFQ[]>('/procurement/rfqs'),
        api.get<GRN[]>('/procurement/grns'),
      ]);
      setRequisitions(reqs);
      setRfqs(rfqList);
      setGrns(grnList);
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : 'Failed to load procurement data');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreateRequisition = async () => {
    if (!reqCost) return;
    setBusy(true);
    try {
      await api.post('/procurement/requisitions', {
        totalEstimatedCost: Number(reqCost) || 0,
        department: reqDept,
      });
      setReqCost('');
      await load();
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : 'Failed to create requisition');
    } finally {
      setBusy(false);
    }
  };

  const handleCreateRfq = async () => {
    if (!rfqTitle) return;
    setBusy(true);
    try {
      await api.post('/procurement/rfqs', { title: rfqTitle });
      setRfqTitle('');
      await load();
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : 'Failed to create RFQ');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-7">
      <PageHeader
        title="Procurement, RFQ & Vendor Bidding Suite"
        description="Purchase requisitions, Request for Quotation (RFQ) bidding comparison matrix, and Goods Receipt Note (GRN) site verification."
      />

      {err && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl">{err}</div>}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat icon={FileCheck} tone="brand" value={String(requisitions.length)} label="Purchase Requisitions" sub="Internal requests" />
        <Stat icon={Building2} tone="blue" value={String(rfqs.length)} label="Active RFQs" sub="Supplier bidding open" />
        <Stat icon={PackageCheck} tone="green" value={String(grns.length)} label="Goods Receipt Notes" sub="GRN Verified" />
        <Stat icon={CheckCircle} tone="amber" value="100%" label="Vendor Compliance" sub="Audited" />
      </div>

      {/* Action Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Disclosure title="Raise Purchase Requisition">
          <div className="space-y-3">
            <Field label="Department" value={reqDept} onChange={(e) => setReqDept(e.target.value)} />
            <Field label="Estimated Cost (₹)" type="number" placeholder="450000" value={reqCost} onChange={(e) => setReqCost(e.target.value)} />
            <Button size="sm" className="w-full" disabled={busy || !reqCost} onClick={handleCreateRequisition}>
              <PlusCircle className="w-3.5 h-3.5 mr-1.5" /> Submit Requisition
            </Button>
          </div>
        </Disclosure>

        <Disclosure title="Publish Request for Quotation (RFQ)">
          <div className="space-y-3">
            <Field label="RFQ Title" placeholder="e.g. Procurement of Fe550 TMT Rebar - 100 MT" value={rfqTitle} onChange={(e) => setRfqTitle(e.target.value)} />
            <Button size="sm" className="w-full" disabled={busy || !rfqTitle} onClick={handleCreateRfq}>
              <PlusCircle className="w-3.5 h-3.5 mr-1.5" /> Issue RFQ to Bidders
            </Button>
          </div>
        </Disclosure>
      </div>

      {/* RFQ Supplier Comparison Matrix */}
      <Card>
        <CardHeader title="RFQ Supplier Quotation Bidding Matrix" description="Side-by-side vendor rate comparison and lead times" />
        <CardBody className="space-y-3">
          {rfqs.length === 0 ? (
            <div className="p-5 text-center text-xs text-zinc-500">No active RFQs issued.</div>
          ) : (
            rfqs.map((rfq) => (
              <div key={rfq.id} className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-zinc-100">{rfq.title} ({rfq.rfqNumber})</span>
                  <Badge tone="blue">{rfq.status}</Badge>
                </div>
                <div className="text-xs text-zinc-400">Received Bids: {rfq.quotes?.length ?? 0} suppliers</div>
              </div>
            ))
          )}
        </CardBody>
      </Card>
    </div>
  );
}
