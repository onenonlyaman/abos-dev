# Avenue Builders Operating System (ABOS): Deliverables Pack 5

## 14. User Manuals & Operator Guides

### Executive & Owner Manual
1. **Accessing Owner Command Center**: Log into ABOS and navigate to `/`. The dashboard presents 60-second business visibility across Revenue, Cash Position, Construction Health, and AI Risk Summaries.
2. **Global Command Palette (`⌘ + K`)**: Press `⌘ + K` (or `Ctrl + K`) from any screen to instantly search modules, switch workspaces, or trigger AI queries.
3. **Reviewing AI Insights**: Click *"Ask Copilot"* or navigate to `/copilot` to ask natural language questions regarding project delays or cash flow.

### Site Engineer & Field Staff Manual
1. **Submitting DPR**: Navigate to `/construction` -> Daily Progress Reports (DPR).
2. **Logging Labour Headcount**: Input masons, carpenters, and steel fixers headcount alongside site photos.
3. **Quality & Snag Rectification**: Navigate to `/quality` to review assigned defects and mark rectifications as closed.

---

## 15. API Integration & Database Migration Strategy

### Tally & ERP Ledger Integration
* **Voucher Export**: ABOS FinOS automatically formats cleared invoices into Tally XML format for seamless accounting sync.
* **Database Migrations**: Managed via Prisma Migration scripts (`npx prisma migrate dev`).

---

## 16. Future Scalability Roadmap

### Scalability Milestones
* **Phase A**: Full Multi-Tenant SaaS organization isolation with custom domain routing.
* **Phase B**: Drone photography integration for automated AI construction site progress estimation.
* **Phase C**: WhatsApp Business Conversational AI bot for automated lead qualification and payment reminders.
