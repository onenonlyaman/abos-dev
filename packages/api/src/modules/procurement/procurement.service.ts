import { Injectable, NotFoundException } from '@nestjs/common';
import { PurchaseOrderStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';

@Injectable()
export class ProcurementService {
  constructor(private readonly prisma: PrismaService) {}

  createVendor(dto: CreateVendorDto) {
    return this.prisma.vendor.create({ data: dto });
  }

  listVendors() {
    return this.prisma.vendor.findMany({ orderBy: { createdAt: 'desc' } });
  }

  /**
   * Per-line: actualUnitCost = actualCost / quantity. If actualUnitCost >=
   * 1.10 * baseline (allocatedCap / expectedQty from the project's
   * BudgetLine for that SKU), the line is flagged and the PO is held at
   * pending_approval instead of auto-approving.
   */
  async createPurchaseOrder(dto: CreatePurchaseOrderDto) {
    return this.prisma.$transaction(async (tx) => {
      let anyDeviation = false;
      const lineData = [];

      for (const line of dto.lines) {
        const actualUnitCost = line.actualCost / line.quantity;
        const budgetLine = await tx.budgetLine.findUnique({
          where: { projectId_skuId: { projectId: dto.projectId, skuId: line.skuId } },
        });

        let deviationFlagged = false;
        if (budgetLine) {
          const baseline = Number(budgetLine.allocatedCap) / Number(budgetLine.expectedQty);
          deviationFlagged = actualUnitCost >= 1.1 * baseline;
        }
        if (deviationFlagged) anyDeviation = true;

        lineData.push({
          skuId: line.skuId,
          quantity: line.quantity,
          actualCost: line.actualCost,
          actualUnitCost,
          deviationFlagged,
        });

        if (budgetLine) {
          await tx.budgetLine.update({
            where: { id: budgetLine.id },
            data: { consumedAmount: { increment: line.actualCost } },
          });
        }
      }

      return tx.purchaseOrder.create({
        data: {
          vendorId: dto.vendorId,
          projectId: dto.projectId,
          createdById: dto.createdById,
          status: anyDeviation ? PurchaseOrderStatus.pending_approval : PurchaseOrderStatus.approved,
          lines: { create: lineData },
        },
        include: { lines: true },
      });
    });
  }

  listPurchaseOrders(projectId?: string) {
    return this.prisma.purchaseOrder.findMany({
      where: projectId ? { projectId } : undefined,
      include: { vendor: true, lines: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async approvePurchaseOrder(id: string, approvedById: string) {
    const po = await this.prisma.purchaseOrder.findUnique({ where: { id } });
    if (!po) throw new NotFoundException('Purchase order not found');
    return this.prisma.purchaseOrder.update({
      where: { id },
      data: { status: PurchaseOrderStatus.approved, approvedById },
    });
  }
}
