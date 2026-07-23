import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PortalsService {
  constructor(private readonly prisma: PrismaService) {}

  async getCustomerPortalData(customerPhone?: string) {
    const bookings = await this.prisma.booking.findMany({
      where: customerPhone ? { customerPhone } : undefined,
      include: { unit: { include: { project: true } }, payments: true },
    });
    const tickets = await this.prisma.supportTicket.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return { bookings, tickets };
  }

  async getVendorPortalData(vendorName?: string) {
    const pos = await this.prisma.purchaseOrder.findMany({
      include: { vendor: true, project: true, lines: { include: { sku: true } } },
    });
    const grns = await this.prisma.goodsReceiptNote.findMany({
      orderBy: { receivedAt: 'desc' },
    });
    return { purchaseOrders: pos, grns };
  }

  async getPartnerPortalData() {
    const leads = await this.prisma.lead.findMany({
      where: { source: 'broker' },
      include: { unit: true, project: true },
    });
    const commissions = await this.prisma.brokerCommission.findMany({
      orderBy: { id: 'desc' },
    });
    return { leads, commissions };
  }

  async createSupportTicket(data: any) {
    return this.prisma.supportTicket.create({
      data: {
        ticketNumber: data.ticketNumber || `TCK-${Date.now()}`,
        customerName: data.customerName,
        subject: data.subject,
        category: data.category || 'General',
        priority: data.priority || 'medium',
      },
    });
  }

  async createBrokerCommission(data: any) {
    return this.prisma.brokerCommission.create({
      data: {
        brokerName: data.brokerName,
        unitCode: data.unitCode,
        commissionAmount: Number(data.commissionAmount || 0),
        status: 'pending',
      },
    });
  }
}
