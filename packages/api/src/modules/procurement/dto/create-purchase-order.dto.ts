import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsNumber, IsPositive, IsUUID, ValidateNested } from 'class-validator';

export class PurchaseOrderLineInput {
  @IsUUID()
  skuId!: string;

  @IsNumber()
  @IsPositive()
  quantity!: number;

  @IsNumber()
  @IsPositive()
  actualCost!: number;
}

export class CreatePurchaseOrderDto {
  @IsUUID()
  vendorId!: string;

  @IsUUID()
  projectId!: string;

  @IsUUID()
  createdById!: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PurchaseOrderLineInput)
  lines!: PurchaseOrderLineInput[];
}
