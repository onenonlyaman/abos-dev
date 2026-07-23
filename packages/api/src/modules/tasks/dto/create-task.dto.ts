import { IsDateString, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateTaskDto {
  @IsOptional()
  @IsUUID()
  projectId?: string;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsUUID()
  assignerId!: string;

  @IsUUID()
  assigneeId!: string;

  @IsDateString()
  targetDeadline!: string;
}
