import {
  Building2,
  KeyRound,
  Users,
  Truck,
  Warehouse,
  Wallet,
  ListChecks,
  IdCard,
  LayoutGrid,
  Hammer,
  FileText,
  CheckSquare,
  Landmark,
  Shield,
  Sparkles,
  ShieldAlert,
  MessageSquare,
  FileCheck,
  UserCheck,
  PackageCheck,
  BookOpen,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export interface NavGroup {
  label?: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    items: [
      { href: '/', label: 'Owner Command Center', icon: LayoutGrid },
      { href: '/copilot', label: 'AI Control Tower & Copilot', icon: Sparkles },
      { href: '/workspaces', label: '24 Role Workspaces', icon: ShieldAlert },
    ],
  },
  {
    label: 'Real Estate & Sales',
    items: [
      { href: '/booking', label: 'Booking & Units', icon: KeyRound },
      { href: '/leads', label: 'Sales CRM', icon: Users },
      { href: '/communication', label: 'Communication & WhatsApp', icon: MessageSquare },
    ],
  },
  {
    label: 'Construction & Field',
    items: [
      { href: '/construction', label: 'Construction Management', icon: Hammer },
      { href: '/boq', label: 'BOQ Management', icon: FileText },
      { href: '/quality', label: 'Quality & Snagging', icon: CheckSquare },
    ],
  },
  {
    label: 'Supply Chain',
    items: [
      { href: '/procurement', label: 'Procurement & RFQs', icon: Building2 },
      { href: '/inventory', label: 'Inventory & Godowns', icon: Warehouse },
    ],
  },
  {
    label: 'FinOS & Accounting',
    items: [
      { href: '/accounting', label: 'Accounting & GST Engine', icon: Landmark },
      { href: '/finos', label: 'Banking & Treasury', icon: Wallet },
      { href: '/finance', label: 'Budget & Costing', icon: FileText },
    ],
  },
  {
    label: 'Enterprise Portals',
    items: [
      { href: '/portal/customer', label: 'Customer Homebuyer Portal', icon: UserCheck },
      { href: '/portal/vendor', label: 'Vendor Supplier Portal', icon: PackageCheck },
      { href: '/portal/partner', label: 'Broker Partner Portal', icon: Users },
    ],
  },
  {
    label: 'Governance & Assets',
    items: [
      { href: '/legal', label: 'Legal & RERA Compliance', icon: Shield },
      { href: '/documents', label: 'Document & Drawing Vault', icon: FileCheck },
      { href: '/knowledge', label: 'Knowledge Base Wiki', icon: BookOpen },
      { href: '/tasks', label: 'Tasks & Workflows', icon: ListChecks },
      { href: '/hr', label: 'HR & Payroll', icon: IdCard },
      { href: '/fleet', label: 'Fleet & Equipment', icon: Truck },
    ],
  },
];

export const NAV: NavItem[] = NAV_GROUPS.flatMap((g) => g.items);

export function navItemForPath(pathname: string): NavItem | undefined {
  if (pathname === '/') return NAV[0];
  return NAV.find((item) => item.href !== '/' && pathname.startsWith(item.href));
}
