'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { updateUserWallet, deleteUserWallet, Wallet } from '@/lib/userData';
import { useTransactionStore } from '@/store/useTransactionStore';
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
  AlertTriangle,
} from 'lucide-react';
import { useSettingsStore } from '@/store/useSettingsStore';
import { formatCurrency } from '@/lib/currencyUtils';

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
  const {
    deleteTransactionsByWalletId,
    getTransactionCountByWallet,
    triggerUpdate,
  } = useTransactionStore();
  const { currency, language } = useSettingsStore();
  const [isEditing, setIsEditing] = useState(isOpen);
  const [name, setName] = useState(wallet.name);
  const [selectedIcon, setSelectedIcon] = useState(wallet.icon);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [transactionCount, setTransactionCount] = useState(0);

  // Получаем количество транзакций кошелька
  useEffect(() => {
    if (user) {
      const count = getTransactionCountByWallet(user.id, wallet.id);
      setTransactionCount(count);
    }
  }, [user, wallet.id, getTransactionCountByWallet]);

  const IconComponent = iconMap[iconName as keyof typeof iconMap] || WalletIcon;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    setIsEditing(false);
    updateUserWallet(
      user.id,
      wallet.id,
      name,
      wallet.amount, // Сохраняем исходный баланс
      selectedIcon
    );
    triggerUpdate();
    onUpdate();
  };

  const handleDelete = async () => {
    if (!user?.id) return;

    // Если есть транзакции, показываем подтверждение
    if (transactionCount > 0 && !showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }

    // Удаляем все транзакции кошелька
    deleteTransactionsByWalletId(user.id, wallet.id);

    // Удаляем кошелек
    deleteUserWallet(user.id, wallet.id);

    setIsEditing(false);
    setShowDeleteConfirm(false);
    triggerUpdate();
    onUpdate();
  };

  const handleCancel = () => {
    setName(wallet.name);
    setSelectedIcon(wallet.icon);
    setIsEditing(false);
    setShowDeleteConfirm(false);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  if (!isEditing) {
    return (
      <div
        className="rounded-2xl p-6 shadow-md border border-[var(--border)] hover:shadow-lg transition-shadow"
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
        <h3 className="font-semibold text-lg mb-2 truncate">{wallet.name}</h3>
        <div className="text-2xl font-bold">
          {formatCurrency(wallet.amount, currency)}
        </div>
        {transactionCount > 0 && (
          <div className="text-xs text-muted-foreground mt-2">
            {transactionCount} transaction{transactionCount !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    );
  }

  const SelectedIcon =
    iconMap[selectedIcon as keyof typeof iconMap] || WalletIcon;

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl p-6 shadow-md border border-[var(--border)]"
      style={{
        backgroundColor: 'var(--accent-bg)',
        color: 'var(--foreground)',
      }}
    >
      {showDeleteConfirm && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-3 mb-3">
            <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-red-700 font-medium">
                Delete "{wallet.name}" wallet?
              </p>
              <p className="text-sm text-red-600 mt-1">
                This wallet has {transactionCount} transaction
                {transactionCount !== 1 ? 's' : ''}. All transactions will be
                permanently deleted.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCancelDelete}
              className="flex-1 px-3 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="flex-1 px-3 py-2 text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
            >
              Delete Anyway
            </button>
          </div>
        </div>
      )}

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
            title="Save"
          >
            <Save className="w-4 h-4" style={{ color: 'var(--foreground)' }} />
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="p-2 rounded-lg transition-colors hover:bg-[var(--secondary-bg)]"
            title="Cancel"
          >
            <X className="w-4 h-4" style={{ color: 'var(--foreground)' }} />
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className={`p-2 rounded-lg transition-colors ${
              showDeleteConfirm
                ? 'bg-red-500 hover:bg-red-600'
                : 'hover:bg-red-50'
            }`}
            title="Delete"
          >
            <Trash2
              className={`w-4 h-4 ${showDeleteConfirm ? 'text-white' : 'text-red-500'}`}
            />
          </button>
        </div>
      </div>

      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full p-3 rounded-xl mb-4 focus:outline-none focus:ring-2 focus:ring-primary"
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
                  ? 'bg-[var(--secondary-bg)] ring-2 ring-primary'
                  : 'hover:bg-[var(--page-bg)]'
              }`}
              title={icon.name}
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
