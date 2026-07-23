import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { BoqService } from './boq.service';

@Controller('boq')
export class BoqController {
  constructor(private readonly boqService: BoqService) {}

  @Get()
  getBoqs(@Query('projectId') projectId?: string) {
    return this.boqService.getBoqs(projectId);
  }

  @Post()
  createBoqItem(@Body() body: any) {
    return this.boqService.createBoqItem(body);
  }

  @Get('variance')
  getVarianceReport(@Query('projectId') projectId?: string) {
    return this.boqService.getVarianceReport(projectId);
  }
}
