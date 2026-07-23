import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class WorkflowsService {
  constructor(private readonly prisma: PrismaService) {}

  async getDefinitions() {
    return this.prisma.workflowDefinition.findMany();
  }

  async getExecutions() {
    return this.prisma.workflowExecution.findMany({
      include: { workflow: true, handledBy: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
