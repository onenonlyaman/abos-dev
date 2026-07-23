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
import { Users, DollarSign, PlusCircle } from 'lucide-react';

interface Lead {
  id: string;
  name: string;
  phone: string;
  state: string;
  project?: { name: string };
}

interface Commission {
  id: string;
  brokerName: string;
  unitCode: string;
  commissionAmount: number;
  status: string;
}

export default function PartnerPortalPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // Form states
  const [brokerName, setBrokerName] = useState('');
  const [unitCode, setUnitCode] = useState('');
  const [commissionAmount, setCommissionAmount] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await api.get<{ leads: Lead[]; commissions: Commission[] }>('/portals/partner');
      setLeads(data.leads || []);
      setCommissions(data.commissions || []);
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : 'Failed to load Channel Partner Portal');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreateCommission = async () => {
    if (!brokerName || !unitCode) return;
    setBusy(true);
    try {
      await api.post('/portals/partner/commissions', {
        brokerName,
        unitCode,
        commissionAmount: Number(commissionAmount) || 0,
      });
      setBrokerName('');
      setUnitCode('');
      setCommissionAmount('');
      await load();
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : 'Failed to register broker commission claim');
    } finally {
      setBusy(false);
    }
  };

  const totalCommissions = commissions.reduce((acc, c) => acc + Number(c.commissionAmount), 0);

  return (
    <div className="space-y-7">
      <PageHeader
        title="Channel Partner & Broker Portal"
        description="Self-service portal for real estate brokers: Register buyer leads, check inventory availability, and track commission claims."
      />

      {err && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl">{err}</div>}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat icon={Users} tone="brand" value={String(leads.length)} label="Registered Leads" sub="Broker sourced" />
        <Stat icon={DollarSign} tone="green" value={`₹ ${totalCommissions.toLocaleString()}`} label="Commission Claims" sub="Total payouts" />
        <Stat icon={Users} tone="blue" value={String(commissions.length)} label="Deals Closed" sub="Units Booked" />
        <Stat icon={DollarSign} tone="amber" value="2.0%" label="Default Commission" sub="Agreement Rate" />
      </div>

      <Disclosure title="Submit Broker Commission Payout Claim">
        <div className="space-y-3">
          <Field label="Broker / Firm Name" placeholder="e.g. Apex Realty Partners" value={brokerName} onChange={(e) => setBrokerName(e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Booked Unit Code" placeholder="e.g. A-102" value={unitCode} onChange={(e) => setUnitCode(e.target.value)} />
            <Field label="Commission Amount (₹)" type="number" placeholder="170000" value={commissionAmount} onChange={(e) => setCommissionAmount(e.target.value)} />
          </div>
          <Button size="sm" className="w-full" disabled={busy || !brokerName || !unitCode} onClick={handleCreateCommission}>
            <PlusCircle className="w-3.5 h-3.5 mr-1.5" /> Submit Claim
          </Button>
        </div>
      </Disclosure>

      <Card>
        <CardHeader title="Broker Commission Payout Claims" description="Status of submitted deal commissions" />
        <CardBody className="p-0 overflow-x-auto">
          {commissions.length === 0 ? (
            <div className="p-5">
              <EmptyState icon={DollarSign} title="No commission claims logged" description="Submit a deal commission claim using the action panel above." />
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-950 text-zinc-400 uppercase border-b border-zinc-800">
                <tr>
                  <th className="p-3.5">Broker Firm</th>
                  <th className="p-3.5">Unit</th>
                  <th className="p-3.5">Commission Amount</th>
                  <th className="p-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 text-zinc-200">
                {commissions.map((c) => (
                  <tr key={c.id} className="hover:bg-zinc-900/60 transition">
                    <td className="p-3.5 font-medium text-zinc-100">{c.brokerName}</td>
                    <td className="p-3.5 font-mono text-zinc-300">{c.unitCode}</td>
                    <td className="p-3.5 font-mono font-semibold text-emerald-400">₹ {Number(c.commissionAmount).toLocaleString()}</td>
                    <td className="p-3.5"><Badge tone="amber">{c.status}</Badge></td>
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
