import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class QualityService {
  constructor(private readonly prisma: PrismaService) {}

  async getInspections(projectId?: string) {
    return this.prisma.qualityInspection.findMany({
      where: projectId ? { projectId } : undefined,
      include: { defects: true, inspector: true },
      orderBy: { inspectedAt: 'desc' },
    });
  }

  async getSnagList(projectId?: string) {
    return this.prisma.defectSnag.findMany({
      where: projectId ? { inspection: { projectId } } : undefined,
      include: { inspection: true },
    });
  }

  async createSnag(data: any) {
    let inspectionId = data.inspectionId;
    if (!inspectionId) {
      let insp = await this.prisma.qualityInspection.findFirst();
      if (!insp) {
        const p = await this.prisma.project.findFirst();
        const emp = await this.prisma.employee.findFirst();
        if (p && emp) {
          insp = await this.prisma.qualityInspection.create({
            data: { projectId: p.id, inspectorId: emp.id, location: data.location || 'Site Wide', score: 90 },
          });
        }
      }
      if (insp) inspectionId = insp.id;
    }

    if (!inspectionId) throw new Error('No quality inspection record available');

    return this.prisma.defectSnag.create({
      data: {
        inspectionId,
        title: data.title,
        description: data.description || '',
        severity: data.severity || 'minor',
        assignedTo: data.assignedTo || 'Unassigned Contractor',
      },
    });
  }
}
