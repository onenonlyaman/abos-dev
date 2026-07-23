import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ConstructionService } from './construction.service';

@Controller('construction')
export class ConstructionController {
  constructor(private readonly constructionService: ConstructionService) {}

  @Get('milestones')
  getMilestones(@Query('projectId') projectId?: string) {
    return this.constructionService.getMilestones(projectId);
  }

  @Get('gantt')
  getGanttTasks(@Query('projectId') projectId?: string) {
    return this.constructionService.getGanttTasks(projectId);
  }

  @Post('gantt')
  createGanttTask(@Body() body: any) {
    return this.constructionService.createGanttTask(body);
  }

  @Get('dpr')
  getDprs(@Query('projectId') projectId?: string) {
    return this.constructionService.getDprs(projectId);
  }

  @Post('dpr')
  createDpr(@Body() body: any) {
    return this.constructionService.createDpr(body);
  }
}
