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
import { Select } from '@/components/ui/select';
import { api, ApiError } from '@/lib/api';
import { CheckSquare, AlertCircle, ShieldCheck, UserCheck, PlusCircle } from 'lucide-react';

interface Inspection {
  id: string;
  location: string;
  score: number;
  status: string;
}

interface Snag {
  id: string;
  title: string;
  description: string;
  severity: string;
  status: string;
}

export default function QualityPage() {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [snags, setSnags] = useState<Snag[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('minor');
  const [assignedTo, setAssignedTo] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const [i, s] = await Promise.all([
        api.get<Inspection[]>('/quality/inspections'),
        api.get<Snag[]>('/quality/snags'),
      ]);
      setInspections(i);
      setSnags(s);
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : 'Failed to load quality data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreateSnag = async () => {
    if (!title) return;
    setBusy(true);
    try {
      await api.post('/quality/snags', {
        title,
        description,
        severity,
        assignedTo,
      });
      setTitle('');
      setDescription('');
      setSeverity('minor');
      setAssignedTo('');
      await load();
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : 'Failed to log defect snag');
    } finally {
      setBusy(false);
    }
  };

  const avgScore = inspections.length
    ? (inspections.reduce((acc, i) => acc + Number(i.score), 0) / inspections.length).toFixed(1)
    : 'N/A';

  return (
    <div className="space-y-7">
      <PageHeader
        title="Quality Control & Snag List Management"
        description="Site inspection checklists, defect detection, snag rectifications, and quality scores."
      />

      {err && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl">{err}</div>}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat icon={ShieldCheck} tone="brand" value={avgScore} label="Site Quality Score" sub="Live DB score average" />
        <Stat icon={CheckSquare} tone="green" value={String(inspections.length)} label="Inspections Completed" sub="Recorded in database" />
        <Stat icon={AlertCircle} tone="amber" value={String(snags.filter((s) => s.status !== 'closed').length)} label="Active Snags" sub="Pending rectifications" />
        <Stat icon={UserCheck} tone="blue" value={String(snags.filter((s) => s.status === 'closed').length)} label="Closed Rectifications" sub="Verified by QA" />
      </div>

      <Disclosure title="Log New Defect Snag Ticket">
        <div className="space-y-3">
          <Field label="Defect Title" placeholder="e.g. Plaster Honeycombing on Column C4" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Field label="Description & Location" placeholder="Tower A - Floor 4 Column C4" value={description} onChange={(e) => setDescription(e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <Select label="Severity" value={severity} onChange={(e) => setSeverity(e.target.value)}>
              <option value="minor">Minor</option>
              <option value="major">Major</option>
              <option value="critical">Critical</option>
              <option value="blocker">Blocker</option>
            </Select>
            <Field label="Assigned Contractor" placeholder="Apex Concrete Ltd." value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} />
          </div>
          <Button size="sm" className="w-full" disabled={busy || !title} onClick={handleCreateSnag}>
            <PlusCircle className="w-3.5 h-3.5 mr-1.5" /> Log Defect Ticket
          </Button>
        </div>
      </Disclosure>

      <Card>
        <CardHeader title="Active Defect & Snag Register" description="Issues identified during site quality walk (Live DB Query)" />
        <CardBody className="space-y-3">
          {snags.length === 0 ? (
            <EmptyState icon={CheckSquare} title="No active snags found" description="Log your first defect snag ticket using the panel above." />
          ) : (
            snags.map((s) => (
              <div key={s.id} className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-sm text-zinc-100">{s.title}</span>
                    <Badge tone={s.severity === 'critical' || s.severity === 'blocker' ? 'red' : s.severity === 'major' ? 'amber' : 'neutral'}>
                      {s.severity}
                    </Badge>
                  </div>
                  <p className="text-xs text-zinc-400">{s.description}</p>
                </div>
                <Badge tone={s.status === 'closed' ? 'green' : 'red'}>{s.status}</Badge>
              </div>
            ))
          )}
        </CardBody>
      </Card>
    </div>
  );
}
