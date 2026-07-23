import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  async getSkus(projectId?: string) {
    return this.prisma.sku.findMany({
      where: projectId ? { projectId } : undefined,
    });
  }

  async getGodowns() {
    return this.prisma.godown.findMany({ include: { project: true } });
  }

  async createGodown(data: any) {
    let projectId = data.projectId;
    if (!projectId) {
      const p = await this.prisma.project.findFirst();
      if (p) projectId = p.id;
    }
    return this.prisma.godown.create({
      data: {
        projectId,
        name: data.name,
        location: data.location || 'Site Central Store',
        capacitySqft: Number(data.capacitySqft || 5000),
      },
    });
  }

  async getStockTransfers() {
    return this.prisma.stockTransfer.findMany({
      include: { fromGodown: true, toGodown: true },
      orderBy: { transferredAt: 'desc' },
    });
  }

  async createStockTransfer(data: any) {
    let fromGodownId = data.fromGodownId;
    let toGodownId = data.toGodownId;

    const godowns = await this.prisma.godown.findMany({ take: 2 });
    if (!fromGodownId && godowns.length > 0) fromGodownId = godowns[0].id;
    if (!toGodownId && godowns.length > 1) toGodownId = godowns[1].id;
    if (!toGodownId) toGodownId = fromGodownId;

    if (!fromGodownId || !toGodownId) throw new Error('Godowns not available for transfer');

    return this.prisma.stockTransfer.create({
      data: {
        transferNo: data.transferNo || `TRF-${Date.now()}`,
        fromGodownId,
        toGodownId,
        skuName: data.skuName || 'Fe550 TMT Rebar 16mm',
        quantity: Number(data.quantity || 10),
      },
    });
  }

  async getMaterialIssueSlips() {
    return this.prisma.materialIssueSlip.findMany({ orderBy: { issuedAt: 'desc' } });
  }

  async createMaterialIssueSlip(data: any) {
    return this.prisma.materialIssueSlip.create({
      data: {
        issueNumber: data.issueNumber || `MIS-${Date.now()}`,
        contractor: data.contractor || 'Apex Civil Works',
        materialName: data.materialName,
        quantity: Number(data.quantity || 1),
      },
    });
  }

  async getStockAudits() {
    return this.prisma.stockAudit.findMany({ orderBy: { auditedAt: 'desc' } });
  }

  async createStockAudit(data: any) {
    return this.prisma.stockAudit.create({
      data: {
        auditedBy: data.auditedBy || 'Inventory Controller',
        location: data.location || 'Godown A',
        discrepancy: data.discrepancy || 'Zero discrepancy. Stock matched physically.',
      },
    });
  }
}
