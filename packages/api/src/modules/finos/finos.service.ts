import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class FinosService {
  constructor(private readonly prisma: PrismaService) {}

  async getBankAccounts(projectId?: string) {
    return this.prisma.bankAccount.findMany({
      where: projectId ? { projectId } : undefined,
      include: { transactions: { take: 5, orderBy: { transactedAt: 'desc' } } },
    });
  }

  async createBankAccount(data: any) {
    return this.prisma.bankAccount.create({
      data: {
        bankName: data.bankName,
        accountNumber: data.accountNumber,
        ifsc: data.ifsc || 'HDFC0000123',
        branch: data.branch || 'Corporate Branch',
        balance: data.balance ? Number(data.balance) : 0,
        accountType: data.accountType || 'Current',
      },
    });
  }

  async getTransactions(bankAccountId?: string) {
    return this.prisma.bankTransaction.findMany({
      where: bankAccountId ? { bankAccountId } : undefined,
      orderBy: { transactedAt: 'desc' },
    });
  }

  async createTransaction(data: any) {
    let bankAccountId = data.bankAccountId;
    if (!bankAccountId) {
      const acc = await this.prisma.bankAccount.findFirst();
      if (acc) bankAccountId = acc.id;
    }
    if (!bankAccountId) throw new Error('No bank account available');

    const amount = Number(data.amount || 0);
    const type = data.type || 'DEBIT';

    // Atomically update bank balance
    await this.prisma.bankAccount.update({
      where: { id: bankAccountId },
      data: {
        balance:
          type === 'CREDIT'
            ? { increment: amount }
            : { decrement: amount },
      },
    });

    return this.prisma.bankTransaction.create({
      data: {
        bankAccountId,
        type,
        amount,
        payee: data.payee || 'Direct Voucher',
        category: data.category || 'General',
        reference: data.reference || `REF-${Date.now()}`,
      },
    });
  }

  async getCashPositionSummary() {
    const accounts = await this.prisma.bankAccount.findMany();
    const totalCash = accounts.reduce((acc, a) => acc + Number(a.balance), 0);
    return {
      totalCash,
      accountCount: accounts.length,
      accounts: accounts.map((a) => ({ bank: a.bankName, balance: a.balance, type: a.accountType })),
    };
  }
}
