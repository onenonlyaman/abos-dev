import Link from 'next/link';
import {
  Building2,
  KeyRound,
  Users,
  Wallet,
  Hammer,
  Shield,
  Sparkles,
  ArrowRight,
  AlertTriangle,
  TrendingUp,
  Landmark,
  CheckSquare,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Stat } from '@/components/ui/stat';
import { Badge } from '@/components/ui/badge';

export default function OwnerCommandCenterPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Owner Command Center"
        description="Unified 60-second executive visibility across Avenue Builders Operating System (ABOS)."
      />

      {/* AI Executive Summary Banner */}
      <div className="relative overflow-hidden rounded-md bg-surface-2 border border-line p-5 shadow-card">
        <div className="flex items-start justify-between">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-3.5 h-3.5 text-ink" />
              <span className="text-xs font-bold uppercase tracking-wider text-ink">
                AI Executive Intelligence
              </span>
              <Badge tone="neutral">Updated 1 min ago</Badge>
            </div>
            <h2 className="text-sm font-bold text-ink">
              Operations Nominal: Revenue target pacing +14% over Q3 baseline. Steel BOQ variance flagged in Tower B.
            </h2>
            <p className="text-xs text-ink-2 leading-relaxed">
              Collections on Avenue Heights stand at ₹ 4.2 Cr with zero overdue RERA non-compliance flags. Tower B slab casting is 4 days behind target schedule; recommended action: reallocate site labour shifts.
            </p>
          </div>
          <Link
            href="/copilot"
            className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider bg-brand text-brand-ink rounded-md hover:opacity-90 transition border border-brand"
          >
            <span>Ask Copilot</span>
            <ArrowRight className="w-3.5 h-3.5 text-brand-ink" />
          </Link>
        </div>
      </div>

      {/* 60-Second Business KPIs Grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat
          icon={TrendingUp}
          tone="green"
          value="₹ 48.5 Cr"
          label="Total Revenue"
          sub="+14.2% YoY · Booked units"
        />
        <Stat
          icon={Landmark}
          tone="brand"
          value="₹ 12.8 Cr"
          label="Net Cash Position"
          sub="3 Bank Accounts · ₹ 4.2Cr Receivables"
        />
        <Stat
          icon={Hammer}
          tone="amber"
          value="78.4%"
          label="Construction Health"
          sub="2 Towers active · 1 variance flag"
        />
        <Stat
          icon={Users}
          tone="blue"
          value="142"
          label="Active Sales Pipeline"
          sub="28 Site visits scheduled this week"
        />
      </div>

      {/* Financial & Operational Risk Matrix */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Critical Alerts & Pending Approvals */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="Critical Risk Alerts & Approvals"
            description="Real-time operational exceptions requiring executive attention"
            actions={
              <Link href="/tasks" className="text-xs text-ink-2 hover:text-ink font-semibold uppercase tracking-wider">
                Manage all
              </Link>
            }
          />
          <CardBody className="space-y-3">
            <div className="p-3.5 rounded-md bg-surface-2 border border-line flex items-start space-x-3">
              <AlertTriangle className="w-4 h-4 text-ink shrink-0 mt-0.5" />
              <div className="flex-1 text-xs">
                <div className="font-bold text-ink uppercase tracking-wider">BOQ Price Deviation: Steel FE550</div>
                <div className="text-ink-2 mt-0.5">
                  Actual unit quote ₹ 62,500/MT exceeds BOQ estimated cap of ₹ 60,000/MT by 4.16%.
                </div>
              </div>
              <Badge tone="amber">BOQ Alert</Badge>
            </div>

            <div className="p-3.5 rounded-md bg-surface-2 border border-line flex items-start space-x-3">
              <AlertTriangle className="w-4 h-4 text-ink shrink-0 mt-0.5" />
              <div className="flex-1 text-xs">
                <div className="font-bold text-ink uppercase tracking-wider">Schedule Slippage: Tower B Floor 8 Slab</div>
                <div className="text-ink-2 mt-0.5">
                  Target completion date lag detected. Impact prediction: 4 days delay on overall milestone.
                </div>
              </div>
              <Badge tone="red">Critical Risk</Badge>
            </div>

            <div className="p-3.5 rounded-md bg-surface-2 border border-line flex items-start space-x-3">
              <CheckSquare className="w-4 h-4 text-ink shrink-0 mt-0.5" />
              <div className="flex-1 text-xs">
                <div className="font-bold text-ink uppercase tracking-wider">Pending High-Value PO Approval</div>
                <div className="text-ink-2 mt-0.5">
                  Purchase Order #PO-2026-881 for Cement Bagging (₹ 24,50,000) requires CFO signature.
                </div>
              </div>
              <Badge tone="blue">Approval</Badge>
            </div>
          </CardBody>
        </Card>

        {/* Quick Access Module Hub */}
        <Card>
          <CardHeader title="ABOS Module Matrix" description="Direct access to enterprise departments" />
          <CardBody className="p-2 space-y-1">
            {[
              { label: 'Construction Management', path: '/construction', icon: Hammer },
              { label: 'BOQ & Costing', path: '/boq', icon: Building2 },
              { label: 'FinOS & Banking', path: '/finos', icon: Landmark },
              { label: 'Quality & Snagging', path: '/quality', icon: CheckSquare },
              { label: 'Legal & RERA', path: '/legal', icon: Shield },
              { label: 'Sales CRM & Bookings', path: '/booking', icon: KeyRound },
              { label: '24 Role Workspaces', path: '/workspaces', icon: Wallet },
            ].map((m, idx) => {
              const Icon = m.icon;
              return (
                <Link
                  key={idx}
                  href={m.path}
                  className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-surface-2 text-ink text-xs transition group border border-transparent hover:border-line"
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon className="w-3.5 h-3.5 text-ink-3 group-hover:text-ink transition" />
                    <span className="font-semibold uppercase tracking-wider text-xs text-ink">{m.label}</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-ink-3 group-hover:text-ink transition" />
                </Link>
              );
            })}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
