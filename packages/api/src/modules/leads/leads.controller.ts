import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { LeadState } from '@prisma/client';
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadStateDto } from './dto/update-lead-state.dto';

@Controller('leads')
export class LeadsController {
  constructor(private readonly leads: LeadsService) {}

  @Post()
  create(@Body() dto: CreateLeadDto) {
    return this.leads.create(dto);
  }

  @Get()
  list(@Query('state') state?: LeadState) {
    return this.leads.list(state);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.leads.get(id);
  }

  @Patch(':id/state')
  updateState(@Param('id') id: string, @Body() dto: UpdateLeadStateDto) {
    return this.leads.updateState(id, dto);
  }
}
