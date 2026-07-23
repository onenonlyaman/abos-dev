'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Stat } from '@/components/ui/stat';
import { EmptyState } from '@/components/ui/empty-state';
import { api, ApiError } from '@/lib/api';
import { Building2, FileCheck, PackageCheck } from 'lucide-react';

interface PurchaseOrder {
  id: string;
  status: string;
  vendor?: { name: string };
  project?: { name: string };
  lines?: { quantity: number; actualCost: number; sku?: { name: string } }[];
}

interface GRN {
  id: string;
  grnNumber: string;
  poNumber: string;
  vendorName: string;
  receivedItems: string;
  receivedAt: string;
}

export default function VendorPortalPage() {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [grns, setGrns] = useState<GRN[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await api.get<{ purchaseOrders: PurchaseOrder[]; grns: GRN[] }>('/portals/vendor');
      setPurchaseOrders(data.purchaseOrders || []);
      setGrns(data.grns || []);
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : 'Failed to load Vendor Portal');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-7">
      <PageHeader
        title="Supplier & Vendor Self-Service Portal"
        description="External portal for suppliers: Review active Purchase Orders, track GRNs, and upload bills."
      />

      {err && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl">{err}</div>}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat icon={Building2} tone="brand" value={String(purchaseOrders.length)} label="Issued POs" sub="Active Purchase Orders" />
        <Stat icon={PackageCheck} tone="green" value={String(grns.length)} label="Goods Receipt Notes" sub="Verified Site Deliveries" />
        <Stat icon={FileCheck} tone="blue" value="100%" label="Vendor Rating" sub="Performance Verified" />
        <Stat icon={Building2} tone="amber" value="Active" label="Portal Access" sub="Real-time status" />
      </div>

      <Card>
        <CardHeader title="Purchase Orders Issued to Your Firm" description="Order details, quantities, and status" />
        <CardBody className="p-0 overflow-x-auto">
          {purchaseOrders.length === 0 ? (
            <div className="p-5">
              <EmptyState icon={Building2} title="No Purchase Orders issued" description="Purchase Orders assigned to your vendor account will appear here." />
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-950 text-zinc-400 uppercase border-b border-zinc-800">
                <tr>
                  <th className="p-3.5">PO ID</th>
                  <th className="p-3.5">Vendor</th>
                  <th className="p-3.5">Project</th>
                  <th className="p-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 text-zinc-200">
                {purchaseOrders.map((po) => (
                  <tr key={po.id} className="hover:bg-zinc-900/60 transition">
                    <td className="p-3.5 font-mono font-semibold text-zinc-300">{po.id.slice(0, 8)}...</td>
                    <td className="p-3.5 font-medium text-zinc-100">{po.vendor?.name ?? 'Supplier'}</td>
                    <td className="p-3.5 text-zinc-400">{po.project?.name ?? 'Avenue Heights'}</td>
                    <td className="p-3.5"><Badge tone="blue">{po.status}</Badge></td>
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
