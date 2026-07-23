# Avenue Builders Operating System (ABOS): Deliverables Pack 3

## 8. UI/UX Design System Specification

### Design Philosophy
Inspired by **Apple macOS**, **Linear**, **Notion**, **Stripe Dashboard**, **Arc Browser**, and **Bloomberg Terminal**.
* **Palette**: Dark Mode default (Zinc-950 `#09090b`, Zinc-900 `#18181b`, Indigo Accent `#4f46e5`).
* **Glassmorphism**: Soft background blur (`backdrop-blur-md`), subtle 1px border highlights (`border-zinc-800`), and dark floating panels.
* **Typography**: Sans-serif, high-density tabular numerical data (`font-mono`), crisp micro-badges.
* **Keyboard-First**: Global Command Palette (`⌘ + K`) modal for instant navigation, quick action triggering, and AI queries.

---

## 9. Screen Wireframes & Component Architecture

### Layout Hierarchy
1. **Sidebar Navigation**: Fixed left bar (248px) with grouped modules (Real Estate, Construction, Supply Chain, FinOS, Governance).
2. **Topbar**: Sticky header (56px) featuring breadcrumbs, search shortcut trigger (`⌘ + K`), role switcher, notification drawer, and theme toggle.
3. **Owner Command Center**:
   - Row 1: AI Executive Intelligence banner.
   - Row 2: 4-Column Stat grid (Revenue, Cash Position, Construction Health, Pipeline).
   - Row 3: Split view — Critical Risk Alerts table (2 cols) vs. ABOS Module Matrix (1 col).

---

## 10. Notification Matrix

| Event Trigger | Recipient Role | Channel | Priority | Actionable Payload |
| :--- | :--- | :--- | :--- | :--- |
| **BOQ Price Breach > 2.5%** | Finance Head, Procurement Manager | In-App, WhatsApp | High | View Variance Line & Supplier Quote |
| **Milestone Delay > 48 Hrs** | Project Manager, Construction Head | In-App, Push | Critical | Reallocate Site Labour Crew |
| **Token Payment Cleared** | Sales Executive, CRM Manager | In-App, Email | Medium | Generate Booking Confirmation PDF |
| **PO Approval Required > ₹ 5L** | CFO, Owner | In-App, Push | High | One-Click Digital Approval |
