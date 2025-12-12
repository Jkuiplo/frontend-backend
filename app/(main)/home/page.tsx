'use client';

import { useMemo, useState, useEffect } from 'react';
import { Wallet as WalletIcon, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useAuthStore } from '@/store/useAuthStore';
import { useTransactionStore } from '@/store/useTransactionStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useModalStore } from '@/store/useModalStore';
import { getUserWallets, getUserCategories } from '@/lib/userData';
import { formatCurrency } from '@/lib/currencyUtils';
import { translations } from '@/lib/translations';
import {
  formatDateTime,
  getCategoryIconComponent,
  getWalletIconComponent,
} from '@/lib/utils';

export default function MainWalletPage() {
  const { user } = useAuthStore();
  const { getUserTransactions, transactionUpdated } = useTransactionStore();
  const { currency, language } = useSettingsStore();
  const { openModal } = useModalStore();
  const t = translations[language];

  useEffect(() => {
    if (transactionUpdated !== undefined) {
    }
  }, [transactionUpdated]);

  const transactions = useMemo(() => {
    if (!user) return [];
    return getUserTransactions(user.id);
  }, [user, getUserTransactions]);

  const wallets = useMemo(() => {
    if (!user) return [];
    return getUserWallets(user.id);
  }, [user]);

  const categories = useMemo(() => {
    if (!user) return [];
    return getUserCategories(user.id);
  }, [user]);

  const [insufficientFundsWarning, setInsufficientFundsWarning] =
    useState<string>('');
  const [checkedTransactions, setCheckedTransactions] = useState<Set<string>>(
    new Set()
  );

  const globalBalance = useMemo(() => {
    return wallets.reduce((sum, w) => sum + w.amount, 0);
  }, [wallets]);

  const { warnings } = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const warningsList: string[] = [];

    const monthTransactions = transactions.filter(
      (tx) => new Date(tx.date) >= startOfMonth
    );

    monthTransactions
      .filter((tx) => tx.type === 'expense')
      .forEach((tx) => {
        const wallet = wallets.find((w) => w.id === tx.walletId);
        if (wallet && wallet.amount < 0 && !checkedTransactions.has(tx.id)) {
          warningsList.push(
            `Warning: Wallet "${wallet.name}" has negative balance: ${formatCurrency(wallet.amount, currency)}`
          );
        }
      });

    return {
      warnings: warningsList,
    };
  }, [transactions, wallets, currency, checkedTransactions]);

  useEffect(() => {
    if (warnings.length > 0) {
      setInsufficientFundsWarning(warnings[0]);
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthTransactions = transactions.filter(
        (tx) => new Date(tx.date) >= startOfMonth && tx.type === 'expense'
      );

      const newChecked = new Set(checkedTransactions);
      monthTransactions.forEach((tx) => {
        const wallet = wallets.find((w) => w.id === tx.walletId);
        if (wallet && wallet.amount < 0) {
          newChecked.add(tx.id);
        }
      });
      setCheckedTransactions(newChecked);
    }
  }, [warnings, transactions, wallets, checkedTransactions]);

  useEffect(() => {
    if (insufficientFundsWarning) {
      const timer = setTimeout(() => {
        setInsufficientFundsWarning('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [insufficientFundsWarning]);

  const recentTransactions = useMemo(() => {
    return transactions
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [transactions]);

  const getCategoryInfo = (categoryId?: string) => {
    if (!categoryId) return { name: 'Income', icon: WalletIcon };
    const category = categories.find((c) => c.id === categoryId);
    return {
      name: category?.name || 'Unknown',
      icon: getCategoryIconComponent(category?.icon || 'ShoppingCart'),
    };
  };

  const getWalletInfo = (walletId: number) => {
    const wallet = wallets.find((w) => w.id === walletId);
    return {
      name: wallet?.name || 'Unknown',
      icon: getWalletIconComponent(wallet?.icon || 'Wallet'),
    };
  };

  const calculateMonthBalance = (type: 'income' | 'expense') => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return transactions
      .filter((tx) => tx.type === type && new Date(tx.date) >= startOfMonth)
      .reduce((sum, tx) => sum + tx.amount, 0);
  };

  const monthlyIncome = calculateMonthBalance('income');
  const monthlyExpense = calculateMonthBalance('expense');

  return (
    <div className="mx-auto max-w-6xl p-4">
      {insufficientFundsWarning && (
        <div className="mb-4 p-4 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <span>{insufficientFundsWarning}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-secondary">
              <WalletIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Total Balance</div>
              <div className="text-3xl font-bold">
                {formatCurrency(globalBalance, currency)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {wallets.length} wallet{wallets.length !== 1 ? 's' : ''} total
              </div>
            </div>
          </div>
        </Card>

        <Card className="rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-secondary">
              <div className="text-green-500 text-2xl font-bold">+</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">
                {t.incomes} (Month)
              </div>
              <div className="text-3xl font-bold text-green-500">
                +{formatCurrency(monthlyIncome, currency)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                This month
              </div>
            </div>
          </div>
        </Card>

        <Card className="rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-secondary">
              <div className="text-red-500 text-2xl font-bold">-</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">
                {t.expenses} (Month)
              </div>
              <div className="text-3xl font-bold text-red-500">
                -{formatCurrency(monthlyExpense, currency)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                This month
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card className="rounded-3xl p-6">
        <h2 className="text-2xl font-bold mb-6">Recent Transactions</h2>

        <div className="space-y-3">
          {recentTransactions.map((transaction) => {
            const isIncome = transaction.type === 'income';

            if (isIncome) {
              const walletInfo = getWalletInfo(transaction.walletId);
              const WalletIconComponent = walletInfo.icon;

              return (
                <Card
                  key={transaction.id}
                  className="p-5 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => openModal('editTransaction', { transaction })}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-secondary">
                      <WalletIconComponent className="w-6 h-6 text-green-500" />
                    </div>
                    <div>
                      <div className="font-semibold text-lg">Income</div>
                      <div className="text-sm text-muted-foreground">
                        {walletInfo.name}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-bold text-lg text-green-500">
                      +{formatCurrency(transaction.amount, currency)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatDateTime(transaction.date)}
                    </div>
                  </div>
                </Card>
              );
            } else {
              const categoryInfo = getCategoryInfo(transaction.categoryId);
              const walletInfo = getWalletInfo(transaction.walletId);
              const CategoryIconComponent = categoryInfo.icon;

              return (
                <Card
                  key={transaction.id}
                  className="p-5 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => openModal('editTransaction', { transaction })}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-secondary">
                      <CategoryIconComponent className="w-6 h-6 text-red-500" />
                    </div>
                    <div>
                      <div className="font-semibold text-lg">
                        {categoryInfo.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Expense • {walletInfo.name}
                      </div>
                      {transaction.comment && (
                        <div className="text-sm text-foreground mt-1">
                          {transaction.comment}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-bold text-lg text-red-500">
                      -{formatCurrency(transaction.amount, currency)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatDateTime(transaction.date)}
                    </div>
                  </div>
                </Card>
              );
            }
          })}

          {recentTransactions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No transactions yet
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
