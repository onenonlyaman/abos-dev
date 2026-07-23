'use client';

import React, { useState } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShieldAlert, Users, CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function WorkspacesPage() {
  const [activeRole, setActiveRole] = useState('Owner');

  const roles = [
    { name: 'Owner', group: 'Executive', desc: 'Complete 60-second business visibility across all 18 modules.', primaryPath: '/' },
    { name: 'Managing Director', group: 'Executive', desc: 'P&L tracking, land bank expansion, and capital allocation.', primaryPath: '/' },
    { name: 'CEO', group: 'Executive', desc: 'Overall operational performance and executive strategy.', primaryPath: '/' },
    { name: 'Director', group: 'Executive', desc: 'Board governance and high-level risk management.', primaryPath: '/' },
    
    { name: 'Sales Head', group: 'Sales & CRM', desc: 'Sales target tracking, pipeline forecasts, and broker commissions.', primaryPath: '/leads' },
    { name: 'Sales Manager', group: 'Sales & CRM', desc: 'Lead assignment, team quotas, and customer negotiation approval.', primaryPath: '/leads' },
    { name: 'Sales Executive', group: 'Sales & CRM', desc: 'Daily customer calls, site visits, and booking generation.', primaryPath: '/booking' },
    { name: 'CRM Executive', group: 'Sales & CRM', desc: 'Customer onboarding, payment milestone collection, and agreement signatures.', primaryPath: '/booking' },
    
    { name: 'Construction Head', group: 'Construction & Site', desc: 'Multi-project Gantt schedules, milestone delivery, and contractor oversight.', primaryPath: '/construction' },
    { name: 'Project Manager', group: 'Construction & Site', desc: 'Site DPR verification, daily labour counts, and delay analysis.', primaryPath: '/construction' },
    { name: 'Site Engineer', group: 'Construction & Site', desc: 'Daily Progress Report (DPR) submission and material consumption logging.', primaryPath: '/construction' },
    { name: 'Quality Engineer', group: 'Construction & Site', desc: 'Inspection checklists, defect snag logging, and contractor rectifications.', primaryPath: '/quality' },

    { name: 'Procurement Team', group: 'Supply Chain', desc: 'Vendor RFQ comparisons, Purchase Orders, and price negotiation.', primaryPath: '/procurement' },
    { name: 'Warehouse Manager', group: 'Supply Chain', desc: 'Multiple godown stock levels, material issue slips, and SKU reorder alerts.', primaryPath: '/inventory' },
    { name: 'Inventory Team', group: 'Supply Chain', desc: 'Goods Receipt Notes (GRN) verification and batch code tracking.', primaryPath: '/inventory' },

    { name: 'Finance Team', group: 'FinOS & Treasury', desc: 'Budgets, GST filing, double-entry ledgers, and cash flow projections.', primaryPath: '/finos' },
    { name: 'Accounts Team', group: 'FinOS & Treasury', desc: 'Vendor bill processing, customer receipts, and voucher entries.', primaryPath: '/finos' },
    { name: 'Collections Team', group: 'FinOS & Treasury', desc: 'Debtor aging schedules and customer payment reminder triggers.', primaryPath: '/finos' },

    { name: 'HR Head', group: 'People & Legal', desc: 'Employee attendance, payroll processing, and hiring pipeline.', primaryPath: '/hr' },
    { name: 'Legal Head', group: 'People & Legal', desc: 'RERA filings, land title deeds, and contract agreements.', primaryPath: '/legal' },
    { name: 'Documentation Team', group: 'People & Legal', desc: 'Agreement drafting, stamp duty execution, and customer document vault.', primaryPath: '/legal' },

    { name: 'Channel Partner', group: 'External Portal', desc: 'Broker lead registration, commission tracking, and inventory availability.', primaryPath: '/leads' },
    { name: 'Customer', group: 'External Portal', desc: 'Construction progress photos, payment milestone status, and possession tracker.', primaryPath: '/booking' },
    { name: 'Super Admin', group: 'Administration', desc: 'Full RBAC permission management, audit logs, and system settings.', primaryPath: '/' },
  ];

  const activeRoleData = roles.find((r) => r.name === activeRole) || roles[0];

  return (
    <div className="space-y-7">
      <PageHeader
        title="Role-Based Workspaces (24 Dedicated Roles)"
        description="Switch user personas to view role-tailored dashboards, KPIs, navigation, and permission boundaries."
      />

      <Card>
        <CardHeader
          title="Role Switcher & Persona Workspace"
          description="Select any role persona to preview custom dashboard scope"
        />
        <CardBody className="space-y-6">
          {/* Active Workspace Banner */}
          <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <Badge tone="blue">{activeRoleData.group}</Badge>
                <span className="text-xs text-emerald-400 flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Workspace Active</span>
                </span>
              </div>
              <h3 className="text-lg font-bold text-zinc-100">{activeRoleData.name} Workspace</h3>
              <p className="text-xs text-zinc-400">{activeRoleData.desc}</p>
            </div>
            <Link
              href={activeRoleData.primaryPath}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition shrink-0"
            >
              <span>Launch Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* 24 Roles Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {roles.map((r, idx) => (
              <button
                key={idx}
                onClick={() => setActiveRole(r.name)}
                className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between space-y-2 ${
                  activeRole === r.name
                    ? 'bg-indigo-600/10 border-indigo-500/50 text-zinc-100 shadow-md'
                    : 'bg-zinc-900/60 border-zinc-800/80 text-zinc-300 hover:bg-zinc-800/60'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-semibold text-xs text-zinc-100">{r.name}</span>
                  <span className="text-[10px] text-zinc-500 font-mono">{r.group}</span>
                </div>
                <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">{r.desc}</p>
              </button>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
