'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useTransactionStore } from '@/store/useTransactionStore';
import { useModalStore } from '@/store/useModalStore';
import { getUserWallets, Wallet } from '@/lib/userData';
import { WalletEditCard } from '@/components/WalletEditCard';
import { Card } from '@/components/ui/card';
import { formatCurrency } from '@/lib/currencyUtils';
import { useSearchParams } from 'next/navigation';
import { formatDateTime, getWalletIconComponent } from '@/lib/utils';
import { useMemo } from 'react';

export default function WalletPage() {
  const { user } = useAuthStore();
  const { currency, language } = useSettingsStore();
  const { getUserTransactions } = useTransactionStore();
  const { openModal } = useModalStore();
  const searchParams = useSearchParams();
  const openWalletId = searchParams.get('open');

  const [wallets, setWallets] = useState<Wallet[]>([]);

  useEffect(() => {
    if (user?.id) {
      const userWallets = getUserWallets(user.id);
      setWallets(userWallets);
    }
  }, [user]);

  const handleUpdate = () => {
    if (user?.id) {
      const userWallets = getUserWallets(user.id);
      setWallets(userWallets);
    }
  };

  const transactions = useMemo(() => {
    if (!user) return [];
    return getUserTransactions(user.id);
  }, [user, getUserTransactions]);

  const recentTransactions = transactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  const getWalletInfo = (walletId: number) => {
    const wallet = wallets.find((w) => w.id === walletId);
    return {
      name: wallet?.name || 'Unknown',
      icon: getWalletIconComponent(wallet?.icon || 'Wallet'),
    };
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full min-h-screen p-6">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {wallets.map((wallet) => (
            <WalletEditCard
              key={wallet.id}
              wallet={wallet}
              iconName={wallet.icon}
              isOpen={wallet.id.toString() === openWalletId}
              onUpdate={handleUpdate}
            />
          ))}
        </div>

        <Card className="rounded-3xl p-8 shadow-lg">
          <h2 className="text-3xl font-bold mb-6">
            {language === 'ru' ? 'Последние транзакции' : 'Recent Transactions'}
          </h2>

          <div className="space-y-3">
            {recentTransactions.map((transaction) => {
              const isIncome = transaction.type === 'income';
              const walletInfo = getWalletInfo(transaction.walletId);
              const WalletIconComponent = walletInfo.icon;

              if (isIncome) {
                return (
                  <Card
                    key={transaction.id}
                    className="p-5 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() =>
                      openModal('editTransaction', { transaction })
                    }
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
                return (
                  <Card
                    key={transaction.id}
                    className="p-5 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() =>
                      openModal('editTransaction', { transaction })
                    }
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-secondary">
                        <WalletIconComponent className="w-6 h-6 text-red-500" />
                      </div>
                      <div>
                        <div className="font-semibold text-lg">
                          {transaction.comment || 'Expense'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Expense • {walletInfo.name}
                        </div>
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
                {language === 'ru' ? 'Нет транзакций' : 'No transactions yet'}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
