import { IsNotEmpty, IsString } from 'class-validator';

export class CreateSpvDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  legalName!: string;

  @IsString()
  @IsNotEmpty()
  gstin!: string;
}
