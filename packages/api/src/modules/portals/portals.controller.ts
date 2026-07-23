import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { PortalsService } from './portals.service';

@Controller('portals')
export class PortalsController {
  constructor(private readonly portalsService: PortalsService) {}

  @Get('customer')
  getCustomerPortalData(@Query('phone') phone?: string) {
    return this.portalsService.getCustomerPortalData(phone);
  }

  @Post('customer/tickets')
  createSupportTicket(@Body() body: any) {
    return this.portalsService.createSupportTicket(body);
  }

  @Get('vendor')
  getVendorPortalData(@Query('vendorName') vendorName?: string) {
    return this.portalsService.getVendorPortalData(vendorName);
  }

  @Get('partner')
  getPartnerPortalData() {
    return this.portalsService.getPartnerPortalData();
  }

  @Post('partner/commissions')
  createBrokerCommission(@Body() body: any) {
    return this.portalsService.createBrokerCommission(body);
  }
}
