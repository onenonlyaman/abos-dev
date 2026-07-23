import type { LeadState, PurchaseOrderStatus, TaskStatus, VehicleStatus } from './types';

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  source: string;
  state: LeadState;
  lostReason?: string | null;
}

export interface Vendor {
  id: string;
  name: string;
  gstin: string;
  qualityScore: string;
}

export interface PurchaseOrderLine {
  id: string;
  skuId: string;
  quantity: string;
  actualCost: string;
  actualUnitCost: string;
  deviationFlagged: boolean;
}

export interface PurchaseOrder {
  id: string;
  vendorId: string;
  vendor?: Vendor;
  projectId: string;
  status: PurchaseOrderStatus;
  lines: PurchaseOrderLine[];
  createdAt: string;
}

export interface Sku {
  id: string;
  projectId: string;
  code: string;
  name: string;
  uom: string;
  formula?: string | null;
  currentStock: string;
  safetyStock: string;
}

export interface BudgetLine {
  id: string;
  projectId: string;
  skuId: string;
  sku?: Sku;
  allocatedCap: string;
  expectedQty: string;
  consumedAmount: string;
  consumedPct: number;
  alertLevel: 'ok' | 'warning' | 'breach';
}

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  assigneeId: string;
  assignee?: { name: string };
  assignerId: string;
  targetDeadline: string;
  status: TaskStatus;
  closedEarly: boolean;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface Vehicle {
  id: string;
  name: string;
  plateNumber: string;
  status: VehicleStatus;
}
