import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateSkuDto } from './dto/create-sku.dto';
import { AdjustStockDto } from './dto/adjust-stock.dto';

@Controller('skus')
export class InventoryController {
  constructor(private readonly inventory: InventoryService) {}

  @Post()
  create(@Body() dto: CreateSkuDto) {
    return this.inventory.createSku(dto);
  }

  @Get()
  list(@Query('projectId') projectId?: string) {
    return this.inventory.listSkus(projectId);
  }

  @Post(':id/adjust-stock')
  adjust(@Param('id') id: string, @Body() dto: AdjustStockDto) {
    return this.inventory.adjustStock(id, dto);
  }
}
