'use client';

import { useState, ComponentType } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import {
  updateUserCategory,
  deleteUserCategory,
  Category,
} from '@/lib/userData';
import {
  ShoppingCart,
  Bus,
  Heart,
  ShoppingBag,
  Gamepad2,
  Plane,
  Wallet,
  Banknote,
  Landmark,
  Edit3,
  Trash2,
  Save,
  X,
  Home,
  Coffee,
  Car,
  GraduationCap,
  Briefcase,
  Utensils,
  CreditCard,
  PiggyBank,
  Coins,
  Gem,
  Bitcoin,
  Smartphone,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Карта иконок с новыми иконками (объявляем вне компонента)
const iconMap: Record<
  string,
  ComponentType<{ className?: string; style?: React.CSSProperties }>
> = {
  ShoppingCart,
  Bus,
  Heart,
  ShoppingBag,
  Gamepad2,
  Plane,
  Wallet,
  Banknote,
  Landmark,
  Home,
  Coffee,
  Car,
  GraduationCap,
  Briefcase,
  Utensils,
  CreditCard,
  PiggyBank,
  Coins,
  Gem,
  Bitcoin,
  Smartphone,
};

// Обновляем список доступных иконок (объявляем вне компонента)
const availableIcons = [
  { name: 'ShoppingCart', component: ShoppingCart },
  { name: 'Bus', component: Bus },
  { name: 'Heart', component: Heart },
  { name: 'ShoppingBag', component: ShoppingBag },
  { name: 'Gamepad2', component: Gamepad2 },
  { name: 'Plane', component: Plane },
  { name: 'Home', component: Home },
  { name: 'Coffee', component: Coffee },
  { name: 'Car', component: Car },
  { name: 'GraduationCap', component: GraduationCap },
  { name: 'Briefcase', component: Briefcase },
  { name: 'Utensils', component: Utensils },
];

interface CategoryEditFormProps {
  category: Category;
  isOpen: boolean;
  onUpdate: () => void;
}

export function CategoryEditForm({
  category,
  isOpen,
  onUpdate,
}: CategoryEditFormProps) {
  const { user } = useAuthStore();
  const [isEditing, setIsEditing] = useState(isOpen);
  const [name, setName] = useState(category.name);
  const [selectedIcon, setSelectedIcon] = useState(category.icon);

  // Получаем компонент иконки из карты для редактирования
  const SelectedIcon = iconMap[selectedIcon] || ShoppingCart;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    setIsEditing(false);
    updateUserCategory(user.id, category.id, name, selectedIcon);
    onUpdate();
  };

  const handleDelete = async () => {
    if (!user?.id) return;

    setIsEditing(false);
    deleteUserCategory(user.id, category.id);
    onUpdate();
  };

  const handleCancel = () => {
    setName(category.name);
    setSelectedIcon(category.icon);
    setIsEditing(false);
  };

  if (!isEditing) {
    const DisplayIcon = iconMap[category.icon] || ShoppingCart;

    return (
      <div
        className="rounded-2xl p-6 shadow-md w-64 border border-[var(--border)]"
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
            <DisplayIcon
              className="w-6 h-6"
              style={{ color: 'var(--foreground)' } as React.CSSProperties}
            />
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 rounded-lg transition-colors hover:bg-[var(--secondary-bg)]"
          >
            <Edit3
              className="w-4 h-4"
              style={{ color: 'var(--foreground)' } as React.CSSProperties}
            />
          </button>
        </div>
        <h3 className="font-semibold text-lg">{category.name}</h3>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl p-6 shadow-md w-64"
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
            style={{ color: 'var(--foreground)' } as React.CSSProperties}
          />
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            className="p-2 rounded-lg transition-colors hover:bg-[var(--secondary-bg)]"
          >
            <Save
              className="w-4 h-4"
              style={{ color: 'var(--foreground)' } as React.CSSProperties}
            />
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="p-2 rounded-lg transition-colors hover:bg-[var(--secondary-bg)]"
          >
            <X
              className="w-4 h-4"
              style={{ color: 'var(--foreground)' } as React.CSSProperties}
            />
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="p-2 rounded-lg transition-colors hover:bg-red-50"
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
        placeholder="Category name"
      />

      <div className="grid grid-cols-3 gap-2 mb-4">
        {availableIcons.map((icon) => {
          const IconComponent = icon.component;
          return (
            <button
              key={icon.name}
              type="button"
              onClick={() => setSelectedIcon(icon.name)}
              className={cn(
                'p-2 rounded-lg transition-colors flex items-center justify-center',
                selectedIcon === icon.name
                  ? 'bg-[var(--secondary-bg)]'
                  : 'hover:bg-[var(--page-bg)]'
              )}
            >
              <IconComponent
                className="w-5 h-5"
                style={{ color: 'var(--foreground)' } as React.CSSProperties}
              />
            </button>
          );
        })}
      </div>
    </form>
  );
}
