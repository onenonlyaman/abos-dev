import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ConstructionService {
  constructor(private readonly prisma: PrismaService) {}

  async getMilestones(projectId?: string) {
    return this.prisma.milestone.findMany({
      where: projectId ? { projectId } : undefined,
      include: { ganttTasks: true },
    });
  }

  async getGanttTasks(projectId?: string) {
    return this.prisma.ganttTask.findMany({
      where: projectId ? { projectId } : undefined,
      orderBy: { startDate: 'asc' },
    });
  }

  async createGanttTask(data: any) {
    let projectId = data.projectId;
    if (!projectId) {
      const p = await this.prisma.project.findFirst();
      if (p) projectId = p.id;
    }
    return this.prisma.ganttTask.create({
      data: {
        projectId,
        taskName: data.taskName,
        startDate: data.startDate ? new Date(data.startDate) : new Date(),
        endDate: data.endDate ? new Date(data.endDate) : new Date(Date.now() + 14 * 86400000),
        progress: data.progress ? Number(data.progress) : 0,
      },
    });
  }

  async getDprs(projectId?: string) {
    return this.prisma.dailyProgressReport.findMany({
      where: projectId ? { projectId } : undefined,
      include: { photos: true, labourRecords: true, reporter: true },
      orderBy: { date: 'desc' },
    });
  }

  async createDpr(data: any) {
    let projectId = data.projectId;
    let reporterId = data.reporterId;
    if (!projectId) {
      const p = await this.prisma.project.findFirst();
      if (p) projectId = p.id;
    }
    if (!reporterId) {
      const emp = await this.prisma.employee.findFirst();
      if (emp) reporterId = emp.id;
    }
    if (!projectId || !reporterId) {
      throw new Error('Project and Reporter required');
    }
    return this.prisma.dailyProgressReport.create({
      data: {
        projectId,
        reporterId,
        workDone: data.workDone,
        labourCount: data.labourCount ? Number(data.labourCount) : 0,
        weather: data.weather || 'Clear',
        blockers: data.blockers || null,
      },
    });
  }
}
