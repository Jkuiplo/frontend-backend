'use client';

import { useState } from 'react';
import { useModalStore } from '@/store/useModalStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useTransactionStore, Transaction } from '@/store/useTransactionStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { getUserWallets, getUserCategories } from '@/lib/userData';
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

interface EditTransactionModalProps {
  transaction: Transaction | undefined;
}

export default function EditTransactionModal({
  transaction,
}: EditTransactionModalProps) {
  const { closeModal } = useModalStore();
  const { user } = useAuthStore();
  const { updateTransaction, deleteTransaction } = useTransactionStore();
  const { language, currency } = useSettingsStore();
  const t = translations[language];

  const [type, setType] = useState<'expense' | 'income'>(
    transaction?.type || 'expense'
  );
  const [amount, setAmount] = useState(transaction?.amount.toString() || '');
  const [comment, setComment] = useState(transaction?.comment || '');
  const [selectedWallet, setSelectedWallet] = useState(
    transaction?.walletId.toString() || ''
  );
  const [selectedCategory, setSelectedCategory] = useState(
    transaction?.categoryId || ''
  );
  const [transactionDate, setTransactionDate] = useState<string>(
    transaction
      ? new Date(transaction.date).toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16)
  );
  const [error, setError] = useState('');

  const wallets = user ? getUserWallets(user.id) : [];
  const categories = user ? getUserCategories(user.id) : [];

  // Если транзакция не существует, не рендерим модалку
  if (!transaction) {
    return null;
  }

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Валидация
    if (!amount || !validateAmount(amount)) {
      setError('Amount must be at least 1');
      return;
    }

    if (!selectedWallet) {
      setError('Please select a wallet');
      return;
    }

    if (type === 'expense' && !selectedCategory) {
      setError('Please select a category for expense');
      return;
    }

    // Проверка баланса кошелька для расходов (если тип изменился на expense или сумма увеличилась)
    if (type === 'expense') {
      const wallet = wallets.find((w) => w.id === parseInt(selectedWallet));
      const amountNum = parseFloat(amount);

      // Проверяем только если это новый расход или увеличенный расход
      if (transaction.type === 'income' || amountNum > transaction.amount) {
        if (wallet && wallet.amount < amountNum) {
          setError(
            `Insufficient funds. Wallet balance: ${currencySymbols[currency]}${wallet.amount.toLocaleString()}`
          );
          return;
        }
      }
    }

    updateTransaction(transaction.id, {
      type,
      amount: parseFloat(amount),
      comment,
      walletId: parseInt(selectedWallet),
      categoryId: type === 'expense' ? selectedCategory : undefined,
      date: new Date(transactionDate).toISOString(),
    });

    closeModal('editTransaction');
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this transaction?')) {
      deleteTransaction(transaction.id);
      closeModal('editTransaction');
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
        <h2 className="text-2xl font-bold">
          {t.edit} {t.addTransaction}
        </h2>
        <button
          onClick={() => closeModal('editTransaction')}
          className="p-2 rounded-lg hover:bg-[var(--secondary-bg)] transition"
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
            <TabsTrigger value="expense">{t.expenses}</TabsTrigger>
            <TabsTrigger value="income">{t.incomes}</TabsTrigger>
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
            onClick={() => closeModal('editTransaction')}
          >
            {t.cancel}
          </Button>
          <Button type="button" variant="destructive" onClick={handleDelete}>
            {t.delete}
          </Button>
          <Button type="submit" className="flex-1">
            {t.save}
          </Button>
        </div>
      </form>
    </div>
  );
}
