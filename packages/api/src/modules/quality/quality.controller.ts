import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { QualityService } from './quality.service';

@Controller('quality')
export class QualityController {
  constructor(private readonly qualityService: QualityService) {}

  @Get('inspections')
  getInspections(@Query('projectId') projectId?: string) {
    return this.qualityService.getInspections(projectId);
  }

  @Get('snags')
  getSnagList(@Query('projectId') projectId?: string) {
    return this.qualityService.getSnagList(projectId);
  }

  @Post('snags')
  createSnag(@Body() body: any) {
    return this.qualityService.createSnag(body);
  }
}
