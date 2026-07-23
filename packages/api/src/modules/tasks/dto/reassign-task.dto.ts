import { IsNotEmpty, IsString, IsUUID, MinLength } from 'class-validator';

export class ReassignTaskDto {
  @IsUUID()
  reassignedById!: string;

  @IsUUID()
  toAssigneeId!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  reason!: string;
}
