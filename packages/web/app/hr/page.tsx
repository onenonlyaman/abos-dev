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
import { IdCard, Clock, Calendar, DollarSign, PlusCircle, Briefcase } from 'lucide-react';

interface Attendance {
  id: string;
  employee?: { name: string };
  checkIn: string;
  status: string;
}

interface Leave {
  id: string;
  employee?: { name: string };
  leaveType: string;
  startDate: string;
  endDate: string;
  status: string;
}

interface Payroll {
  id: string;
  employee?: { name: string };
  monthYear: string;
  basicSalary: number;
  allowances: number;
  deductions: number;
  netPayable: number;
}

interface JobPosting {
  id: string;
  title: string;
  department: string;
  location: string;
  status: string;
}

export default function HrPage() {
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [err, setErr] = useState<string | null>(null);

  // Form states
  const [jobTitle, setJobTitle] = useState('');
  const [department, setDepartment] = useState('Construction');

  const [basicSal, setBasicSal] = useState('');
  const [allowances, setAllowances] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const [att, lve, pay, jbs] = await Promise.all([
        api.get<Attendance[]>('/payroll/attendance'),
        api.get<Leave[]>('/payroll/leaves'),
        api.get<Payroll[]>('/payroll/disbursals'),
        api.get<JobPosting[]>('/payroll/jobs'),
      ]);
      setAttendances(att);
      setLeaves(lve);
      setPayrolls(pay);
      setJobs(jbs);
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : 'Failed to load HR payroll data');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreateJob = async () => {
    if (!jobTitle) return;
    setBusy(true);
    try {
      await api.post('/payroll/jobs', { title: jobTitle, department });
      setJobTitle('');
      await load();
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : 'Failed to post job');
    } finally {
      setBusy(false);
    }
  };

  const handleCreatePayroll = async () => {
    if (!basicSal) return;
    setBusy(true);
    try {
      await api.post('/payroll/disbursals', {
        basicSalary: Number(basicSal) || 50000,
        allowances: Number(allowances) || 15000,
      });
      setBasicSal('');
      setAllowances('');
      await load();
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : 'Failed to process payroll');
    } finally {
      setBusy(false);
    }
  };

  const totalPayrollOutflow = payrolls.reduce((acc, p) => acc + Number(p.netPayable), 0);

  return (
    <div className="space-y-7">
      <PageHeader
        title="HR, Attendance & Payroll Self-Service Suite"
        description="Employee attendance clock-ins, leave approvals, TDS/PF payslip processing, and ATS recruitment pipelines."
      />

      {err && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl">{err}</div>}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat icon={Clock} tone="brand" value={String(attendances.length)} label="Clock-In Logs" sub="Biometric attendance" />
        <Stat icon={Calendar} tone="amber" value={String(leaves.length)} label="Leave Requests" sub="Pending approvals" />
        <Stat icon={DollarSign} tone="green" value={`₹ ${totalPayrollOutflow.toLocaleString()}`} label="Monthly Net Payroll" sub="Disbursed Salary" />
        <Stat icon={Briefcase} tone="blue" value={String(jobs.length)} label="Open Job Postings" sub="ATS Recruitment" />
      </div>

      {/* Action Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Disclosure title="Process Monthly Employee Payslip (TDS / PF Deductions)">
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Basic Salary (₹)" type="number" placeholder="60000" value={basicSal} onChange={(e) => setBasicSal(e.target.value)} />
              <Field label="HRA & Allowances (₹)" type="number" placeholder="20000" value={allowances} onChange={(e) => setAllowances(e.target.value)} />
            </div>
            <Button size="sm" className="w-full" disabled={busy || !basicSal} onClick={handleCreatePayroll}>
              <PlusCircle className="w-3.5 h-3.5 mr-1.5" /> Disburse Payslip
            </Button>
          </div>
        </Disclosure>

        <Disclosure title="Create ATS Job Opening">
          <div className="space-y-3">
            <Field label="Job Position Title" placeholder="e.g. Senior Structural Engineer" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} />
            <Field label="Department" value={department} onChange={(e) => setDepartment(e.target.value)} />
            <Button size="sm" className="w-full" disabled={busy || !jobTitle} onClick={handleCreateJob}>
              <PlusCircle className="w-3.5 h-3.5 mr-1.5" /> Publish Job Posting
            </Button>
          </div>
        </Disclosure>
      </div>

      {/* Payroll Disbursal History */}
      <Card>
        <CardHeader title="Processed Payroll Disbursals" description="Net payable calculated after 10% TDS & 12% PF statutory deductions" />
        <CardBody className="p-0 overflow-x-auto">
          {payrolls.length === 0 ? (
            <div className="p-5 text-center text-xs text-zinc-500">No payroll disbursals recorded.</div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-950 text-zinc-400 uppercase border-b border-zinc-800">
                <tr>
                  <th className="p-3.5">Employee</th>
                  <th className="p-3.5">Month</th>
                  <th className="p-3.5">Basic</th>
                  <th className="p-3.5">Allowances</th>
                  <th className="p-3.5">Deductions (TDS/PF)</th>
                  <th className="p-3.5">Net Payable</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 text-zinc-200">
                {payrolls.map((p) => (
                  <tr key={p.id} className="hover:bg-zinc-900/60 transition">
                    <td className="p-3.5 font-medium text-zinc-100">{p.employee?.name ?? 'Staff Member'}</td>
                    <td className="p-3.5 font-mono text-zinc-400">{p.monthYear}</td>
                    <td className="p-3.5 font-mono">₹ {Number(p.basicSalary).toLocaleString()}</td>
                    <td className="p-3.5 font-mono">₹ {Number(p.allowances).toLocaleString()}</td>
                    <td className="p-3.5 font-mono text-red-400">₹ {Number(p.deductions).toLocaleString()}</td>
                    <td className="p-3.5 font-mono font-semibold text-emerald-400">₹ {Number(p.netPayable).toLocaleString()}</td>
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
