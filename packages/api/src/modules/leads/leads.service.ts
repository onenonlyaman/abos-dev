import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { LeadState } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadStateDto } from './dto/update-lead-state.dto';

@Injectable()
export class LeadsService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateLeadDto) {
    return this.prisma.lead.create({ data: { ...dto, state: LeadState.new } });
  }

  list(state?: LeadState) {
    return this.prisma.lead.findMany({
      where: state ? { state } : undefined,
      include: { project: true, unit: true, assignedTo: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async get(id: string) {
    const lead = await this.prisma.lead.findUnique({
      where: { id },
      include: { project: true, unit: true, assignedTo: true },
    });
    if (!lead) throw new NotFoundException('Lead not found');
    return lead;
  }

  /** lost requires lost_reason. qualified -> site_visit_scheduled requires a unit/project reference. */
  async updateState(id: string, dto: UpdateLeadStateDto) {
    const lead = await this.get(id);

    if (dto.state === LeadState.lost && !dto.lostReason) {
      throw new BadRequestException('lostReason is required when transitioning to lost');
    }
    if (
      dto.state === LeadState.site_visit_scheduled &&
      !dto.unitId &&
      !lead.unitId &&
      !lead.projectId
    ) {
      throw new BadRequestException('A unit or project reference is required for site_visit_scheduled');
    }

    return this.prisma.lead.update({
      where: { id },
      data: {
        state: dto.state,
        lostReason: dto.state === LeadState.lost ? dto.lostReason : null,
        unitId: dto.unitId ?? lead.unitId,
      },
    });
  }
}
