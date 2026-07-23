import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { FinosService } from './finos.service';

@Controller('finos')
export class FinosController {
  constructor(private readonly finosService: FinosService) {}

  @Get('bank-accounts')
  getBankAccounts(@Query('projectId') projectId?: string) {
    return this.finosService.getBankAccounts(projectId);
  }

  @Post('bank-accounts')
  createBankAccount(@Body() body: any) {
    return this.finosService.createBankAccount(body);
  }

  @Get('transactions')
  getTransactions(@Query('bankAccountId') bankAccountId?: string) {
    return this.finosService.getTransactions(bankAccountId);
  }

  @Post('transactions')
  createTransaction(@Body() body: any) {
    return this.finosService.createTransaction(body);
  }

  @Get('cash-position')
  getCashPositionSummary() {
    return this.finosService.getCashPositionSummary();
  }
}
