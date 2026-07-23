import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { VehicleStatus } from '@prisma/client';
import { FleetService } from './fleet.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';

@Controller('vehicles')
export class FleetController {
  constructor(private readonly fleet: FleetService) {}

  @Post()
  create(@Body() dto: CreateVehicleDto) {
    return this.fleet.createVehicle(dto);
  }

  @Get()
  list(@Query('status') status?: VehicleStatus) {
    return this.fleet.listVehicles(status);
  }
}
