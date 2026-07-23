import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AiService {
  constructor(private readonly prisma: PrismaService) {}

  async processCopilotQuery(prompt: string) {
    const queryLower = prompt.toLowerCase();
    let responseText = '';
    let dataPayload: any = null;

    if (queryLower.includes('delay') || queryLower.includes('behind')) {
      const openGantt = await this.prisma.ganttTask.findMany({
        where: { progress: { lt: 100 } },
      });
      if (openGantt.length === 0) {
        responseText = 'No delayed tasks or open milestones found in the database.';
        dataPayload = { totalTasks: 0, delayedTasks: 0 };
      } else {
        responseText = `Found ${openGantt.length} active construction tasks in database.`;
        dataPayload = { activeTasks: openGantt.length, tasks: openGantt.map((t) => t.taskName) };
      }
    } else if (queryLower.includes('budget') || queryLower.includes('overrun') || queryLower.includes('boq')) {
      const boqItems = await this.prisma.boqItem.findMany();
      const breachItems = boqItems.filter((i) => Number(i.actualCost) > Number(i.estimatedCost));
      if (breachItems.length === 0) {
        responseText = 'All BOQ items are currently within estimated cost caps in database.';
        dataPayload = { totalBoqItems: boqItems.length, overrunCount: 0 };
      } else {
        responseText = `Detected ${breachItems.length} BOQ cost breaches in database.`;
        dataPayload = { breachCount: breachItems.length, items: breachItems.map((i) => i.itemCode) };
      }
    } else if (queryLower.includes('cash') || queryLower.includes('bank') || queryLower.includes('forecast')) {
      const bankAccounts = await this.prisma.bankAccount.findMany();
      const totalCash = bankAccounts.reduce((acc, a) => acc + Number(a.balance), 0);
      responseText = `Database query: Total cash across ${bankAccounts.length} bank accounts is ₹ ${totalCash.toLocaleString()}.`;
      dataPayload = { bankAccountsCount: bankAccounts.length, totalBalance: totalCash };
    } else {
      const projectsCount = await this.prisma.project.count();
      const leadsCount = await this.prisma.lead.count();
      const bookingsCount = await this.prisma.booking.count();
      responseText = `ABOS Database Live Query: ${projectsCount} Projects, ${leadsCount} Leads, ${bookingsCount} Bookings active.`;
      dataPayload = { projects: projectsCount, leads: leadsCount, bookings: bookingsCount };
    }

    return {
      prompt,
      answer: responseText,
      data: dataPayload,
      timestamp: new Date().toISOString(),
    };
  }

  async getControlTowerAlerts() {
    const alerts: any[] = [];

    // Query 1: BOQ items exceeding estimated budget
    const boqItems = await this.prisma.boqItem.findMany();
    for (const item of boqItems) {
      if (Number(item.actualCost) > Number(item.estimatedCost)) {
        alerts.push({
          id: `boq-${item.id}`,
          title: `BOQ Cost Overrun: ${item.itemCode}`,
          severity: 'high',
          category: 'budget',
          description: `Actual cost ₹ ${item.actualCost} exceeds estimated cap ₹ ${item.estimatedCost}`,
          recommendation: 'Review purchase orders and vendor contract rates',
        });
      }
    }

    // Query 2: Pending purchase orders requiring approval
    const pendingPOs = await this.prisma.purchaseOrder.findMany({
      where: { status: 'pending_approval' },
      include: { vendor: true, project: true },
    });
    for (const po of pendingPOs) {
      alerts.push({
        id: `po-${po.id}`,
        title: `Pending Purchase Order: ${po.project.name}`,
        severity: 'medium',
        category: 'approval',
        description: `PO for vendor ${po.vendor.name} is awaiting executive approval`,
        recommendation: 'Verify GRN receipt and authorize disbursal',
      });
    }

    return alerts;
  }
}
