import { Controller, Get } from '@nestjs/common';
import { WorkflowsService } from './workflows.service';

@Controller('workflows')
export class WorkflowsController {
  constructor(private readonly workflowsService: WorkflowsService) {}

  @Get('definitions')
  getDefinitions() {
    return this.workflowsService.getDefinitions();
  }

  @Get('executions')
  getExecutions() {
    return this.workflowsService.getExecutions();
  }
}
