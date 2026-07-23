import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBudgetLineDto } from './dto/create-budget-line.dto';

function withAlerts<T extends { allocatedCap: unknown; consumedAmount: unknown }>(line: T) {
  const cap = Number(line.allocatedCap);
  const consumed = Number(line.consumedAmount);
  const consumedPct = cap > 0 ? consumed / cap : 0;
  return {
    ...line,
    consumedPct,
    alertLevel: consumedPct >= 1 ? ('breach' as const) : consumedPct >= 0.75 ? ('warning' as const) : ('ok' as const),
  };
}

@Injectable()
export class FinanceService {
  constructor(private readonly prisma: PrismaService) {}

  async createBudgetLine(dto: CreateBudgetLineDto) {
    const [project, sku] = await Promise.all([
      this.prisma.project.findUnique({ where: { id: dto.projectId } }),
      this.prisma.sku.findUnique({ where: { id: dto.skuId } }),
    ]);
    if (!project) throw new NotFoundException('Project not found');
    if (!sku) throw new NotFoundException('SKU not found');
    return this.prisma.budgetLine.create({ data: dto });
  }

  async listBudgetLines(projectId?: string) {
    const lines = await this.prisma.budgetLine.findMany({
      where: projectId ? { projectId } : undefined,
      include: { sku: true },
      orderBy: { createdAt: 'desc' },
    });
    return lines.map(withAlerts);
  }
}
