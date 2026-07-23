import { Controller, Get, Post, Body } from '@nestjs/common';
import { AccountingService } from './accounting.service';

@Controller('accounting')
export class AccountingController {
  constructor(private readonly accountingService: AccountingService) {}

  @Get('invoices')
  getInvoices() {
    return this.accountingService.getInvoices();
  }

  @Post('invoices')
  createInvoice(@Body() body: any) {
    return this.accountingService.createInvoice(body);
  }

  @Get('credit-notes')
  getCreditNotes() {
    return this.accountingService.getCreditNotes();
  }

  @Post('credit-notes')
  createCreditNote(@Body() body: any) {
    return this.accountingService.createCreditNote(body);
  }

  @Get('debit-notes')
  getDebitNotes() {
    return this.accountingService.getDebitNotes();
  }

  @Post('debit-notes')
  createDebitNote(@Body() body: any) {
    return this.accountingService.createDebitNote(body);
  }

  @Get('journal-entries')
  getJournalEntries() {
    return this.accountingService.getJournalEntries();
  }

  @Post('journal-entries')
  createJournalEntry(@Body() body: any) {
    return this.accountingService.createJournalEntry(body);
  }

  @Get('trial-balance')
  getTrialBalance() {
    return this.accountingService.getTrialBalance();
  }

  @Get('fixed-assets')
  getFixedAssets() {
    return this.accountingService.getFixedAssets();
  }

  @Post('fixed-assets')
  createFixedAsset(@Body() body: any) {
    return this.accountingService.createFixedAsset(body);
  }
}
