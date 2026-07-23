import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateSkuDto {
  @IsUUID()
  projectId!: string;

  @IsString()
  @IsNotEmpty()
  code!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  uom!: string;

  @IsOptional()
  @IsString()
  formula?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  safetyStock?: number;
}
