'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { updateUserWallet, deleteUserWallet, Wallet } from '@/lib/userData';
import {
  Wallet as WalletIcon,
  Banknote,
  Landmark,
  Edit3,
  Trash2,
  Save,
  X,
  CreditCard,
  PiggyBank,
  Coins,
  Gem,
  Bitcoin,
  ShoppingBag,
  Briefcase,
  Smartphone,
  Home,
} from 'lucide-react'; // Добавляем все иконки
import { useSettingsStore } from '@/store/useSettingsStore';
import { formatCurrency } from '@/lib/currencyUtils';

// Обновляем карту иконок с новыми иконками
const iconMap = {
  Wallet: WalletIcon,
  Banknote: Banknote,
  Landmark: Landmark,
  CreditCard: CreditCard,
  PiggyBank: PiggyBank,
  Coins: Coins,
  Gem: Gem,
  Bitcoin: Bitcoin,
  ShoppingBag: ShoppingBag,
  Briefcase: Briefcase,
  Smartphone: Smartphone,
  Home: Home,
};

// Обновляем список доступных иконок
const availableIcons = [
  { name: 'Wallet', component: WalletIcon },
  { name: 'Banknote', component: Banknote },
  { name: 'Landmark', component: Landmark },
  { name: 'CreditCard', component: CreditCard },
  { name: 'PiggyBank', component: PiggyBank },
  { name: 'Coins', component: Coins },
  { name: 'Gem', component: Gem },
  { name: 'Bitcoin', component: Bitcoin },
  { name: 'ShoppingBag', component: ShoppingBag },
  { name: 'Briefcase', component: Briefcase },
  { name: 'Smartphone', component: Smartphone },
  { name: 'Home', component: Home },
];

interface WalletEditCardProps {
  wallet: Wallet;
  iconName: string;
  isOpen: boolean;
  onUpdate: () => void;
}

export function WalletEditCard({
  wallet,
  iconName,
  isOpen,
  onUpdate,
}: WalletEditCardProps) {
  const { user } = useAuthStore();
  const { currency } = useSettingsStore();
  const [isEditing, setIsEditing] = useState(isOpen);
  const [name, setName] = useState(wallet.name);
  const [selectedIcon, setSelectedIcon] = useState(wallet.icon);

  const IconComponent = iconMap[iconName as keyof typeof iconMap] || WalletIcon;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    setIsEditing(false);
    updateUserWallet(
      user.id,
      wallet.id,
      name,
      wallet.amount, // Сохраняем исходный баланс без изменений
      selectedIcon
    );
    onUpdate();
  };

  const handleDelete = async () => {
    if (!user?.id) return;

    setIsEditing(false);
    deleteUserWallet(user.id, wallet.id);
    onUpdate();
  };

  const handleCancel = () => {
    setName(wallet.name);
    setSelectedIcon(wallet.icon);
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <div
        className="rounded-2xl p-6 shadow-md border border-[var(--border)]"
        style={{
          backgroundColor: 'var(--accent-bg)',
          color: 'var(--foreground)',
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: 'var(--secondary-bg)' }}
          >
            <IconComponent
              className="w-6 h-6"
              style={{ color: 'var(--foreground)' }}
            />
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 rounded-lg transition-colors hover:bg-[var(--secondary-bg)]"
          >
            <Edit3 className="w-4 h-4" style={{ color: 'var(--foreground)' }} />
          </button>
        </div>
        <h3 className="font-semibold text-lg mb-2">{wallet.name}</h3>
        <div className="text-2xl font-bold">
          {formatCurrency(wallet.amount, currency)}
        </div>
      </div>
    );
  }

  const SelectedIcon =
    iconMap[selectedIcon as keyof typeof iconMap] || WalletIcon;

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl p-6 shadow-md"
      style={{
        backgroundColor: 'var(--accent-bg)',
        color: 'var(--foreground)',
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{ backgroundColor: 'var(--secondary-bg)' }}
        >
          <SelectedIcon
            className="w-6 h-6"
            style={{ color: 'var(--foreground)' }}
          />
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            className="p-2 rounded-lg transition-colors hover:bg-[var(--secondary-bg)]"
          >
            <Save className="w-4 h-4" style={{ color: 'var(--foreground)' }} />
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="p-2 rounded-lg transition-colors hover:bg-[var(--secondary-bg)]"
          >
            <X className="w-4 h-4" style={{ color: 'var(--foreground)' }} />
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="p-2 rounded-lg transition-colors hover:bg-red-50"
            style={{ color: 'var(--foreground)' }}
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </button>
        </div>
      </div>

      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full p-3 rounded-xl mb-4 focus:outline-none"
        style={{
          backgroundColor: 'var(--secondary-bg)',
          color: 'var(--foreground)',
        }}
        placeholder="Wallet name"
      />

      <div className="text-2xl font-bold mb-4">
        {formatCurrency(wallet.amount, currency)}
      </div>

      <div className="grid grid-cols-4 gap-2 mb-4">
        {availableIcons.map((icon) => {
          const IconComponent = icon.component;
          return (
            <button
              key={icon.name}
              type="button"
              onClick={() => setSelectedIcon(icon.name)}
              className={`p-2 rounded-lg transition-colors flex items-center justify-center ${
                selectedIcon === icon.name
                  ? 'bg-[var(--secondary-bg)]'
                  : 'hover:bg-[var(--page-bg)]'
              }`}
            >
              <IconComponent
                className="w-5 h-5"
                style={{ color: 'var(--foreground)' }}
              />
            </button>
          );
        })}
      </div>
    </form>
  );
}
