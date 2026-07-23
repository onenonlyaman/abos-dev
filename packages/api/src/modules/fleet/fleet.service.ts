import { Injectable } from '@nestjs/common';
import { VehicleStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';

@Injectable()
export class FleetService {
  constructor(private readonly prisma: PrismaService) {}

  createVehicle(dto: CreateVehicleDto) {
    return this.prisma.vehicle.create({ data: dto });
  }

  listVehicles(status?: VehicleStatus) {
    return this.prisma.vehicle.findMany({
      where: status ? { status } : undefined,
      include: { assignedProject: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
