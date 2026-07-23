import { IsIn, IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';

export class AdjustStockDto {
  @IsIn(['inward', 'outward'])
  direction!: 'inward' | 'outward';

  @IsNumber()
  @IsPositive()
  quantity!: number;

  @IsString()
  @IsNotEmpty()
  reference!: string;
}
