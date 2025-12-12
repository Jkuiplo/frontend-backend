'use client';

import { useModalStore } from '@/store/useModalStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import Button from './Button';
import { usePathname } from 'next/navigation';
import { Page, usePageStore } from '@/store/usePageStore';
import { useEffect } from 'react';

export default function Header() {
  const { setPage } = usePageStore();
  const { openModal } = useModalStore();
  const { language } = useSettingsStore();

  const pathname = usePathname();
  const currentPage = pathname.replace('/', '') || 'home';

  useEffect(() => {
    setPage(currentPage as Page);
  }, [pathname, setPage, currentPage]);

  const pageTitles: Record<string, { en: string; ru: string }> = {
    home: { en: 'Budget Overview', ru: 'Обзор бюджета' },
    categories: { en: 'Categories', ru: 'Категории' },
    statistic: { en: 'Statistics', ru: 'Статистика' },
    wallet: { en: 'Wallets', ru: 'Кошельки' },
    transactions: { en: 'Transactions', ru: 'Транзакции' },
  };

  const handleClick = () => {
    if (currentPage === 'wallet') {
      openModal('addWallet');
    } else if (currentPage === 'categories') {
      openModal('addCategory');
    } else {
      openModal('add');
    }
  };

  const getPageTitle = () => {
    const title = pageTitles[currentPage] || pageTitles.home;
    return language === 'ru' ? title.ru : title.en;
  };

  return (
    <header className="w-full h-20 flex items-center justify-between px-7">
      <h1 className="text-3xl font-black">{getPageTitle()}</h1>
      <Button onClick={handleClick} />
    </header>
  );
}
