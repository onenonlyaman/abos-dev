import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateBookingDto {
  @IsUUID()
  unitId!: string;

  @IsString()
  @IsNotEmpty()
  customerName!: string;

  @IsString()
  @IsNotEmpty()
  customerPhone!: string;
}
