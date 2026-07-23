import { IsInt, IsNotEmpty, IsNumber, IsPositive, IsString, IsUUID, Min } from 'class-validator';

export class CreateUnitDto {
  @IsUUID()
  projectId!: string;

  @IsString()
  @IsNotEmpty()
  code!: string;

  @IsInt()
  @Min(0)
  floor!: number;

  @IsNumber()
  @IsPositive()
  areaSqft!: number;

  @IsNumber()
  @IsPositive()
  baseRate!: number;
}
