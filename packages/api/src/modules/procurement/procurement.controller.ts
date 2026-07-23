import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { IsUUID } from 'class-validator';
import { ProcurementService } from './procurement.service';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';

class ApprovePurchaseOrderDto {
  @IsUUID()
  approvedById!: string;
}

@Controller('vendors')
export class VendorController {
  constructor(private readonly procurement: ProcurementService) {}

  @Post()
  create(@Body() dto: CreateVendorDto) {
    return this.procurement.createVendor(dto);
  }

  @Get()
  list() {
    return this.procurement.listVendors();
  }
}

@Controller('purchase-orders')
export class PurchaseOrderController {
  constructor(private readonly procurement: ProcurementService) {}

  @Post()
  create(@Body() dto: CreatePurchaseOrderDto) {
    return this.procurement.createPurchaseOrder(dto);
  }

  @Get()
  list(@Query('projectId') projectId?: string) {
    return this.procurement.listPurchaseOrders(projectId);
  }

  @Post(':id/approve')
  approve(@Param('id') id: string, @Body() dto: ApprovePurchaseOrderDto) {
    return this.procurement.approvePurchaseOrder(id, dto.approvedById);
  }
}
