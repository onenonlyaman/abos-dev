export type UnitStatus = 'available' | 'held' | 'booked';
export type BookingState = 'draft' | 'payment_pending' | 'confirmed' | 'agreement_signed' | 'cancelled';
export type PaymentStatus = 'pending' | 'cleared' | 'failed' | 'refunded';
export type LeadState =
  | 'new'
  | 'contacted'
  | 'qualified'
  | 'site_visit_scheduled'
  | 'site_visit_done'
  | 'negotiation'
  | 'booked'
  | 'lost';
export type TaskStatus = 'open' | 'in_progress' | 'in_qa' | 'closed';
export type PurchaseOrderStatus =
  | 'draft'
  | 'pending_approval'
  | 'approved'
  | 'rejected'
  | 'grn_received'
  | 'invoiced';
export type VehicleStatus = 'active' | 'maintenance' | 'decommissioned';

export interface Spv {
  id: string;
  name: string;
  legalName: string;
  gstin: string;
}

export interface Project {
  id: string;
  spvId: string;
  name: string;
  code: string;
  city: string;
}

export interface Unit {
  id: string;
  projectId: string;
  project?: Project;
  code: string;
  floor: number;
  areaSqft: string;
  baseRate: string;
  status: UnitStatus;
}

export interface Payment {
  id: string;
  bookingId: string;
  amount: string;
  status: PaymentStatus;
  method: string;
  reference?: string | null;
  clearedAt?: string | null;
}

export interface Booking {
  id: string;
  unitId: string;
  unit?: Unit;
  customerName: string;
  customerPhone: string;
  state: BookingState;
  holdExpiresAt?: string | null;
  agreementSignedAt?: string | null;
  cancelledAt?: string | null;
  cancelReason?: string | null;
  payments?: Payment[];
  createdAt: string;
}
