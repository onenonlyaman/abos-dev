import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Wiping existing demo data...');
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
  await prisma.project.deleteMany();
  await prisma.spv.deleteMany();
  await prisma.vendor.deleteMany();

  console.log('Seeding demo data...');

  // ---------- SPV + Projects ----------
  const spv = await prisma.spv.create({
    data: {
      name: 'Horizon Developers',
      legalName: 'Horizon Developers Pvt Ltd',
      gstin: '27ABCDE1234F1Z5',
    },
  });

  const skyline = await prisma.project.create({
    data: { spvId: spv.id, name: 'Skyline Tower', code: 'SKY', city: 'Mumbai' },
  });

  const waterfront = await prisma.project.create({
    data: { spvId: spv.id, name: 'Waterfront Plaza', code: 'WFP', city: 'Pune' },
  });

  // ---------- Units (Skyline Tower) ----------
  const unitData = [
    { code: 'A-101', floor: 1, areaSqft: 950, baseRate: 8500000, status: 'booked' as const },
    { code: 'A-102', floor: 1, areaSqft: 950, baseRate: 8500000, status: 'booked' as const },
    { code: 'A-103', floor: 1, areaSqft: 850, baseRate: 8200000, status: 'held' as const },
    { code: 'B-201', floor: 2, areaSqft: 1050, baseRate: 9000000, status: 'available' as const },
    { code: 'B-202', floor: 2, areaSqft: 1050, baseRate: 9000000, status: 'held' as const },
    { code: 'C-301', floor: 3, areaSqft: 1200, baseRate: 9500000, status: 'available' as const },
    { code: 'C-302', floor: 3, areaSqft: 1200, baseRate: 9500000, status: 'available' as const },
  ];

  const units: Record<string, { id: string }> = {};
  for (const u of unitData) {
    const unit = await prisma.unit.create({
      data: { projectId: skyline.id, code: u.code, floor: u.floor, areaSqft: u.areaSqft, baseRate: u.baseRate, status: u.status },
    });
    units[u.code] = unit;
  }

  // ---------- Bookings ----------
  await prisma.booking.create({
    data: {
      unitId: units['A-102'].id,
      customerName: 'Rahul Mehta',
      customerPhone: '+91-9876543210',
      state: 'agreement_signed',
      agreementSignedAt: new Date(),
    },
  });

  await prisma.booking.create({
    data: {
      unitId: units['B-202'].id,
      customerName: 'Priya Sharma',
      customerPhone: '+91-9123456789',
      state: 'payment_pending',
    },
  });

  // ---------- Leads ----------
  const leadData = [
    { name: 'Amit Patel', phone: '+91-8765432109', source: 'walk_in', state: 'new' as const },
    { name: 'Neha Singh', phone: '+91-9876543211', source: 'referral', state: 'new' as const, unit: 'A-101' },
    { name: 'Vikram Desai', phone: '+91-9000000000', source: 'online', state: 'new' as const },
    { name: 'Karan Gupta', phone: '+91-8234567890', source: 'broker', state: 'contacted' as const },
    { name: 'Divya Rao', phone: '+91-9111111111', source: 'exhibition', state: 'contacted' as const },
    { name: 'Rohan Verma', phone: '+91-8999999999', source: 'online', state: 'qualified' as const },
    { name: 'Anjali Nair', phone: '+91-9555555555', source: 'referral', state: 'site_visit_scheduled' as const, unit: 'C-301' },
    { name: 'Sanjay Kumar', phone: '+91-8888888888', source: 'walk_in', state: 'site_visit_scheduled' as const },
    { name: 'Meera Chopra', phone: '+91-9777777777', source: 'online', state: 'site_visit_done' as const },
    { name: 'Arjun Singh', phone: '+91-9444444444', source: 'broker', state: 'negotiation' as const },
    { name: 'Sunita Rao', phone: '+91-9333333333', source: 'referral', state: 'booked' as const, unit: 'A-102' },
    { name: 'Aditya Bhat', phone: '+91-8777777777', source: 'online', state: 'lost' as const, lostReason: 'competitor' as const },
  ];

  for (const l of leadData) {
    await prisma.lead.create({
      data: {
        name: l.name,
        phone: l.phone,
        source: l.source,
        state: l.state,
        lostReason: l.lostReason,
        projectId: skyline.id,
        unitId: l.unit ? units[l.unit].id : undefined,
      },
    });
  }

  console.log('Seed complete.');
  console.log(`Projects: ${skyline.name}, ${waterfront.name}`);
  console.log(`Units: ${unitData.length}`);
  console.log(`Leads: ${leadData.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
