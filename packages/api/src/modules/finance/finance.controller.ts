import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { CreateBudgetLineDto } from './dto/create-budget-line.dto';

@Controller('budget-lines')
export class FinanceController {
  constructor(private readonly finance: FinanceService) {}

  @Post()
  create(@Body() dto: CreateBudgetLineDto) {
    return this.finance.createBudgetLine(dto);
  }

  @Get()
  list(@Query('projectId') projectId?: string) {
    return this.finance.listBudgetLines(projectId);
  }
}
