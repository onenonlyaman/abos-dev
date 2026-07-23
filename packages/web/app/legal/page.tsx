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
import { Shield, FileCheck, Landmark, Lock, PlusCircle } from 'lucide-react';

interface Contract {
  id: string;
  partyName: string;
  title: string;
  status: string;
}

interface LandRecord {
  id: string;
  surveyNumber: string;
  landAreaAcre: number;
  ownerName: string;
  clearanceStatus: string;
}

interface Rera {
  id: string;
  registrationNo: string;
  validUntil: string;
  status: string;
}

export default function LegalPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [landRecords, setLandRecords] = useState<LandRecord[]>([]);
  const [reras, setReras] = useState<Rera[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // Form states
  const [reraNo, setReraNo] = useState('');
  const [reraValid, setReraValid] = useState('');

  const [surveyNo, setSurveyNo] = useState('');
  const [landArea, setLandArea] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const [c, l, r] = await Promise.all([
        api.get<Contract[]>('/legal/contracts'),
        api.get<LandRecord[]>('/legal/land-records'),
        api.get<Rera[]>('/legal/rera'),
      ]);
      setContracts(c);
      setLandRecords(l);
      setReras(r);
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : 'Failed to load legal data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreateRera = async () => {
    if (!reraNo) return;
    setBusy(true);
    try {
      await api.post('/legal/rera', {
        registrationNo: reraNo,
        validUntil: reraValid || undefined,
      });
      setReraNo('');
      setReraValid('');
      await load();
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : 'Failed to register RERA approval');
    } finally {
      setBusy(false);
    }
  };

  const handleCreateLandRecord = async () => {
    if (!surveyNo) return;
    setBusy(true);
    try {
      await api.post('/legal/land-records', {
        surveyNumber: surveyNo,
        landAreaAcre: Number(landArea) || 1.0,
        ownerName: ownerName || 'SPV Entity',
      });
      setSurveyNo('');
      setLandArea('');
      setOwnerName('');
      await load();
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : 'Failed to add land record');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-7">
      <PageHeader
        title="Legal, Land Records & RERA Compliance"
        description="Government approvals, RERA registration tracking, land title deeds, and digital contract vault."
      />

      {err && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl">{err}</div>}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat icon={Shield} tone="brand" value={String(reras.length)} label="RERA Registrations" sub="Recorded in database" />
        <Stat icon={FileCheck} tone="green" value={String(landRecords.length)} label="Land Parcels" sub="Title deeds verified" />
        <Stat icon={Landmark} tone="blue" value={`${landRecords.reduce((acc, l) => acc + Number(l.landAreaAcre), 0)} Acres`} label="Land Bank Area" sub="Total acreage" />
        <Stat icon={Lock} tone="amber" value={String(contracts.length)} label="Active Contracts" sub="Legal vault index" />
      </div>

      {/* Action Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Disclosure title="Register New RERA Certificate">
          <div className="space-y-3">
            <Field label="RERA Registration No." placeholder="e.g. P51800028491" value={reraNo} onChange={(e) => setReraNo(e.target.value)} />
            <Field label="Valid Until Date" type="date" value={reraValid} onChange={(e) => setReraValid(e.target.value)} />
            <Button size="sm" className="w-full" disabled={busy || !reraNo} onClick={handleCreateRera}>
              <PlusCircle className="w-3.5 h-3.5 mr-1.5" /> Register RERA Approval
            </Button>
          </div>
        </Disclosure>

        <Disclosure title="Add New Land Title Survey Record">
          <div className="space-y-3">
            <Field label="Survey Number" placeholder="e.g. CTS 148/A" value={surveyNo} onChange={(e) => setSurveyNo(e.target.value)} />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Area (Acres)" type="number" placeholder="4.2" value={landArea} onChange={(e) => setLandArea(e.target.value)} />
              <Field label="Owner Entity / SPV" placeholder="Avenue Developers SPV 1" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} />
            </div>
            <Button size="sm" className="w-full" disabled={busy || !surveyNo} onClick={handleCreateLandRecord}>
              <PlusCircle className="w-3.5 h-3.5 mr-1.5" /> Register Land Record
            </Button>
          </div>
        </Disclosure>
      </div>

      {/* RERA Approvals */}
      <Card>
        <CardHeader title="RERA Registrations & Compliance Status" description="State real estate regulatory authority certifications (Live DB Query)" />
        <CardBody className="space-y-3">
          {reras.length === 0 ? (
            <EmptyState icon={Shield} title="No RERA registrations found" description="Register a RERA certificate using the action panel above." />
          ) : (
            reras.map((r) => (
              <div key={r.id} className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-sm text-zinc-100">Registration #{r.registrationNo}</div>
                  <div className="text-xs font-mono text-zinc-400 mt-0.5">Valid until {new Date(r.validUntil).toLocaleDateString()}</div>
                </div>
                <Badge tone="green">{r.status}</Badge>
              </div>
            ))
          )}
        </CardBody>
      </Card>

      {/* Land Title Records */}
      <Card>
        <CardHeader title="Land Title Deeds & Survey Clearances" description="Verified ownership and non-encumbrance status" />
        <CardBody className="space-y-3">
          {landRecords.length === 0 ? (
            <EmptyState icon={Landmark} title="No land records found" description="Add a survey record using the action panel above." />
          ) : (
            landRecords.map((l) => (
              <div key={l.id} className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-sm text-zinc-100">Survey #{l.surveyNumber}</div>
                  <div className="text-xs text-zinc-400 mt-0.5">Area: {l.landAreaAcre} Acres • Owner: {l.ownerName}</div>
                </div>
                <Badge tone="blue">{l.clearanceStatus}</Badge>
              </div>
            ))
          )}
        </CardBody>
      </Card>
    </div>
  );
}
