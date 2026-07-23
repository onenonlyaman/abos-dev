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
import { Truck, Wrench, Fuel, ShieldCheck, PlusCircle } from 'lucide-react';

interface Maintenance {
  id: string;
  assetName: string;
  maintenanceType: string;
  scheduledDate: string;
  status: string;
}

interface FuelLog {
  id: string;
  vehicleName: string;
  fuelLitres: number;
  costAmount: number;
  loggedAt: string;
}

interface AmcContract {
  id: string;
  providerName: string;
  equipmentCovered: string;
  validTo: string;
  annualCost: number;
}

export default function FleetPage() {
  const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
  const [fuelLogs, setFuelLogs] = useState<FuelLog[]>([]);
  const [amcs, setAmcs] = useState<AmcContract[]>([]);
  const [err, setErr] = useState<string | null>(null);

  // Form states
  const [assetName, setAssetName] = useState('');
  const [maintType, setMaintType] = useState('Hydraulic & Brake Inspection');

  const [vehicleName, setVehicleName] = useState('');
  const [fuelLitres, setFuelLitres] = useState('');
  const [fuelCost, setFuelCost] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const [m, f, a] = await Promise.all([
        api.get<Maintenance[]>('/fleet/maintenance'),
        api.get<FuelLog[]>('/fleet/fuel'),
        api.get<AmcContract[]>('/fleet/amc'),
      ]);
      setMaintenances(m);
      setFuelLogs(f);
      setAmcs(a);
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : 'Failed to load fleet maintenance data');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreateMaintenance = async () => {
    if (!assetName) return;
    setBusy(true);
    try {
      await api.post('/fleet/maintenance', {
        assetName,
        maintenanceType: maintType,
      });
      setAssetName('');
      await load();
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : 'Failed to schedule maintenance');
    } finally {
      setBusy(false);
    }
  };

  const handleCreateFuel = async () => {
    if (!vehicleName || !fuelLitres) return;
    setBusy(true);
    try {
      await api.post('/fleet/fuel', {
        vehicleName,
        fuelLitres: Number(fuelLitres) || 0,
        costAmount: Number(fuelCost) || 0,
      });
      setVehicleName('');
      setFuelLitres('');
      setFuelCost('');
      await load();
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : 'Failed to log fuel consumption');
    } finally {
      setBusy(false);
    }
  };

  const totalFuelCost = fuelLogs.reduce((acc, f) => acc + Number(f.costAmount), 0);

  return (
    <div className="space-y-7">
      <PageHeader
        title="Fleet, Machinery & Equipment Maintenance Suite"
        description="Site machinery register, preventive maintenance schedules, diesel fuel logging, and AMC warranty tracking."
      />

      {err && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl">{err}</div>}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat icon={Wrench} tone="brand" value={String(maintenances.length)} label="Maintenance Jobs" sub="Preventive Scheduled" />
        <Stat icon={Fuel} tone="green" value={`₹ ${totalFuelCost.toLocaleString()}`} label="Fuel Expenditure" sub="Diesel Consumption" />
        <Stat icon={ShieldCheck} tone="blue" value={String(amcs.length)} label="AMC Contracts" sub="Annual Maintenance" />
        <Stat icon={Truck} tone="amber" value="100%" label="Fleet Readiness" sub="Operational" />
      </div>

      {/* Action Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Disclosure title="Schedule Preventive Equipment Maintenance">
          <div className="space-y-3">
            <Field label="Equipment / Machine Name" placeholder="e.g. Tower Crane #1 - Site A" value={assetName} onChange={(e) => setAssetName(e.target.value)} />
            <Field label="Maintenance Type" value={maintType} onChange={(e) => setMaintType(e.target.value)} />
            <Button size="sm" className="w-full" disabled={busy || !assetName} onClick={handleCreateMaintenance}>
              <PlusCircle className="w-3.5 h-3.5 mr-1.5" /> Schedule Maintenance
            </Button>
          </div>
        </Disclosure>

        <Disclosure title="Log Diesel Fuel Refill">
          <div className="space-y-3">
            <Field label="Vehicle / Generator Name" placeholder="e.g. JCB Excavator 3DX" value={vehicleName} onChange={(e) => setVehicleName(e.target.value)} />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Fuel Volume (Litres)" type="number" placeholder="60" value={fuelLitres} onChange={(e) => setFuelLitres(e.target.value)} />
              <Field label="Total Cost (₹)" type="number" placeholder="5400" value={fuelCost} onChange={(e) => setFuelCost(e.target.value)} />
            </div>
            <Button size="sm" className="w-full" disabled={busy || !vehicleName || !fuelLitres} onClick={handleCreateFuel}>
              <PlusCircle className="w-3.5 h-3.5 mr-1.5" /> Record Fuel Refill
            </Button>
          </div>
        </Disclosure>
      </div>

      {/* Maintenance Schedules Table */}
      <Card>
        <CardHeader title="Preventive Maintenance Calendar" description="Upcoming inspections and servicing jobs" />
        <CardBody className="p-0 overflow-x-auto">
          {maintenances.length === 0 ? (
            <div className="p-5 text-center text-xs text-zinc-500">No maintenance jobs scheduled.</div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-950 text-zinc-400 uppercase border-b border-zinc-800">
                <tr>
                  <th className="p-3.5">Asset</th>
                  <th className="p-3.5">Inspection Type</th>
                  <th className="p-3.5">Scheduled Date</th>
                  <th className="p-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 text-zinc-200">
                {maintenances.map((m) => (
                  <tr key={m.id} className="hover:bg-zinc-900/60 transition">
                    <td className="p-3.5 font-medium text-zinc-100">{m.assetName}</td>
                    <td className="p-3.5 text-zinc-400">{m.maintenanceType}</td>
                    <td className="p-3.5 font-mono text-zinc-300">{new Date(m.scheduledDate).toLocaleDateString()}</td>
                    <td className="p-3.5"><Badge tone="amber">{m.status}</Badge></td>
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
