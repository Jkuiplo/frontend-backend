'use client';

import { useState } from 'react';
import { useModalStore } from '@/store/useModalStore';
import { useAuthStore } from '@/store/useAuthStore';
import { addUserWallet } from '@/lib/userData';
import { useSettingsStore } from '@/store/useSettingsStore';
import { translations } from '@/lib/translations';
import { currencySymbols } from '@/lib/currencyUtils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';
import {
  Wallet as WalletIcon,
  Banknote,
  Landmark,
  CreditCard,
  PiggyBank,
  Coins,
  Gem,
  Bitcoin,
  ShoppingBag,
  Briefcase,
  Smartphone,
  Home,
  X,
} from 'lucide-react';

// Убираем подписи, оставляем только value и иконку
const walletIcons = [
  { value: 'Wallet', icon: WalletIcon },
  { value: 'Banknote', icon: Banknote },
  { value: 'Landmark', icon: Landmark },
  { value: 'CreditCard', icon: CreditCard },
  { value: 'PiggyBank', icon: PiggyBank },
  { value: 'Coins', icon: Coins },
  { value: 'Gem', icon: Gem },
  { value: 'Bitcoin', icon: Bitcoin },
  { value: 'ShoppingBag', icon: ShoppingBag },
  { value: 'Briefcase', icon: Briefcase },
  { value: 'Smartphone', icon: Smartphone },
  { value: 'Home', icon: Home },
];

// Карта иконок для быстрого доступа
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Wallet: WalletIcon,
  Banknote,
  Landmark,
  CreditCard,
  PiggyBank,
  Coins,
  Gem,
  Bitcoin,
  ShoppingBag,
  Briefcase,
  Smartphone,
  Home,
};

export default function AddWalletModal() {
  const { closeModal } = useModalStore();
  const { user } = useAuthStore();
  const { language, currency } = useSettingsStore();
  const t = translations[language];

  const [walletName, setWalletName] = useState('');
  const [balance, setBalance] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('Wallet');
  const [error, setError] = useState('');

  const validateBalance = (value: string): boolean => {
    const numValue = parseFloat(value);
    return !isNaN(numValue) && numValue >= 0;
  };

  // Получаем компонент иконки из карты
  const IconComponent = iconMap[selectedIcon] || WalletIcon;

  const handleBalanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setBalance(value);

    if (value && !validateBalance(value)) {
      setError('Balance cannot be negative');
    } else {
      setError('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !walletName || !balance) {
      setError('Please fill all required fields');
      return;
    }

    if (!validateBalance(balance)) {
      setError('Balance cannot be negative');
      return;
    }

    addUserWallet(user.id, walletName, parseFloat(balance), selectedIcon);
    closeModal('addWallet');
    setWalletName('');
    setBalance('');
    setSelectedIcon('Wallet');
    setError('');
    window.location.reload();
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
        <h2 className="text-2xl font-bold">{t.addWallet}</h2>
        <button
          onClick={() => closeModal('addWallet')}
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
        <div className="grid grid-cols-[1fr_auto] gap-4">
          <div className="space-y-2">
            <Label htmlFor="walletName">{t.walletName} *</Label>
            <Input
              id="walletName"
              type="text"
              value={walletName}
              onChange={(e) => setWalletName(e.target.value)}
              placeholder={t.walletName}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Icon *</Label>
            <Select value={selectedIcon} onValueChange={setSelectedIcon}>
              <SelectTrigger className="w-[100px]">
                <div className="flex items-center gap-2">
                  <IconComponent className="w-4 h-4" />
                </div>
              </SelectTrigger>
              <SelectContent>
                {walletIcons.map((icon) => {
                  const Icon = icon.icon;
                  return (
                    <SelectItem key={icon.value} value={icon.value}>
                      <div className="flex items-center justify-center">
                        <Icon className="w-4 h-4" />
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="balance">{t.balance} *</Label>
          <div className="relative">
            <span
              className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-semibold"
              style={{ color: 'var(--secondary-text)' }}
            >
              {currencySymbols[currency]}
            </span>
            <Input
              id="balance"
              type="number"
              step="0.01"
              min="0"
              value={balance}
              onChange={handleBalanceChange}
              className="pl-10"
              placeholder="0.00"
              required
            />
          </div>
          <p className="text-xs text-muted-foreground">Minimum balance is 0</p>
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => closeModal('addWallet')}
          >
            {t.cancel}
          </Button>
          <Button type="submit" className="flex-1">
            {t.add}
          </Button>
        </div>
      </form>
    </div>
  );
}
