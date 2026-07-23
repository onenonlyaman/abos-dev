import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { LeadState, LostReason } from '@prisma/client';

export class UpdateLeadStateDto {
  @IsEnum(LeadState)
  state!: LeadState;

  @IsOptional()
  @IsEnum(LostReason)
  lostReason?: LostReason;

  @IsOptional()
  @IsUUID()
  unitId?: string;
}
