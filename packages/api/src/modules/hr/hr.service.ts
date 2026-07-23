import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { LoginSessionDto } from './dto/login-session.dto';

@Injectable()
export class HrService {
  constructor(private readonly prisma: PrismaService) {}

  createEmployee(dto: CreateEmployeeDto) {
    return this.prisma.employee.create({ data: dto });
  }

  listEmployees() {
    return this.prisma.employee.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async login(employeeId: string, dto: LoginSessionDto) {
    const employee = await this.prisma.employee.findUnique({ where: { id: employeeId } });
    if (!employee) throw new NotFoundException('Employee not found');
    return this.prisma.employeeSession.create({
      data: { employeeId, ipAddress: dto.ipAddress, device: dto.device },
    });
  }

  async logout(sessionId: string) {
    const session = await this.prisma.employeeSession.findUnique({ where: { id: sessionId } });
    if (!session) throw new NotFoundException('Session not found');
    if (session.logoutAt) throw new ConflictException('Session already closed');
    return this.prisma.employeeSession.update({
      where: { id: sessionId },
      data: { logoutAt: new Date() },
    });
  }

  listSessions(employeeId?: string) {
    return this.prisma.employeeSession.findMany({
      where: employeeId ? { employeeId } : undefined,
      orderBy: { loginAt: 'desc' },
    });
  }
}
