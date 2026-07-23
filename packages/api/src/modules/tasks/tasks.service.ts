import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { TaskStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { ReassignTaskDto } from './dto/reassign-task.dto';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateTaskDto) {
    return this.prisma.task.create({
      data: { ...dto, targetDeadline: new Date(dto.targetDeadline) },
    });
  }

  list(status?: TaskStatus) {
    return this.prisma.task.findMany({
      where: status ? { status } : undefined,
      include: { assignee: true, assigner: true, project: true },
      orderBy: { startedAt: 'desc' },
    });
  }

  async get(id: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: { assignee: true, assigner: true, project: true, reassignments: true },
    });
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  /** Mandatory audit log entry: reassigner, timestamp, required reason, before/after assignee. */
  async reassign(id: string, dto: ReassignTaskDto) {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) throw new NotFoundException('Task not found');
    if (task.status === TaskStatus.closed) {
      throw new ConflictException('Cannot reassign a closed task');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.taskReassignmentLog.create({
        data: {
          taskId: id,
          reassignedById: dto.reassignedById,
          fromAssigneeId: task.assigneeId,
          toAssigneeId: dto.toAssigneeId,
          reason: dto.reason,
        },
      });
      return tx.task.update({ where: { id }, data: { assigneeId: dto.toAssigneeId } });
    });
  }

  /** closedEarly = true when QA-closed ahead of the target deadline. Downstream reward hook lives in HR. */
  async close(id: string) {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) throw new NotFoundException('Task not found');
    if (task.status === TaskStatus.closed) {
      throw new ConflictException('Task already closed');
    }
    const closedAt = new Date();
    return this.prisma.task.update({
      where: { id },
      data: {
        status: TaskStatus.closed,
        closedAt,
        closedEarly: closedAt < task.targetDeadline,
      },
    });
  }
}
