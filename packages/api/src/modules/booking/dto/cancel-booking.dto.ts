import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CancelBookingDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  reason!: string;
}
