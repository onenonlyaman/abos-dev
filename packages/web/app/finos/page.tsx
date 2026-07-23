'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Stat } from '@/components/ui/stat';
import { EmptyState } from '@/components/ui/empty-state';
import { Disclosure } from '@/components/ui/disclosure';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Select } from '@/components/ui/select';
import { api, ApiError } from '@/lib/api';
import { Landmark, Wallet, ArrowUpRight, ArrowDownRight, CreditCard, PlusCircle } from 'lucide-react';

interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountType: string;
  balance: number;
  branch: string;
}

interface CashPosition {
  totalCash: number;
  accountCount: number;
}

interface Transaction {
  id: string;
  payee: string;
  type: string;
  amount: number;
  status: string;
  transactedAt: string;
}

export default function FinosPage() {
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [cashPosition, setCashPosition] = useState<CashPosition | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // Form states
  const [bankName, setBankName] = useState('');
  const [accNo, setAccNo] = useState('');
  const [accType, setAccType] = useState('Current');
  const [initialBalance, setInitialBalance] = useState('');

  const [txPayee, setTxPayee] = useState('');
  const [txType, setTxType] = useState('CREDIT');
  const [txAmount, setTxAmount] = useState('');
  const [txAccountId, setTxAccountId] = useState('');

  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const [accs, cash, txs] = await Promise.all([
        api.get<BankAccount[]>('/finos/bank-accounts'),
        api.get<CashPosition>('/finos/cash-position'),
        api.get<Transaction[]>('/finos/transactions'),
      ]);
      setBankAccounts(accs);
      setCashPosition(cash);
      setTransactions(txs);
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : 'Failed to load FinOS data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreateAccount = async () => {
    if (!bankName || !accNo) return;
    setBusy(true);
    try {
      await api.post('/finos/bank-accounts', {
        bankName,
        accountNumber: accNo,
        accountType: accType,
        balance: Number(initialBalance) || 0,
      });
      setBankName('');
      setAccNo('');
      setInitialBalance('');
      await load();
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : 'Failed to register bank account');
    } finally {
      setBusy(false);
    }
  };

  const handleCreateTransaction = async () => {
    if (!txPayee || !txAmount) return;
    setBusy(true);
    try {
      await api.post('/finos/transactions', {
        payee: txPayee,
        type: txType,
        amount: Number(txAmount) || 0,
        bankAccountId: txAccountId || undefined,
      });
      setTxPayee('');
      setTxAmount('');
      await load();
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : 'Failed to record transaction voucher');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-7">
      <PageHeader
        title="Financial Operating System (FinOS) & Treasury"
        description="RERA Escrow Accounts, bank reconciliations, cash flow treasury, and payment ledgers."
      />

      {err && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl">{err}</div>}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat icon={Landmark} tone="brand" value={`₹ ${Number(cashPosition?.totalCash ?? 0).toLocaleString()}`} label="Total Treasury Cash" sub={`${bankAccounts.length} Bank Accounts`} />
        <Stat icon={Wallet} tone="green" value={String(cashPosition?.accountCount ?? 0)} label="Accounts Managed" sub="Live DB query" />
        <Stat icon={ArrowUpRight} tone="blue" value={String(transactions.filter((t) => t.type === 'CREDIT').length)} label="Inflow Vouchers" sub="Recorded transactions" />
        <Stat icon={ArrowDownRight} tone="amber" value={String(transactions.filter((t) => t.type === 'DEBIT').length)} label="Outflow Vouchers" sub="Disbursals" />
      </div>

      {/* Action Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Disclosure title="Register New Corporate / RERA Escrow Account">
          <div className="space-y-3">
            <Field label="Bank Name" placeholder="e.g. HDFC Bank - BKC Branch" value={bankName} onChange={(e) => setBankName(e.target.value)} />
            <Field label="Account Number" placeholder="5020004918231" value={accNo} onChange={(e) => setAccNo(e.target.value)} />
            <div className="grid grid-cols-2 gap-3">
              <Select label="Account Type" value={accType} onChange={(e) => setAccType(e.target.value)}>
                <option value="Current">Current Operating</option>
                <option value="RERA Escrow">RERA Escrow</option>
                <option value="Savings">Savings Treasury</option>
              </Select>
              <Field label="Initial Balance (₹)" type="number" placeholder="5000000" value={initialBalance} onChange={(e) => setInitialBalance(e.target.value)} />
            </div>
            <Button size="sm" className="w-full" disabled={busy || !bankName || !accNo} onClick={handleCreateAccount}>
              <PlusCircle className="w-3.5 h-3.5 mr-1.5" /> Register Bank Account
            </Button>
          </div>
        </Disclosure>

        <Disclosure title="Log Bank Transaction Voucher">
          <div className="space-y-3">
            <Field label="Payee / Source" placeholder="Customer Milestone / Vendor Disbursal" value={txPayee} onChange={(e) => setTxPayee(e.target.value)} />
            <div className="grid grid-cols-2 gap-3">
              <Select label="Voucher Type" value={txType} onChange={(e) => setTxType(e.target.value)}>
                <option value="CREDIT">Inflow (CREDIT)</option>
                <option value="DEBIT">Outflow (DEBIT)</option>
              </Select>
              <Field label="Amount (₹)" type="number" placeholder="250000" value={txAmount} onChange={(e) => setTxAmount(e.target.value)} />
            </div>
            <Select label="Bank Account" value={txAccountId} onChange={(e) => setTxAccountId(e.target.value)}>
              <option value="">Select account (or default first)</option>
              {bankAccounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.bankName} ({a.accountNumber})
                </option>
              ))}
            </Select>
            <Button size="sm" className="w-full" disabled={busy || !txPayee || !txAmount} onClick={handleCreateTransaction}>
              <PlusCircle className="w-3.5 h-3.5 mr-1.5" /> Record Voucher
            </Button>
          </div>
        </Disclosure>
      </div>

      {/* Bank Accounts Grid */}
      <Card>
        <CardHeader title="Corporate Bank Accounts & Escrow Pools" description="Real-time balances queried from database" />
        <CardBody className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {bankAccounts.length === 0 ? (
            <div className="col-span-full p-4">
              <EmptyState icon={Landmark} title="No bank accounts registered" description="Register a bank account using the action panel above." />
            </div>
          ) : (
            bankAccounts.map((b) => (
              <div key={b.id} className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <Badge tone="blue">{b.accountType}</Badge>
                  <CreditCard className="w-4 h-4 text-zinc-500" />
                </div>
                <div>
                  <div className="font-semibold text-sm text-zinc-100">{b.bankName}</div>
                  <div className="text-xs font-mono text-zinc-500 mt-0.5">Acc: {b.accountNumber}</div>
                </div>
                <div className="pt-2 border-t border-zinc-800/80">
                  <div className="text-xs text-zinc-400">Available Balance</div>
                  <div className="text-lg font-bold font-mono text-emerald-400">₹ {Number(b.balance).toLocaleString()}</div>
                </div>
              </div>
            ))
          )}
        </CardBody>
      </Card>

      {/* Live Transaction Ledger */}
      <Card>
        <CardHeader title="Recent Bank Transactions & Cleared Vouchers" description="Latest inflow and outflow activity from database" />
        <CardBody className="p-0">
          {transactions.length === 0 ? (
            <div className="p-5">
              <EmptyState icon={CreditCard} title="No transactions logged" description="Record your first voucher using the action panel above." />
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-950 text-zinc-400 uppercase border-b border-zinc-800">
                <tr>
                  <th className="p-3.5">Payee / Source</th>
                  <th className="p-3.5">Type</th>
                  <th className="p-3.5">Amount</th>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800 text-zinc-200">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-zinc-900/60 transition">
                    <td className="p-3.5 font-medium text-zinc-100">{tx.payee}</td>
                    <td className="p-3.5 text-zinc-400">{tx.type}</td>
                    <td className={`p-3.5 font-mono font-semibold ${tx.type === 'CREDIT' ? 'text-emerald-400' : 'text-red-400'}`}>
                      ₹ {Number(tx.amount).toLocaleString()}
                    </td>
                    <td className="p-3.5 text-zinc-400">{new Date(tx.transactedAt).toLocaleDateString()}</td>
                    <td className="p-3.5">
                      <Badge tone="green">{tx.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
