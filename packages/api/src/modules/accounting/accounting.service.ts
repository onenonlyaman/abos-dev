import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AccountingService {
  constructor(private readonly prisma: PrismaService) {}

  async getInvoices() {
    return this.prisma.gstInvoice.findMany({
      include: { items: true },
      orderBy: { issuedAt: 'desc' },
    });
  }

  async createInvoice(data: any) {
    const subtotal = Number(data.subtotal || 0);
    const taxRate = 0.18; // 18% GST
    const cgst = (subtotal * taxRate) / 2;
    const sgst = (subtotal * taxRate) / 2;
    const totalAmount = subtotal + cgst + sgst;

    return this.prisma.gstInvoice.create({
      data: {
        invoiceNumber: data.invoiceNumber || `INV-${Date.now()}`,
        customerName: data.customerName,
        customerGstin: data.customerGstin || null,
        subtotal,
        cgstAmount: cgst,
        sgstAmount: sgst,
        totalAmount,
        dueDate: data.dueDate ? new Date(data.dueDate) : new Date(Date.now() + 30 * 86400000),
      },
    });
  }

  async getCreditNotes() {
    return this.prisma.creditNote.findMany({ orderBy: { issuedAt: 'desc' } });
  }

  async createCreditNote(data: any) {
    return this.prisma.creditNote.create({
      data: {
        noteNumber: data.noteNumber || `CN-${Date.now()}`,
        partyName: data.partyName,
        amount: Number(data.amount || 0),
        reason: data.reason || 'Customer Adjustment / Return',
      },
    });
  }

  async getDebitNotes() {
    return this.prisma.debitNote.findMany({ orderBy: { issuedAt: 'desc' } });
  }

  async createDebitNote(data: any) {
    return this.prisma.debitNote.create({
      data: {
        noteNumber: data.noteNumber || `DN-${Date.now()}`,
        vendorName: data.vendorName,
        amount: Number(data.amount || 0),
        reason: data.reason || 'Vendor Quantity Shortage / Rate Rejection',
      },
    });
  }

  async getJournalEntries() {
    return this.prisma.journalEntry.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async createJournalEntry(data: any) {
    return this.prisma.journalEntry.create({
      data: {
        entryNumber: data.entryNumber || `JRN-${Date.now()}`,
        accountName: data.accountName,
        debit: data.debit ? Number(data.debit) : 0,
        credit: data.credit ? Number(data.credit) : 0,
        narration: data.narration || 'General Ledger Adjustment',
      },
    });
  }

  async getTrialBalance() {
    const entries = await this.prisma.journalEntry.findMany();
    const accountsMap: Record<string, { accountName: string; totalDebit: number; totalCredit: number; balance: number }> = {};

    for (const entry of entries) {
      if (!accountsMap[entry.accountName]) {
        accountsMap[entry.accountName] = { accountName: entry.accountName, totalDebit: 0, totalCredit: 0, balance: 0 };
      }
      accountsMap[entry.accountName].totalDebit += Number(entry.debit);
      accountsMap[entry.accountName].totalCredit += Number(entry.credit);
      accountsMap[entry.accountName].balance = accountsMap[entry.accountName].totalDebit - accountsMap[entry.accountName].totalCredit;
    }

    return Object.values(accountsMap);
  }

  async getFixedAssets() {
    const assets = await this.prisma.fixedAsset.findMany();
    return assets.map((asset) => {
      const cost = Number(asset.purchaseCost);
      const rate = Number(asset.depreciationRate) / 100;
      const yearsOwned = (Date.now() - new Date(asset.purchasedAt).getTime()) / (365 * 86400000);
      const accumulatedDepreciation = Math.min(cost, cost * rate * Math.max(0, yearsOwned));
      const netBookValue = Math.max(0, cost - accumulatedDepreciation);
      return {
        ...asset,
        accumulatedDepreciation,
        netBookValue,
      };
    });
  }

  async createFixedAsset(data: any) {
    return this.prisma.fixedAsset.create({
      data: {
        assetName: data.assetName,
        category: data.category || 'Machinery',
        purchaseCost: Number(data.purchaseCost || 0),
        currentValue: Number(data.purchaseCost || 0),
        depreciationRate: Number(data.depreciationRate || 15),
        purchasedAt: data.purchasedAt ? new Date(data.purchasedAt) : new Date(),
      },
    });
  }
}
