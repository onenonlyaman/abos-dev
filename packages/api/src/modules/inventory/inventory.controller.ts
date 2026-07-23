import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { InventoryService } from './inventory.service';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('skus')
  getSkus(@Query('projectId') projectId?: string) {
    return this.inventoryService.getSkus(projectId);
  }

  @Get('godowns')
  getGodowns() {
    return this.inventoryService.getGodowns();
  }

  @Post('godowns')
  createGodown(@Body() body: any) {
    return this.inventoryService.createGodown(body);
  }

  @Get('transfers')
  getStockTransfers() {
    return this.inventoryService.getStockTransfers();
  }

  @Post('transfers')
  createStockTransfer(@Body() body: any) {
    return this.inventoryService.createStockTransfer(body);
  }

  @Get('issue-slips')
  getMaterialIssueSlips() {
    return this.inventoryService.getMaterialIssueSlips();
  }

  @Post('issue-slips')
  createMaterialIssueSlip(@Body() body: any) {
    return this.inventoryService.createMaterialIssueSlip(body);
  }

  @Get('audits')
  getStockAudits() {
    return this.inventoryService.getStockAudits();
  }

  @Post('audits')
  createStockAudit(@Body() body: any) {
    return this.inventoryService.createStockAudit(body);
  }
}
