import { Controller, Get, Post, Body } from '@nestjs/common';
import { CommunicationService } from './communication.service';

@Controller('communication')
export class CommunicationController {
  constructor(private readonly communicationService: CommunicationService) {}

  @Get('campaigns')
  getCampaigns() {
    return this.communicationService.getCampaigns();
  }

  @Post('campaigns')
  createCampaign(@Body() body: any) {
    return this.communicationService.createCampaign(body);
  }

  @Get('whatsapp-logs')
  getWhatsAppLogs() {
    return this.communicationService.getWhatsAppLogs();
  }

  @Get('call-logs')
  getCallLogs() {
    return this.communicationService.getCallLogs();
  }

  @Post('call-logs')
  createCallLog(@Body() body: any) {
    return this.communicationService.createCallLog(body);
  }
}
