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
import { Hammer, Calendar, Camera, Clock, PlusCircle } from 'lucide-react';

interface Milestone {
  id: string;
  title: string;
  completionPct: number;
  status: string;
}

interface GanttTask {
  id: string;
  taskName: string;
  progress: number;
  startDate: string;
  endDate: string;
}

interface DPR {
  id: string;
  workDone: string;
  labourCount: number;
  weather?: string;
  date: string;
  reporter?: { name: string };
}

export default function ConstructionPage() {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [ganttTasks, setGanttTasks] = useState<GanttTask[]>([]);
  const [dprs, setDprs] = useState<DPR[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // Form states
  const [dprWork, setDprWork] = useState('');
  const [dprLabour, setDprLabour] = useState('');
  const [dprWeather, setDprWeather] = useState('Clear (30°C)');

  const [taskName, setTaskName] = useState('');
  const [taskProgress, setTaskProgress] = useState('0');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const [m, g, d] = await Promise.all([
        api.get<Milestone[]>('/construction/milestones'),
        api.get<GanttTask[]>('/construction/gantt'),
        api.get<DPR[]>('/construction/dpr'),
      ]);
      setMilestones(m);
      setGanttTasks(g);
      setDprs(d);
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : 'Failed to load construction data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreateDpr = async () => {
    if (!dprWork) return;
    setBusy(true);
    try {
      await api.post('/construction/dpr', {
        workDone: dprWork,
        labourCount: Number(dprLabour) || 0,
        weather: dprWeather,
      });
      setDprWork('');
      setDprLabour('');
      await load();
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : 'Failed to submit DPR');
    } finally {
      setBusy(false);
    }
  };

  const handleCreateTask = async () => {
    if (!taskName) return;
    setBusy(true);
    try {
      await api.post('/construction/gantt', {
        taskName,
        progress: Number(taskProgress) || 0,
      });
      setTaskName('');
      setTaskProgress('0');
      await load();
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : 'Failed to add Gantt task');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-7">
      <PageHeader
        title="Construction Management & Site Operations"
        description="Gantt chart milestones, Daily Progress Reports (DPR), equipment utilization, and site updates."
      />

      {err && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl">{err}</div>}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat
          icon={Hammer}
          tone="brand"
          value={ganttTasks.length ? `${Math.round(ganttTasks.reduce((a, b) => a + Number(b.progress), 0) / ganttTasks.length)}%` : '0%'}
          label="Overall Progress"
          sub={ganttTasks.length ? `${ganttTasks.length} Gantt tasks` : 'No tasks in database'}
        />
        <Stat icon={Calendar} tone="blue" value={String(milestones.length)} label="Milestones" sub="Recorded in database" />
        <Stat icon={Clock} tone="amber" value={String(ganttTasks.filter(t => Number(t.progress) < 100).length)} label="Active Tasks" sub="In progress" />
        <Stat icon={Camera} tone="green" value={String(dprs.length)} label="DPR Submissions" sub="Field site logs" />
      </div>

      {/* Action Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Disclosure title="Submit Daily Progress Report (DPR)">
          <div className="space-y-3">
            <Field label="Work Done Summary" placeholder="e.g. Completed Floor 6 slab rebar tying..." value={dprWork} onChange={(e) => setDprWork(e.target.value)} />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Labour Count" type="number" placeholder="42" value={dprLabour} onChange={(e) => setDprLabour(e.target.value)} />
              <Field label="Weather" value={dprWeather} onChange={(e) => setDprWeather(e.target.value)} />
            </div>
            <Button size="sm" className="w-full" disabled={busy || !dprWork} onClick={handleCreateDpr}>
              <PlusCircle className="w-3.5 h-3.5 mr-1.5" /> Submit DPR
            </Button>
          </div>
        </Disclosure>

        <Disclosure title="Add New Gantt Task">
          <div className="space-y-3">
            <Field label="Task Name" placeholder="e.g. Structural Column Concrete Casting" value={taskName} onChange={(e) => setTaskName(e.target.value)} />
            <Field label="Initial Progress (%)" type="number" value={taskProgress} onChange={(e) => setTaskProgress(e.target.value)} />
            <Button size="sm" className="w-full" disabled={busy || !taskName} onClick={handleCreateTask}>
              <PlusCircle className="w-3.5 h-3.5 mr-1.5" /> Add Task
            </Button>
          </div>
        </Disclosure>
      </div>

      {/* Gantt Milestones */}
      <Card>
        <CardHeader title="Project Gantt & Milestone Timeline" description="Real-time schedule tracking from database" />
        <CardBody className="space-y-4">
          {ganttTasks.length === 0 ? (
            <EmptyState icon={Hammer} title="No construction tasks found" description="Add a new Gantt task above." />
          ) : (
            <div className="divide-y divide-zinc-800/80">
              {ganttTasks.map((t) => (
                <div key={t.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <span className="font-semibold text-sm text-zinc-100">{t.taskName}</span>
                    <div className="text-xs text-zinc-400 flex items-center space-x-2">
                      <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                      <span>{new Date(t.startDate).toLocaleDateString()} - {new Date(t.endDate).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="w-36 bg-zinc-800 rounded-full h-2 overflow-hidden">
                      <div className="h-full rounded-full bg-indigo-500" style={{ width: `${t.progress}%` }} />
                    </div>
                    <span className="text-xs font-mono font-semibold text-zinc-300 w-10 text-right">{t.progress}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Daily Progress Reports (DPR) */}
      <Card>
        <CardHeader title="Daily Progress Reports (DPR)" description="Field updates submitted by site engineers" />
        <CardBody className="space-y-4">
          {dprs.length === 0 ? (
            <EmptyState icon={Calendar} title="No DPRs submitted" description="Submit today's DPR using the action panel above." />
          ) : (
            <div className="space-y-3">
              {dprs.map((dpr) => (
                <div key={dpr.id} className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-zinc-200">{dpr.reporter?.name ?? 'Site Engineer'}</span>
                    <span className="text-xs text-zinc-400">{new Date(dpr.date).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed">{dpr.workDone}</p>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
