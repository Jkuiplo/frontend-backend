'use client';

import { usePageStore } from '@/store/usePageStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { Plus } from 'lucide-react';

type ButtonProps = {
  onClick?: () => void;
};

export default function Button({ onClick }: ButtonProps) {
  const { currentPage } = usePageStore();
  const { language } = useSettingsStore();

  const buttonTitles: Record<string, { en: string; ru: string }> = {
    home: { en: 'Add transaction', ru: 'Добавить транзакцию' },
    categories: { en: 'Add category', ru: 'Добавить категорию' },
    statistic: { en: 'Add transaction', ru: 'Добавить транзакцию' },
    wallet: { en: 'Add wallet', ru: 'Добавить кошелек' },
    transactions: { en: 'Add transaction', ru: 'Добавить транзакцию' },
  };

  const getButtonTitle = () => {
    const title = buttonTitles[currentPage] || buttonTitles.home;
    return language === 'ru' ? title.ru : title.en;
  };

  return (
    <button
      onClick={onClick}
      className="h-10 bg-primary text-primary-foreground rounded-xl flex items-center transition-all duration-200 hover:opacity-90"
    >
      <Plus className="w-5 h-5 ml-4 mr-2" />
      <p className="mr-4 font-semibold">{getButtonTitle()}</p>
    </button>
  );
}
