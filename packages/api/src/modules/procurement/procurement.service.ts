import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ProcurementService {
  constructor(private readonly prisma: PrismaService) {}

  async getVendors() {
    return this.prisma.vendor.findMany();
  }

  async getPurchaseOrders(projectId?: string) {
    return this.prisma.purchaseOrder.findMany({
      where: projectId ? { projectId } : undefined,
      include: { vendor: true, project: true, lines: { include: { sku: true } } },
    });
  }

  async getRequisitions() {
    return this.prisma.purchaseRequisition.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async createRequisition(data: any) {
    return this.prisma.purchaseRequisition.create({
      data: {
        requisitionNo: data.requisitionNo || `REQ-${Date.now()}`,
        requestedBy: data.requestedBy || 'Site Engineer',
        department: data.department || 'Construction',
        totalEstimatedCost: Number(data.totalEstimatedCost || 0),
        status: 'pending',
      },
    });
  }

  async getRfqs() {
    return this.prisma.rfq.findMany({ include: { quotes: true } });
  }

  async createRfq(data: any) {
    return this.prisma.rfq.create({
      data: {
        rfqNumber: data.rfqNumber || `RFQ-${Date.now()}`,
        title: data.title,
        deadline: data.deadline ? new Date(data.deadline) : new Date(Date.now() + 7 * 86400000),
        status: 'open',
      },
    });
  }

  async addVendorQuote(data: any) {
    return this.prisma.vendorQuote.create({
      data: {
        rfqId: data.rfqId,
        vendorName: data.vendorName,
        quotedRate: Number(data.quotedRate || 0),
        deliveryDays: Number(data.deliveryDays || 5),
        selected: Boolean(data.selected || false),
      },
    });
  }

  async getGrns() {
    return this.prisma.goodsReceiptNote.findMany({ orderBy: { receivedAt: 'desc' } });
  }

  async createGrn(data: any) {
    return this.prisma.goodsReceiptNote.create({
      data: {
        grnNumber: data.grnNumber || `GRN-${Date.now()}`,
        poNumber: data.poNumber || 'PO-2026-001',
        vendorName: data.vendorName,
        receivedItems: data.receivedItems || 'Cement Bags / Rebar',
        inspectedBy: data.inspectedBy || 'Quality Inspector',
      },
    });
  }
}
