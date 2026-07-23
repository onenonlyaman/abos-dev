import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class BoqService {
  constructor(private readonly prisma: PrismaService) {}

  async getBoqs(projectId?: string) {
    return this.prisma.billOfQuantities.findMany({
      where: projectId ? { projectId } : undefined,
      include: { items: true },
    });
  }

  async createBoqItem(data: any) {
    let boqId = data.boqId;
    if (!boqId) {
      let boq = await this.prisma.billOfQuantities.findFirst();
      if (!boq) {
        const p = await this.prisma.project.findFirst();
        if (p) {
          boq = await this.prisma.billOfQuantities.create({
            data: { projectId: p.id, title: 'Master Project BOQ', totalBudget: 10000000 },
          });
        }
      }
      if (boq) boqId = boq.id;
    }

    if (!boqId) throw new Error('No BOQ record available');

    const estimatedQty = Number(data.estimatedQty || 1);
    const estimatedRate = Number(data.estimatedRate || 0);
    const estimatedCost = data.estimatedCost ? Number(data.estimatedCost) : estimatedQty * estimatedRate;
    const actualCost = data.actualCost ? Number(data.actualCost) : 0;

    return this.prisma.boqItem.create({
      data: {
        boqId,
        itemCode: data.itemCode,
        description: data.description,
        uom: data.uom || 'units',
        estimatedQty,
        estimatedRate,
        estimatedCost,
        actualQty: data.actualQty ? Number(data.actualQty) : 0,
        actualCost,
      },
    });
  }

  async getVarianceReport(projectId?: string) {
    const items = await this.prisma.boqItem.findMany({
      where: projectId ? { boq: { projectId } } : undefined,
    });
    return items.map((item) => ({
      itemCode: item.itemCode,
      description: item.description,
      estimatedCost: item.estimatedCost,
      actualCost: item.actualCost,
      varianceAmount: Number(item.actualCost) - Number(item.estimatedCost),
      isOverBudget: Number(item.actualCost) > Number(item.estimatedCost),
    }));
  }
}
