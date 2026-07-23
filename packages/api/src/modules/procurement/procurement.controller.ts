import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ProcurementService } from './procurement.service';

@Controller('procurement')
export class ProcurementController {
  constructor(private readonly procurementService: ProcurementService) {}

  @Get('vendors')
  getVendors() {
    return this.procurementService.getVendors();
  }

  @Get('purchase-orders')
  getPurchaseOrders(@Query('projectId') projectId?: string) {
    return this.procurementService.getPurchaseOrders(projectId);
  }

  @Get('requisitions')
  getRequisitions() {
    return this.procurementService.getRequisitions();
  }

  @Post('requisitions')
  createRequisition(@Body() body: any) {
    return this.procurementService.createRequisition(body);
  }

  @Get('rfqs')
  getRfqs() {
    return this.procurementService.getRfqs();
  }

  @Post('rfqs')
  createRfq(@Body() body: any) {
    return this.procurementService.createRfq(body);
  }

  @Post('rfqs/quotes')
  addVendorQuote(@Body() body: any) {
    return this.procurementService.addVendorQuote(body);
  }

  @Get('grns')
  getGrns() {
    return this.procurementService.getGrns();
  }

  @Post('grns')
  createGrn(@Body() body: any) {
    return this.procurementService.createGrn(body);
  }
}
