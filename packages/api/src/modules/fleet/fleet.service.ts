import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class FleetService {
  constructor(private readonly prisma: PrismaService) {}

  async listVehicles(projectId?: string) {
    return this.prisma.vehicle.findMany({
      where: projectId ? { assignedProjectId: projectId } : undefined,
    });
  }

  async getMaintenanceSchedules() {
    return this.prisma.maintenanceSchedule.findMany({ orderBy: { scheduledDate: 'asc' } });
  }

  async createMaintenanceSchedule(data: any) {
    return this.prisma.maintenanceSchedule.create({
      data: {
        assetName: data.assetName || 'Tower Crane #1',
        maintenanceType: data.maintenanceType || 'Hydraulic & Gear Inspection',
        scheduledDate: data.scheduledDate ? new Date(data.scheduledDate) : new Date(Date.now() + 7 * 86400000),
        status: 'scheduled',
      },
    });
  }

  async getFuelLogs() {
    return this.prisma.fuelLog.findMany({ orderBy: { loggedAt: 'desc' } });
  }

  async createFuelLog(data: any) {
    return this.prisma.fuelLog.create({
      data: {
        vehicleName: data.vehicleName || 'JCB Excavator 3DX',
        fuelLitres: Number(data.fuelLitres || 50),
        costAmount: Number(data.costAmount || 4500),
      },
    });
  }

  async getAmcContracts() {
    return this.prisma.amcContract.findMany({ orderBy: { validTo: 'asc' } });
  }

  async createAmcContract(data: any) {
    return this.prisma.amcContract.create({
      data: {
        providerName: data.providerName || 'Schindler Elevators India',
        equipmentCovered: data.equipmentCovered || 'Passenger Lifts 1-4',
        validTo: data.validTo ? new Date(data.validTo) : new Date(Date.now() + 365 * 86400000),
        annualCost: Number(data.annualCost || 240000),
      },
    });
  }
}
