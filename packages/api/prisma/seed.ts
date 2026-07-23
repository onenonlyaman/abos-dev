import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Wiping existing data for fresh seed...');
  await prisma.knowledgeArticle.deleteMany();
  await prisma.amcContract.deleteMany();
  await prisma.fuelLog.deleteMany();
  await prisma.maintenanceSchedule.deleteMany();
  await prisma.digitalSignatureLog.deleteMany();
  await prisma.ocrExtractLog.deleteMany();
  await prisma.architecturalDrawing.deleteMany();
  await prisma.brokerCommission.deleteMany();
  await prisma.customerFeedback.deleteMany();
  await prisma.supportTicket.deleteMany();
  await prisma.stockAudit.deleteMany();
  await prisma.materialIssueSlip.deleteMany();
  await prisma.stockTransfer.deleteMany();
  await prisma.godown.deleteMany();
  await prisma.goodsReceiptNote.deleteMany();
  await prisma.vendorQuote.deleteMany();
  await prisma.rfq.deleteMany();
  await prisma.purchaseRequisition.deleteMany();
  await prisma.callLog.deleteMany();
  await prisma.smsLog.deleteMany();
  await prisma.whatsAppLog.deleteMany();
  await prisma.communicationCampaign.deleteMany();
  await prisma.performanceReview.deleteMany();
  await prisma.jobPosting.deleteMany();
  await prisma.payrollDisbursal.deleteMany();
  await prisma.leaveRequest.deleteMany();
  await prisma.attendanceRecord.deleteMany();
  await prisma.fixedAsset.deleteMany();
  await prisma.journalEntry.deleteMany();
  await prisma.debitNote.deleteMany();
  await prisma.creditNote.deleteMany();
  await prisma.invoiceItem.deleteMany();
  await prisma.gstInvoice.deleteMany();
  await prisma.bankTransaction.deleteMany();
  await prisma.bankAccount.deleteMany();
  await prisma.reraApproval.deleteMany();
  await prisma.landRecord.deleteMany();
  await prisma.contractAgreement.deleteMany();
  await prisma.defectSnag.deleteMany();
  await prisma.qualityInspection.deleteMany();
  await prisma.boqItem.deleteMany();
  await prisma.billOfQuantities.deleteMany();
  await prisma.labourRecord.deleteMany();
  await prisma.progressPhoto.deleteMany();
  await prisma.dailyProgressReport.deleteMany();
  await prisma.ganttTask.deleteMany();
  await prisma.milestone.deleteMany();
  await prisma.customerInteraction.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.taskReassignmentLog.deleteMany();
  await prisma.task.deleteMany();
  await prisma.purchaseOrderLine.deleteMany();
  await prisma.purchaseOrder.deleteMany();
  await prisma.budgetLine.deleteMany();
  await prisma.sku.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.unit.deleteMany();
  await prisma.tower.deleteMany();
  await prisma.project.deleteMany();
  await prisma.spv.deleteMany();
  await prisma.vendor.deleteMany();
  await prisma.employee.deleteMany();

  console.log('🌱 Seeding rich enterprise data across all 23 ABOS master modules...');

  // ---------- Employees ----------
  const empManager = await prisma.employee.create({
    data: {
      name: 'Vikramaditya Singhania',
      email: 'vikram@avenuebuilders.com',
      phone: '+91-9820011223',
      role: 'Project Director',
      department: 'Executive Management',
    },
  });

  const empEngineer = await prisma.employee.create({
    data: {
      name: 'Rajesh Kulkarni',
      email: 'rajesh.k@avenuebuilders.com',
      phone: '+91-9876501234',
      role: 'Senior Site Engineer',
      department: 'Construction',
    },
  });

  // ---------- SPV & Projects ----------
  const spv = await prisma.spv.create({
    data: {
      name: 'Avenue Real Estate SPV 1',
      legalName: 'Avenue Builders & Developers Private Limited',
      gstin: '27AAACA1234F1Z5',
      pan: 'AAACA1234F',
    },
  });

  const projectSkyline = await prisma.project.create({
    data: {
      spvId: spv.id,
      name: 'Avenue Heights Tower',
      code: 'AVN-HTS',
      city: 'Mumbai',
      location: 'BKC Bandra Kurla Complex',
      budgetTotal: 150000000.0,
      startDate: new Date('2025-01-15'),
      expectedEndDate: new Date('2027-12-31'),
    },
  });

  const projectPlaza = await prisma.project.create({
    data: {
      spvId: spv.id,
      name: 'Avenue Tech Plaza',
      code: 'AVN-PLZ',
      city: 'Pune',
      location: 'Kharadi IT Park',
      budgetTotal: 85000000.0,
      startDate: new Date('2025-06-01'),
      expectedEndDate: new Date('2028-06-30'),
    },
  });

  // ---------- Towers & Units ----------
  const towerA = await prisma.tower.create({
    data: { projectId: projectSkyline.id, name: 'Tower Alpha', code: 'TWA', floors: 15 },
  });

  const unitData = [
    { code: 'A-101', floor: 1, areaSqft: 1250, baseRate: 14500000, status: 'booked' as const },
    { code: 'A-102', floor: 1, areaSqft: 1250, baseRate: 14500000, status: 'booked' as const },
    { code: 'A-103', floor: 1, areaSqft: 980, baseRate: 11200000, status: 'held' as const },
    { code: 'A-201', floor: 2, areaSqft: 1450, baseRate: 16800000, status: 'available' as const },
    { code: 'A-202', floor: 2, areaSqft: 1450, baseRate: 16800000, status: 'held' as const },
    { code: 'A-301', floor: 3, areaSqft: 1650, baseRate: 19500000, status: 'available' as const },
    { code: 'A-302', floor: 3, areaSqft: 1650, baseRate: 19500000, status: 'available' as const },
  ];

  const units: Record<string, { id: string }> = {};
  for (const u of unitData) {
    const unit = await prisma.unit.create({
      data: {
        projectId: projectSkyline.id,
        towerId: towerA.id,
        code: u.code,
        floor: u.floor,
        areaSqft: u.areaSqft,
        baseRate: u.baseRate,
        status: u.status,
      },
    });
    units[u.code] = unit;
  }

  // ---------- CRM Leads ----------
  const leads = [
    { name: 'Dr. Siddharth Shah', phone: '+91-9821098765', email: 'sid.shah@health.com', source: 'walk_in', state: 'booked' as const, unit: 'A-101' },
    { name: 'Priya Nambiar', phone: '+91-9988776655', email: 'priya.n@techcorp.com', source: 'referral', state: 'booked' as const, unit: 'A-102' },
    { name: 'Anand Kumar', phone: '+91-9765432100', email: 'anand@capital.com', source: 'online', state: 'negotiation' as const, unit: 'A-103' },
    { name: 'Kavita Roy', phone: '+91-9123456780', email: 'kavita@design.com', source: 'broker', state: 'site_visit_done' as const },
    { name: 'Manish Verma', phone: '+91-9876543299', email: 'mverma@logistics.com', source: 'online', state: 'qualified' as const },
    { name: 'Deepak Merchant', phone: '+91-9456789012', email: 'deepak@merchant.in', source: 'walk_in', state: 'new' as const },
  ];

  for (const l of leads) {
    await prisma.lead.create({
      data: {
        name: l.name,
        phone: l.phone,
        email: l.email,
        source: l.source,
        state: l.state,
        projectId: projectSkyline.id,
        unitId: l.unit ? units[l.unit].id : undefined,
        assignedToId: empManager.id,
      },
    });
  }

  // ---------- Bookings & Payments ----------
  const booking1 = await prisma.booking.create({
    data: {
      unitId: units['A-101'].id,
      customerName: 'Dr. Siddharth Shah',
      customerPhone: '+91-9821098765',
      customerEmail: 'sid.shah@health.com',
      state: 'agreement_signed',
      agreementSignedAt: new Date('2026-02-10'),
    },
  });

  await prisma.payment.create({
    data: {
      bookingId: booking1.id,
      amount: 1450000.0,
      status: 'cleared',
      method: 'NEFT Transfer',
      reference: 'HDFC-NEFT-9481923',
      clearedAt: new Date('2026-02-10'),
    },
  });

  // ---------- Construction Gantt & DPR ----------
  const milestone1 = await prisma.milestone.create({
    data: {
      projectId: projectSkyline.id,
      title: 'Foundation & Substructure Casting',
      targetDate: new Date('2026-03-31'),
      completionPct: 100,
      status: 'closed',
    },
  });

  const milestone2 = await prisma.milestone.create({
    data: {
      projectId: projectSkyline.id,
      title: 'Floor 6 RCC Slab Structure',
      targetDate: new Date('2026-08-15'),
      completionPct: 65,
      status: 'in_progress',
    },
  });

  await prisma.ganttTask.create({
    data: {
      projectId: projectSkyline.id,
      milestoneId: milestone2.id,
      taskName: 'Column Rebar Tying Floor 6',
      startDate: new Date('2026-07-01'),
      endDate: new Date('2026-07-28'),
      progress: 75.0,
      assignedWorker: 'Apex Concrete Crew',
    },
  });

  const dpr = await prisma.dailyProgressReport.create({
    data: {
      projectId: projectSkyline.id,
      reporterId: empEngineer.id,
      date: new Date(),
      workDone: 'Completed rebar tying for 12 structural columns on Floor 6. Poured 45 cu.m of RMC M40 concrete grade.',
      labourCount: 42,
      weather: 'Clear (29°C)',
    },
  });

  await prisma.labourRecord.create({
    data: {
      dprId: dpr.id,
      trade: 'Steel Fixers & Carpenters',
      headcount: 28,
      dailyRate: 850.0,
      totalWage: 23800.0,
    },
  });

  // ---------- BOQ & Cost Control ----------
  const boq = await prisma.billOfQuantities.create({
    data: {
      projectId: projectSkyline.id,
      title: 'Structural Steel & Concrete Master BOQ',
      totalBudget: 42000000.0,
    },
  });

  await prisma.boqItem.create({
    data: {
      boqId: boq.id,
      itemCode: 'BOQ-STL-01',
      description: 'Fe550 TMT Rebar 16mm (Tata Tiscon)',
      uom: 'MT',
      estimatedQty: 450,
      estimatedRate: 62000.0,
      estimatedCost: 27900000.0,
      actualQty: 180,
      actualCost: 11160000.0,
    },
  });

  await prisma.boqItem.create({
    data: {
      boqId: boq.id,
      itemCode: 'BOQ-CEM-02',
      description: 'UltraTech PPC Cement 50kg Bags',
      uom: 'Bags',
      estimatedQty: 12000,
      estimatedRate: 380.0,
      estimatedCost: 4560000.0,
      actualQty: 4200,
      actualCost: 1596000.0,
    },
  });

  // ---------- Quality Control & Snags ----------
  const inspection = await prisma.qualityInspection.create({
    data: {
      projectId: projectSkyline.id,
      inspectorId: empEngineer.id,
      location: 'Tower Alpha - Floor 5 Slab',
      score: 92.5,
      status: 'closed',
    },
  });

  await prisma.defectSnag.create({
    data: {
      inspectionId: inspection.id,
      title: 'Honeycombing on Shear Wall W-03',
      description: 'Minor void formation during concrete vibration at junction W-03.',
      severity: 'minor',
      assignedTo: 'Apex Concrete Ltd',
      status: 'open',
    },
  });

  // ---------- FinOS Banking & Treasury ----------
  const bankAccount1 = await prisma.bankAccount.create({
    data: {
      projectId: projectSkyline.id,
      bankName: 'HDFC Bank - BKC Branch',
      accountNumber: '5020004918231',
      ifsc: 'HDFC0000123',
      branch: 'Bandra Kurla Complex',
      balance: 18500000.0,
      accountType: 'Current Operating',
    },
  });

  const bankAccount2 = await prisma.bankAccount.create({
    data: {
      projectId: projectSkyline.id,
      bankName: 'ICICI Bank - Escrow Pool',
      accountNumber: '000405019283',
      ifsc: 'ICIC0000004',
      branch: 'Nariman Point',
      balance: 42000000.0,
      accountType: 'RERA Escrow Pool',
    },
  });

  await prisma.bankTransaction.create({
    data: {
      bankAccountId: bankAccount1.id,
      type: 'CREDIT',
      amount: 1450000.0,
      payee: 'Dr. Siddharth Shah (Unit A-101)',
      category: 'Customer Milestone Token',
      reference: 'TXN-9849201',
    },
  });

  // ---------- Accounting & GST Invoices ----------
  await prisma.gstInvoice.create({
    data: {
      projectId: projectSkyline.id,
      invoiceNumber: 'INV-2026-0091',
      customerName: 'Dr. Siddharth Shah',
      customerGstin: '27AAACS9821F1Z2',
      subtotal: 1450000.0,
      cgstAmount: 130500.0,
      sgstAmount: 130500.0,
      totalAmount: 1711000.0,
      status: 'cleared',
      dueDate: new Date('2026-03-01'),
    },
  });

  await prisma.journalEntry.create({
    data: {
      entryNumber: 'JRN-2026-104',
      accountName: 'RERA Escrow Pool / Customer Advance',
      debit: 1450000.0,
      credit: 0,
      narration: 'Booking token advance receipt for Unit A-101',
    },
  });

  await prisma.fixedAsset.create({
    data: {
      assetName: 'Schwing Stetter Concrete Pump CP-1800',
      category: 'Heavy Machinery',
      purchaseCost: 3800000.0,
      currentValue: 3230000.0,
      depreciationRate: 15.0,
      purchasedAt: new Date('2025-02-01'),
    },
  });

  // ---------- Legal & RERA ----------
  await prisma.reraApproval.create({
    data: {
      projectId: projectSkyline.id,
      registrationNo: 'P51800028491',
      validUntil: new Date('2028-12-31'),
      status: 'approved',
    },
  });

  await prisma.landRecord.create({
    data: {
      projectId: projectSkyline.id,
      surveyNumber: 'CTS Survey #148/A Bandra',
      landAreaAcre: 4.25,
      ownerName: 'Avenue Real Estate SPV 1',
      clearanceStatus: 'Title Clear & Non-encumbered',
    },
  });

  await prisma.architecturalDrawing.create({
    data: {
      title: 'Tower Alpha Structural Column & Rebar Elevation Plan',
      drawingCode: 'DWG-TWA-STR-06',
      version: 'v2.1',
      fileUrl: '/drawings/tower_alpha_str_v2.1.pdf',
      approvedBy: 'Chief Architect Somaya & Associates',
    },
  });

  // ---------- Knowledge Base Wiki ----------
  await prisma.knowledgeArticle.create({
    data: {
      title: 'Understanding Your RERA Escrow Payment Schedule & Demand Notices',
      category: 'Booking & Payments',
      content: `### RERA Escrow Compliance Guidelines\n\nAll customer milestone payments are deposited directly into our dedicated RERA Escrow Bank Account. Demand notices are issued 15 days prior to slab casting milestones.\n\n#### Key Steps:\n1. Verify your unit booking code on your Demand Notice.\n2. Transfer funds via RTGS/NEFT to the ICICI RERA Escrow Pool.\n3. Upload your payment reference on the Customer Portal to receive your GST Tax Receipt immediately.`,
      author: 'Finance & Compliance Desk',
      views: 142,
    },
  });

  await prisma.knowledgeArticle.create({
    data: {
      title: 'Site Quality Assurance & Defect Rectification SLA Protocol',
      category: 'Construction FAQ',
      content: `### Quality Inspection Standards\n\nOur site engineers conduct daily quality walk inspections scoring concrete pouring, rebar placement, and waterproofing.\n\nAny flagged snag tickets are resolved by assigned contractors within a 48-hour SLA period before floor handover.`,
      author: 'QA/QC Engineering Department',
      views: 89,
    },
  });

  console.log('✅ Demo data injection completed successfully!');
  console.log('📊 Summary: 2 Projects, 7 Units, 6 CRM Leads, 2 Bank Accounts, BOQs, GST Invoices, and Knowledge Articles created.');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
