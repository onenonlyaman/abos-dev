import { Controller, Get, Post, Body } from '@nestjs/common';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('query')
  processCopilotQuery(@Body('prompt') prompt: string) {
    return this.aiService.processCopilotQuery(prompt || 'Show executive summary');
  }

  @Get('control-tower')
  getControlTowerAlerts() {
    return this.aiService.getControlTowerAlerts();
  }
}
