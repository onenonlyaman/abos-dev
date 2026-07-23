import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSpvDto } from './dto/create-spv.dto';
import { CreateProjectDto } from './dto/create-project.dto';
import { CreateUnitDto } from './dto/create-unit.dto';

@Injectable()
export class CoreService {
  constructor(private readonly prisma: PrismaService) {}

  createSpv(dto: CreateSpvDto) {
    return this.prisma.spv.create({ data: dto });
  }

  listSpvs() {
    return this.prisma.spv.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async createProject(dto: CreateProjectDto) {
    const spv = await this.prisma.spv.findUnique({ where: { id: dto.spvId } });
    if (!spv) throw new NotFoundException('SPV not found');
    return this.prisma.project.create({ data: dto });
  }

  listProjects() {
    return this.prisma.project.findMany({
      include: { spv: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createUnit(dto: CreateUnitDto) {
    const project = await this.prisma.project.findUnique({ where: { id: dto.projectId } });
    if (!project) throw new NotFoundException('Project not found');
    return this.prisma.unit.create({
      data: {
        projectId: dto.projectId,
        code: dto.code,
        floor: dto.floor,
        areaSqft: dto.areaSqft,
        baseRate: dto.baseRate,
      },
    });
  }

  listUnits(projectId?: string) {
    return this.prisma.unit.findMany({
      where: projectId ? { projectId } : undefined,
      include: { project: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getUnit(id: string) {
    const unit = await this.prisma.unit.findUnique({ where: { id } });
    if (!unit) throw new NotFoundException('Unit not found');
    return unit;
  }
}
