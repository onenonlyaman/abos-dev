import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateVehicleDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  plateNumber!: string;

  @IsOptional()
  @IsUUID()
  assignedProjectId?: string;
}
