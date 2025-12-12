'use client';

import { useState } from 'react';
import { useModalStore } from '@/store/useModalStore';
import { useAuthStore } from '@/store/useAuthStore';
import { addUserCategory } from '@/lib/userData';
import { useSettingsStore } from '@/store/useSettingsStore';
import { translations } from '@/lib/translations';
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
  ShoppingCart,
  Bus,
  Heart,
  ShoppingBag,
  Gamepad2,
  Plane,
  Home,
  Coffee,
  Car,
  GraduationCap,
  Briefcase,
  Utensils,
  X,
} from 'lucide-react';

// Убираем подписи, оставляем только value и иконку
const categoryIcons = [
  { value: 'ShoppingCart', icon: ShoppingCart },
  { value: 'Bus', icon: Bus },
  { value: 'Heart', icon: Heart },
  { value: 'ShoppingBag', icon: ShoppingBag },
  { value: 'Gamepad2', icon: Gamepad2 },
  { value: 'Plane', icon: Plane },
  { value: 'Home', icon: Home },
  { value: 'Coffee', icon: Coffee },
  { value: 'Car', icon: Car },
  { value: 'GraduationCap', icon: GraduationCap },
  { value: 'Briefcase', icon: Briefcase },
  { value: 'Utensils', icon: Utensils },
];

// Карта иконок для быстрого доступа
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  ShoppingCart,
  Bus,
  Heart,
  ShoppingBag,
  Gamepad2,
  Plane,
  Home,
  Coffee,
  Car,
  GraduationCap,
  Briefcase,
  Utensils,
};

export default function AddCategoryModal() {
  const { closeModal } = useModalStore();
  const { user } = useAuthStore();
  const { language } = useSettingsStore();
  const t = translations[language];

  const [categoryName, setCategoryName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('ShoppingCart');

  // Получаем компонент иконки из карты
  const IconComponent = iconMap[selectedIcon] || ShoppingCart;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !categoryName) return;

    addUserCategory(user.id, categoryName, selectedIcon);
    closeModal('addCategory');
    setCategoryName('');
    setSelectedIcon('ShoppingCart');
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
        <h2 className="text-2xl font-bold">{t.addCategory}</h2>
        <button
          onClick={() => closeModal('addCategory')}
          className="p-2 rounded-lg hover:bg-[var(--secondary-bg)] transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-[1fr_auto] gap-4">
          <div className="space-y-2">
            <Label htmlFor="categoryName">{t.categoryName}</Label>
            <Input
              id="categoryName"
              type="text"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder={t.categoryName}
            />
          </div>

          <div className="space-y-2">
            <Label>Icon</Label>
            <Select value={selectedIcon} onValueChange={setSelectedIcon}>
              <SelectTrigger className="w-[120px]">
                <div className="flex items-center gap-2">
                  <IconComponent className="w-4 h-4" />
                </div>
              </SelectTrigger>
              <SelectContent>
                {categoryIcons.map((icon) => {
                  const Icon = icon.icon;
                  return (
                    <SelectItem key={icon.value} value={icon.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => closeModal('addCategory')}
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
