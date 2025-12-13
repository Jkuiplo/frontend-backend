'use client';

import { useState, useEffect } from 'react';
import { useModalStore } from '@/store/useModalStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useTransactionStore } from '@/store/useTransactionStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { getUserWallets } from '@/lib/userData';
import { getUserCategories } from '@/lib/userData';
import { translations } from '@/lib/translations';
import { currencySymbols } from '@/lib/currencyUtils';
import { formatCurrency } from '@/lib/currencyUtils';
import { X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function AddTransactionModal() {
  const { closeModal } = useModalStore();
  const { user } = useAuthStore();
  const { addTransaction, triggerUpdate } = useTransactionStore();
  const { currency, language } = useSettingsStore();
  const t = translations[language];

  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [amount, setAmount] = useState('');
  const [comment, setComment] = useState('');
  const [selectedWallet, setSelectedWallet] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [transactionDate, setTransactionDate] = useState<string>(
    new Date().toISOString().slice(0, 16)
  );
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [wallets, setWallets] = useState<ReturnType<typeof getUserWallets>>([]);
  const [categories, setCategories] = useState<
    ReturnType<typeof getUserCategories>
  >([]);

  // Загружаем актуальные данные
  useEffect(() => {
    if (user) {
      const userWallets = getUserWallets(user.id);
      const userCategories = getUserCategories(user.id);
      setWallets(userWallets);
      setCategories(userCategories);

      // Автоматически выбираем первый кошелек
      if (userWallets.length > 0 && !selectedWallet) {
        setSelectedWallet(userWallets[0].id.toString());
      }
    }
  }, [user]);

  const validateAmount = (value: string): boolean => {
    const numValue = parseFloat(value);
    return !isNaN(numValue) && numValue >= 1;
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAmount(value);
    if (value && !validateAmount(value)) {
      setError('Amount must be at least 1');
    } else {
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Валидация
    if (!amount || !validateAmount(amount)) {
      setError('Amount must be at least 1');
      setLoading(false);
      return;
    }

    if (!selectedWallet) {
      setError('Please select a wallet');
      setLoading(false);
      return;
    }

    if (type === 'expense' && !selectedCategory) {
      setError('Please select a category for expense');
      setLoading(false);
      return;
    }

    // Проверка баланса для расходов
    if (type === 'expense') {
      const wallet = wallets.find((w) => w.id === parseInt(selectedWallet));
      const amountNum = parseFloat(amount);

      if (wallet && wallet.amount < amountNum) {
        setError(
          `Insufficient funds. Wallet balance: ${currencySymbols[currency]}${wallet.amount.toLocaleString()}`
        );
        setLoading(false);
        return;
      }
    }

    try {
      // Добавляем транзакцию
      addTransaction({
        type,
        amount: parseFloat(amount),
        comment,
        walletId: parseInt(selectedWallet),
        categoryId: type === 'expense' ? selectedCategory : undefined,
        date: new Date(transactionDate).toISOString(),
        userId: user!.id,
      });

      // Запускаем обновление всех компонентов
      triggerUpdate();

      // Закрываем модалку
      setTimeout(() => {
        closeModal('add');
        setLoading(false);
        // Сбрасываем форму
        setAmount('');
        setComment('');
        setSelectedWallet(wallets.length > 0 ? wallets[0].id.toString() : '');
        setSelectedCategory('');
        setTransactionDate(new Date().toISOString().slice(0, 16));
      }, 300);
    } catch (err) {
      setError('Failed to add transaction');
      setLoading(false);
    }
  };

  return (
    <div
      className="w-[480px] rounded-3xl p-6 shadow-xl"
      style={{
        backgroundColor: 'var(--accent-bg)',
        color: 'var(--foreground)',
      }}
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{t.addTransaction}</h2>
        <button
          onClick={() => closeModal('add')}
          className="p-2 rounded-lg hover:bg-[var(--secondary-bg)] transition"
          disabled={loading}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Tabs
          value={type}
          onValueChange={(value) => {
            setType(value as 'expense' | 'income');
            setError('');
          }}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="expense" disabled={loading}>
              {t.expenses}
            </TabsTrigger>
            <TabsTrigger value="income" disabled={loading}>
              {t.incomes}
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="space-y-2">
          <Label htmlFor="amount">{t.amount} *</Label>
          <div className="relative">
            <span
              className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-semibold"
              style={{ color: 'var(--secondary-text)' }}
            >
              {currencySymbols[currency]}
            </span>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="1"
              value={amount}
              onChange={handleAmountChange}
              className="pl-10"
              placeholder="1.00"
              required
              disabled={loading}
            />
          </div>
          <p className="text-xs text-muted-foreground">Minimum amount is 1</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="date">Date & Time *</Label>
          <Input
            id="date"
            type="datetime-local"
            value={transactionDate}
            onChange={(e) => setTransactionDate(e.target.value)}
            className="w-full"
            required
            disabled={loading}
          />
        </div>

        {type === 'expense' && (
          <div className="space-y-2">
            <Label htmlFor="comment">{t.comment}</Label>
            <Input
              id="comment"
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={t.comment}
              disabled={loading}
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>{t.selectWallet} *</Label>
            <Select
              value={selectedWallet}
              onValueChange={(value) => {
                setSelectedWallet(value);
                setError('');
              }}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder={t.selectWallet} />
              </SelectTrigger>
              <SelectContent>
                {wallets.map((wallet) => (
                  <SelectItem key={wallet.id} value={wallet.id.toString()}>
                    {wallet.name} ({formatCurrency(wallet.amount, currency)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {type === 'expense' && (
            <div className="space-y-2">
              <Label>{t.selectCategory} *</Label>
              <Select
                value={selectedCategory}
                onValueChange={(value) => {
                  setSelectedCategory(value);
                  setError('');
                }}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t.selectCategory} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => closeModal('add')}
            disabled={loading}
          >
            {t.cancel}
          </Button>
          <Button type="submit" className="flex-1" disabled={loading}>
            {loading ? `${t.add}...` : t.add}
          </Button>
        </div>
      </form>
    </div>
  );
}
