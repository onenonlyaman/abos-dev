import { Module } from '@nestjs/common';
import { ProcurementService } from './procurement.service';
import { VendorController, PurchaseOrderController } from './procurement.controller';

@Module({
  controllers: [VendorController, PurchaseOrderController],
  providers: [ProcurementService],
})
export class ProcurementModule {}
