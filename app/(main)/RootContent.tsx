'use client';

import { useEffect, useState } from 'react';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useAuthStore } from '@/store/useAuthStore';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import Modal from '@/components/Modal';

export default function RootContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const themeMode = useSettingsStore((state) => state.themeMode);
  const { checkAuth } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;

    if (themeMode === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
        .matches
        ? 'dark'
        : 'light';
      root.classList.remove('light', 'dark');
      root.classList.add(systemTheme);
    } else {
      root.classList.remove('light', 'dark');
      root.classList.add(themeMode);
    }
  }, [themeMode, mounted]);

  // Обновляем тему при изменении системной темы
  useEffect(() => {
    if (!mounted || themeMode !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const root = document.documentElement;
      const systemTheme = mediaQuery.matches ? 'dark' : 'light';
      root.classList.remove('light', 'dark');
      root.classList.add(systemTheme);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [themeMode, mounted]);

  if (!mounted) {
    return null;
  }

  return (
    <div className="flex w-full h-screen bg-background">
      <Sidebar />
      <div className="flex flex-col flex-1 h-full pt-5">
        <Header />
        <Modal />
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
