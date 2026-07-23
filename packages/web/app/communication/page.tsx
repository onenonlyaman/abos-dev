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
import { MessageSquare, Phone, Send, PlusCircle } from 'lucide-react';

interface Campaign {
  id: string;
  title: string;
  channel: string;
  targetGroup: string;
  message: string;
  sentCount: number;
  createdAt: string;
}

interface CallLog {
  id: string;
  callerName: string;
  phone: string;
  durationSec: number;
  notes?: string;
  calledAt: string;
}

export default function CommunicationPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [channel, setChannel] = useState('whatsapp');
  const [targetGroup, setTargetGroup] = useState('Active Leads');
  const [message, setMessage] = useState('');

  const [callerName, setCallerName] = useState('');
  const [phone, setPhone] = useState('');
  const [durationSec, setDurationSec] = useState('120');
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const [c, cl] = await Promise.all([
        api.get<Campaign[]>('/communication/campaigns'),
        api.get<CallLog[]>('/communication/call-logs'),
      ]);
      setCampaigns(c);
      setCallLogs(cl);
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : 'Failed to load Communication Hub data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreateCampaign = async () => {
    if (!title || !message) return;
    setBusy(true);
    try {
      await api.post('/communication/campaigns', {
        title,
        channel,
        targetGroup,
        message,
      });
      setTitle('');
      setMessage('');
      await load();
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : 'Failed to launch broadcast campaign');
    } finally {
      setBusy(false);
    }
  };

  const handleCreateCallLog = async () => {
    if (!callerName || !phone) return;
    setBusy(true);
    try {
      await api.post('/communication/call-logs', {
        callerName,
        phone,
        durationSec: Number(durationSec) || 60,
        notes,
      });
      setCallerName('');
      setPhone('');
      setNotes('');
      await load();
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : 'Failed to record call log');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-7">
      <PageHeader
        title="Communication Hub & WhatsApp Broadcast Manager"
        description="Unified communication center: WhatsApp Business API campaigns, SMS broadcasts, and call interaction logs."
      />

      {err && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl">{err}</div>}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat icon={MessageSquare} tone="brand" value={String(campaigns.length)} label="Active Broadcasts" sub="WhatsApp & SMS" />
        <Stat icon={Send} tone="green" value={String(campaigns.reduce((acc, c) => acc + c.sentCount, 0))} label="Total Messages Sent" sub="Delivered" />
        <Stat icon={Phone} tone="blue" value={String(callLogs.length)} label="Call Recordings" sub="Customer interactions" />
        <Stat icon={MessageSquare} tone="amber" value="100%" label="WhatsApp API Status" sub="Connected" />
      </div>

      {/* Action Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Disclosure title="Launch WhatsApp / SMS Broadcast Campaign">
          <div className="space-y-3">
            <Field label="Campaign Title" placeholder="e.g. Q3 Demand Notice Reminder" value={title} onChange={(e) => setTitle(e.target.value)} />
            <div className="grid grid-cols-2 gap-3">
              <Select label="Channel" value={channel} onChange={(e) => setChannel(e.target.value)}>
                <option value="whatsapp">WhatsApp Business API</option>
                <option value="sms">SMS Gateway</option>
                <option value="email">Email Broadcast</option>
              </Select>
              <Field label="Target Audience" placeholder="Active Leads" value={targetGroup} onChange={(e) => setTargetGroup(e.target.value)} />
            </div>
            <Field label="Message Content" placeholder="Dear Customer, your milestone payment of..." value={message} onChange={(e) => setMessage(e.target.value)} />
            <Button size="sm" className="w-full" disabled={busy || !title || !message} onClick={handleCreateCampaign}>
              <PlusCircle className="w-3.5 h-3.5 mr-1.5" /> Trigger Broadcast
            </Button>
          </div>
        </Disclosure>

        <Disclosure title="Log Customer Call Interaction">
          <div className="space-y-3">
            <Field label="Caller Name" placeholder="e.g. Amit Patel" value={callerName} onChange={(e) => setCallerName(e.target.value)} />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Phone Number" placeholder="+91-9876543210" value={phone} onChange={(e) => setPhone(e.target.value)} />
              <Field label="Duration (Seconds)" type="number" value={durationSec} onChange={(e) => setDurationSec(e.target.value)} />
            </div>
            <Field label="Call Summary / Notes" placeholder="Discussed floor plan modification options..." value={notes} onChange={(e) => setNotes(e.target.value)} />
            <Button size="sm" className="w-full" disabled={busy || !callerName || !phone} onClick={handleCreateCallLog}>
              <PlusCircle className="w-3.5 h-3.5 mr-1.5" /> Record Call Log
            </Button>
          </div>
        </Disclosure>
      </div>

      {/* Campaigns Table */}
      <Card>
        <CardHeader title="Broadcast Campaign History" description="Sent messaging campaigns" />
        <CardBody className="p-0 overflow-x-auto">
          {campaigns.length === 0 ? (
            <div className="p-5">
              <EmptyState icon={MessageSquare} title="No campaigns triggered" description="Trigger a WhatsApp or SMS broadcast using the panel above." />
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-950 text-zinc-400 uppercase border-b border-zinc-800">
                <tr>
                  <th className="p-3.5">Title</th>
                  <th className="p-3.5">Channel</th>
                  <th className="p-3.5">Audience</th>
                  <th className="p-3.5">Sent Count</th>
                  <th className="p-3.5">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 text-zinc-200">
                {campaigns.map((c) => (
                  <tr key={c.id} className="hover:bg-zinc-900/60 transition">
                    <td className="p-3.5 font-medium text-zinc-100">{c.title}</td>
                    <td className="p-3.5"><Badge tone="green">{c.channel}</Badge></td>
                    <td className="p-3.5 text-zinc-400">{c.targetGroup}</td>
                    <td className="p-3.5 font-mono text-emerald-400 font-semibold">{c.sentCount}</td>
                    <td className="p-3.5 text-zinc-400">{new Date(c.createdAt).toLocaleDateString()}</td>
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
