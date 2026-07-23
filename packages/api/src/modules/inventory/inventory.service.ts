import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSkuDto } from './dto/create-sku.dto';
import { AdjustStockDto } from './dto/adjust-stock.dto';

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  async createSku(dto: CreateSkuDto) {
    const project = await this.prisma.project.findUnique({ where: { id: dto.projectId } });
    if (!project) throw new NotFoundException('Project not found');
    return this.prisma.sku.create({
      data: {
        projectId: dto.projectId,
        code: dto.code,
        name: dto.name,
        uom: dto.uom,
        formula: dto.formula,
        safetyStock: dto.safetyStock ?? 0,
      },
    });
  }

  listSkus(projectId?: string) {
    return this.prisma.sku.findMany({
      where: projectId ? { projectId } : undefined,
      orderBy: { createdAt: 'desc' },
    });
  }

  /** currentStock = currentStock + inward - outward, applied atomically. Outward cannot exceed on-hand stock. */
  async adjustStock(id: string, dto: AdjustStockDto) {
    return this.prisma.$transaction(async (tx) => {
      const sku = await tx.sku.findUnique({ where: { id } });
      if (!sku) throw new NotFoundException('SKU not found');

      const delta = dto.direction === 'inward' ? dto.quantity : -dto.quantity;
      const nextStock = Number(sku.currentStock) + delta;
      if (nextStock < 0) {
        throw new BadRequestException('Outward quantity exceeds current stock');
      }

      return tx.sku.update({ where: { id }, data: { currentStock: nextStock } });
    });
  }
}
