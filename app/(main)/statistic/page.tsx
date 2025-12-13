'use client';

import { useEffect, useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { useAuthStore } from '@/store/useAuthStore';
import { useTransactionStore } from '@/store/useTransactionStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { getUserCategories, getUserWallets } from '@/lib/userData';
import { formatCurrency } from '@/lib/currencyUtils';
import { translations } from '@/lib/translations';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Pie,
  PieChart,
  Line,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { ChartConfig, ChartContainer } from '@/components/ui/chart';
import { getCategoryIconComponent, getWalletIconComponent } from '@/lib/utils';

type TimePeriod = 'week' | 'month' | 'year' | 'all';

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: {
      name: string;
      value: number;
      percentage: number;
      date: string;
    };
    value: number;
  }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-background border rounded-lg p-3 shadow-lg">
        <p className="font-medium">{label || data.date}</p>
        <p className="text-sm text-muted-foreground">
          Balance: {formatCurrency(data.value, 'USD')}
        </p>
      </div>
    );
  }
  return null;
};

const PieTooltip = ({ active, payload }: TooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-background border rounded-lg p-3 shadow-lg">
        <p className="font-medium">{data.name}</p>
        <p className="text-sm text-muted-foreground">
          Amount: {formatCurrency(data.value, 'USD')}
        </p>
        <p className="text-sm text-muted-foreground">
          Percentage: {data.percentage}%
        </p>
      </div>
    );
  }
  return null;
};

export default function StatisticsPage() {
  const { user } = useAuthStore();
  const { getUserTransactions, transactionUpdated } = useTransactionStore();
  const { currency, language } = useSettingsStore();
  const t = translations[language];

  const [timePeriod, setTimePeriod] = useState<TimePeriod>('month');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setRefreshKey((prev) => prev + 1);
  }, [transactionUpdated]);

  const transactions = useMemo(() => {
    if (!user) return [];
    return getUserTransactions(user.id);
  }, [user, getUserTransactions, refreshKey]);

  const categories = useMemo(() => {
    if (!user) return [];
    return getUserCategories(user.id);
  }, [user, refreshKey]);

  const wallets = useMemo(() => {
    if (!user) return [];
    return getUserWallets(user.id);
  }, [user, refreshKey]);

  // Фильтрация транзакций по периоду
  const filteredTransactions = useMemo(() => {
    if (timePeriod === 'all') return transactions;

    const now = new Date();
    const startDate = new Date();

    switch (timePeriod) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    return transactions.filter((tx) => new Date(tx.date) >= startDate);
  }, [transactions, timePeriod]);

  // Общий баланс кошельков
  const totalWalletBalance = useMemo(() => {
    return wallets.reduce((sum, wallet) => sum + wallet.amount, 0);
  }, [wallets]);

  // Баланс за период (только изменения)
  const periodBalanceChange = useMemo(() => {
    return filteredTransactions.reduce((acc, tx) => {
      return tx.type === 'income' ? acc + tx.amount : acc - tx.amount;
    }, 0);
  }, [filteredTransactions]);

  // Данные для графика баланса
  const balanceTrendData = useMemo(() => {
    if (filteredTransactions.length === 0) {
      return [{ date: 'No data', balance: totalWalletBalance }];
    }

    // Сортируем транзакции
    const sortedTransactions = [...filteredTransactions].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Группируем по датам
    const dateMap: Map<string, number> = new Map();
    let cumulativeBalance = totalWalletBalance - periodBalanceChange;

    sortedTransactions.forEach((tx) => {
      const date = new Date(tx.date);
      let key = '';

      switch (timePeriod) {
        case 'week':
          key = date.toLocaleDateString('en-US', { weekday: 'short' });
          break;
        case 'month':
          key = date.toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'short',
          });
          break;
        case 'year':
          key = date.toLocaleDateString('en-US', { month: 'short' });
          break;
        case 'all':
          key = date.toLocaleDateString('en-US', {
            month: 'short',
            year: 'numeric',
          });
          break;
      }

      if (tx.type === 'income') {
        cumulativeBalance += tx.amount;
      } else {
        cumulativeBalance -= tx.amount;
      }

      dateMap.set(key, cumulativeBalance);
    });

    return Array.from(dateMap.entries()).map(([date, balance]) => ({
      date,
      balance,
    }));
  }, [
    filteredTransactions,
    timePeriod,
    totalWalletBalance,
    periodBalanceChange,
  ]);

  // Данные для диаграммы категорий
  const categoryDistributionData = useMemo(() => {
    const expensesByCategory: Record<
      string,
      { name: string; value: number; icon: string }
    > = {};

    filteredTransactions
      .filter((tx) => tx.type === 'expense' && tx.categoryId)
      .forEach((tx) => {
        if (tx.categoryId) {
          const category = categories.find((c) => c.id === tx.categoryId);
          if (category) {
            if (!expensesByCategory[category.id]) {
              expensesByCategory[category.id] = {
                name: category.name,
                value: 0,
                icon: category.icon,
              };
            }
            expensesByCategory[category.id].value += tx.amount;
          }
        }
      });

    const total = Object.values(expensesByCategory).reduce(
      (sum, item) => sum + item.value,
      0
    );

    return Object.values(expensesByCategory)
      .map((item) => ({
        ...item,
        percentage: total > 0 ? Math.round((item.value / total) * 100) : 0,
      }))
      .sort((a, b) => b.value - a.value);
  }, [filteredTransactions, categories]);

  // Топ транзакции
  const topTransactionsData = useMemo(() => {
    const incomeGroups: Record<
      string,
      { name: string; amount: number; type: 'income'; icon: string }
    > = {};
    const expenseGroups: Record<
      string,
      { name: string; amount: number; type: 'expense'; icon: string }
    > = {};

    filteredTransactions.forEach((tx) => {
      if (tx.type === 'income') {
        const wallet = wallets.find((w) => w.id === tx.walletId);
        const walletName = wallet?.name || 'Unknown Wallet';
        const walletIcon = wallet?.icon || 'Wallet';

        if (!incomeGroups[walletName]) {
          incomeGroups[walletName] = {
            name: walletName,
            amount: 0,
            type: 'income',
            icon: walletIcon,
          };
        }
        incomeGroups[walletName].amount += tx.amount;
      } else {
        const category = categories.find((c) => c.id === tx.categoryId);
        const categoryName = category?.name || 'Unknown Category';
        const categoryIcon = category?.icon || 'ShoppingCart';

        if (!expenseGroups[categoryName]) {
          expenseGroups[categoryName] = {
            name: categoryName,
            amount: 0,
            type: 'expense',
            icon: categoryIcon,
          };
        }
        expenseGroups[categoryName].amount += tx.amount;
      }
    });

    const allGroups = [
      ...Object.values(incomeGroups),
      ...Object.values(expenseGroups),
    ].sort((a, b) => b.amount - a.amount);

    return allGroups;
  }, [filteredTransactions, categories, wallets]);

  // Конфигурация графиков
  const chartConfig = {
    balance: {
      label: 'Balance',
      color: 'var(--chart-1)',
    },
    ...categoryDistributionData.reduce((config, item, index) => {
      config[`category${index}`] = {
        label: item.name,
        color: `var(--chart-${(index % 5) + 1})`,
      };
      return config;
    }, {} as ChartConfig),
  } satisfies ChartConfig;

  const pieChartData = categoryDistributionData.map((item, index) => ({
    name: item.name,
    visitors: item.value,
    fill: `var(--chart-${(index % 5) + 1})`,
    percentage: item.percentage,
    value: item.value,
  }));

  const pieChartConfig = {
    visitors: {
      label: 'Amount',
    },
    ...categoryDistributionData.reduce((config, item, index) => {
      config[`category${index}`] = {
        label: item.name,
        color: `var(--chart-${(index % 5) + 1})`,
      };
      return config;
    }, {} as ChartConfig),
  } satisfies ChartConfig;

  // Формат счетчика
  const getItemCountText = (count: number) => {
    return `${count} item${count !== 1 ? 's' : ''}`;
  };

  // Текущий баланс
  const currentBalance =
    balanceTrendData.length > 0
      ? balanceTrendData[balanceTrendData.length - 1].balance
      : totalWalletBalance;

  return (
    <div className="mx-auto min-h-screen max-w-7xl p-4">
      <div className="flex justify-end mb-6">
        <div className="w-[200px]">
          <Select
            value={timePeriod}
            onValueChange={(value: TimePeriod) => setTimePeriod(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={t.timePeriod} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">{t.lastWeek}</SelectItem>
              <SelectItem value="month">{t.lastMonth}</SelectItem>
              <SelectItem value="year">{t.lastYear}</SelectItem>
              <SelectItem value="all">{t.allTime}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Balance Trend */}
        <Card className="p-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold">Balance Trend</h2>
            <div className="text-4xl font-bold mt-2">
              {formatCurrency(currentBalance, currency)}
            </div>
          </div>

          <ChartContainer config={chartConfig} className="h-[200px] w-full">
            <LineChart
              data={balanceTrendData}
              margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => formatCurrency(value, currency)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="balance"
                stroke="var(--chart-1)"
                strokeWidth={2}
                dot={{ fill: 'var(--chart-1)', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ChartContainer>
        </Card>

        {/* Category Distribution */}
        <Card className="p-8">
          <div className="mb-8">
            <h2 className="text-xl font-bold">Category Distribution</h2>
          </div>

          <div className="flex">
            <div className="w-1/2">
              <ChartContainer
                config={pieChartConfig}
                className="aspect-square max-h-[250px]"
              >
                <PieChart>
                  <Tooltip content={<PieTooltip />} />
                  <Pie
                    data={pieChartData}
                    dataKey="visitors"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                  />
                </PieChart>
              </ChartContainer>
            </div>

            <div className="w-1/2 pl-8 max-h-[250px] overflow-y-auto">
              <div className="space-y-4 pr-2">
                {categoryDistributionData.map((category, index) => {
                  const IconComponent = getCategoryIconComponent(category.icon);
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{
                            backgroundColor: `var(--chart-${(index % 5) + 1})`,
                          }}
                        />
                        <div className="flex items-center gap-2 min-w-0">
                          <IconComponent className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-sm truncate">
                            {category.name}
                          </span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-sm font-medium whitespace-nowrap">
                          {formatCurrency(category.value, currency)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {category.percentage}%
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Top Transactions */}
      <Card className="p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Top Transactions</h2>
          <span className="text-sm font-medium px-3 py-1 rounded-full bg-secondary text-secondary-foreground">
            {getItemCountText(topTransactionsData.length)}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {topTransactionsData.map((group, index) => {
            const isIncome = group.type === 'income';
            const IconComponent = isIncome
              ? getWalletIconComponent(group.icon)
              : getCategoryIconComponent(group.icon);

            return (
              <Card
                key={`${group.type}-${index}`}
                className="p-5 flex items-center justify-between hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-muted flex-shrink-0">
                    <IconComponent
                      className={`w-6 h-6 ${isIncome ? 'text-green-500' : 'text-red-500'}`}
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold truncate">{group.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {isIncome ? 'Total Income' : 'Total Expense'}
                    </div>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <div
                    className={`font-bold text-lg ${isIncome ? 'text-green-500' : 'text-red-500'} whitespace-nowrap`}
                  >
                    {isIncome ? '+' : '-'}
                    {formatCurrency(group.amount, currency)}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {topTransactionsData.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No transactions found for the selected period
          </div>
        )}
      </Card>
    </div>
  );
}
