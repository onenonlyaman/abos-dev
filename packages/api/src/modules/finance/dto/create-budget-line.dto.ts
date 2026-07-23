import { IsNumber, IsPositive, IsUUID } from 'class-validator';

export class CreateBudgetLineDto {
  @IsUUID()
  projectId!: string;

  @IsUUID()
  skuId!: string;

  @IsNumber()
  @IsPositive()
  allocatedCap!: number;

  @IsNumber()
  @IsPositive()
  expectedQty!: number;
}
