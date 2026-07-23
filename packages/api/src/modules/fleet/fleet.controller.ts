import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { FleetService } from './fleet.service';

@Controller('fleet')
export class FleetController {
  constructor(private readonly fleetService: FleetService) {}

  @Get()
  listVehicles(@Query('projectId') projectId?: string) {
    return this.fleetService.listVehicles(projectId);
  }

  @Get('maintenance')
  getMaintenanceSchedules() {
    return this.fleetService.getMaintenanceSchedules();
  }

  @Post('maintenance')
  createMaintenanceSchedule(@Body() body: any) {
    return this.fleetService.createMaintenanceSchedule(body);
  }

  @Get('fuel')
  getFuelLogs() {
    return this.fleetService.getFuelLogs();
  }

  @Post('fuel')
  createFuelLog(@Body() body: any) {
    return this.fleetService.createFuelLog(body);
  }

  @Get('amc')
  getAmcContracts() {
    return this.fleetService.getAmcContracts();
  }

  @Post('amc')
  createAmcContract(@Body() body: any) {
    return this.fleetService.createAmcContract(body);
  }
}
