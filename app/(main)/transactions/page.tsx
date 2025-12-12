'use client';

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { useAuthStore } from '@/store/useAuthStore';
import { useTransactionStore } from '@/store/useTransactionStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useModalStore } from '@/store/useModalStore';
import { getUserCategories, getUserWallets } from '@/lib/userData';
import { formatCurrency } from '@/lib/currencyUtils';
import { translations } from '@/lib/translations';
import { Search, Calendar, DollarSign, ArrowUp, ArrowDown } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import {
  formatDateTime,
  getCategoryIconComponent,
  getWalletIconComponent,
} from '@/lib/utils';

type SortField = 'date' | 'amount';
type SortOrder = 'asc' | 'desc';
type DateFilterType = 'all' | 'week' | 'month' | 'year';

export default function TransactionsPage() {
  const { user } = useAuthStore();
  const { getUserTransactions } = useTransactionStore();
  const { currency, language } = useSettingsStore();
  const { openModal } = useModalStore();
  const t = translations[language];

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [dateFilter, setDateFilter] = useState<DateFilterType>('all');

  const transactions = useMemo(() => {
    if (!user) return [];
    return getUserTransactions(user.id);
  }, [user, getUserTransactions]);

  const categories = useMemo(() => {
    if (!user) return [];
    return getUserCategories(user.id);
  }, [user]);

  const wallets = useMemo(() => {
    if (!user) return [];
    return getUserWallets(user.id);
  }, [user]);

  const filteredTransactions = useMemo(() => {
    const now = new Date();

    return transactions
      .filter((t) => {
        const matchesSearch =
          t.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (t.type === 'expense' &&
            categories
              .find((c) => c.id === t.categoryId)
              ?.name.toLowerCase()
              .includes(searchQuery.toLowerCase())) ||
          wallets
            .find((w) => w.id === t.walletId)
            ?.name.toLowerCase()
            .includes(searchQuery.toLowerCase());

        const matchesCategory =
          selectedCategory === 'all' || t.categoryId === selectedCategory;

        let matchesDate = true;
        const tDate = new Date(t.date);

        if (dateFilter !== 'all') {
          const diffTime = Math.abs(now.getTime() - tDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          if (dateFilter === 'week') matchesDate = diffDays <= 7;
          else if (dateFilter === 'month') matchesDate = diffDays <= 30;
          else if (dateFilter === 'year') matchesDate = diffDays <= 365;
        }

        return matchesSearch && matchesCategory && matchesDate;
      })
      .sort((a, b) => {
        let comparison = 0;
        if (sortBy === 'date') {
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
        } else {
          comparison = a.amount - b.amount;
        }
        return sortOrder === 'asc' ? comparison : -comparison;
      });
  }, [
    transactions,
    searchQuery,
    selectedCategory,
    dateFilter,
    sortBy,
    sortOrder,
    categories,
    wallets,
  ]);

  const toggleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortBy !== field) return null;

    return sortOrder === 'asc' ? (
      <ArrowUp className="w-4 h-4 ml-1.5" />
    ) : (
      <ArrowDown className="w-4 h-4 ml-1.5" />
    );
  };

  const getCategoryInfo = (categoryId?: string) => {
    if (!categoryId)
      return { name: 'Income', icon: getWalletIconComponent('Wallet') };
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

  return (
    <div className="mx-auto min-h-screen max-w-6xl p-4">
      <Card className="rounded-3xl p-6 mb-6 shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-4">
            <label className="block mb-1.5 text-xs font-bold text-muted-foreground uppercase tracking-wide">
              {t.search}
            </label>
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`${t.search}...`}
                className="pl-10"
              />
            </div>
          </div>

          <div className="md:col-span-3">
            <label className="block mb-1.5 text-xs font-bold text-muted-foreground uppercase tracking-wide">
              {t.selectCategory}
            </label>
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.allTime}</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-3">
            <label className="block mb-1.5 text-xs font-bold text-muted-foreground uppercase tracking-wide">
              {t.timePeriod}
            </label>
            <Select
              value={dateFilter}
              onValueChange={(value: DateFilterType) => setDateFilter(value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.allTime}</SelectItem>
                <SelectItem value="week">{t.lastWeek}</SelectItem>
                <SelectItem value="month">{t.lastMonth}</SelectItem>
                <SelectItem value="year">{t.lastYear}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-2 flex gap-2">
            <button
              onClick={() => toggleSort('date')}
              className={`flex-1 flex justify-center items-center p-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                sortBy === 'date'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary hover:bg-secondary/80'
              }`}
            >
              <Calendar className="w-4 h-4" />
              {getSortIcon('date')}
            </button>

            <button
              onClick={() => toggleSort('amount')}
              className={`flex-1 flex justify-center items-center p-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                sortBy === 'amount'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary hover:bg-secondary/80'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              {getSortIcon('amount')}
            </button>
          </div>
        </div>
      </Card>

      <Card className="rounded-3xl p-8 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">{t.transactions}</h2>
          <span className="text-sm font-medium px-3 py-1 rounded-full bg-secondary text-secondary-foreground">
            {filteredTransactions.length} items
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredTransactions.map((transaction) => {
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
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-secondary">
                      <WalletIconComponent className="w-6 h-6 text-green-500" />
                    </div>
                    <div>
                      <div className="font-semibold">Income</div>
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
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-secondary">
                      <CategoryIconComponent className="w-6 h-6 text-red-500" />
                    </div>
                    <div>
                      <div className="font-semibold">{categoryInfo.name}</div>
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
        </div>

        {filteredTransactions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-secondary">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">No transactions found</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Try adjusting your filters
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
