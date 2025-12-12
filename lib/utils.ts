import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// Иконки для категорий
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
} from "lucide-react"

// Иконки для кошельков
import {
  Wallet as WalletIcon,
  Banknote,
  Landmark,
  CreditCard,
  PiggyBank,
  Coins,
  Gem,
  Bitcoin,
  Briefcase as BriefcaseWallet,
  Smartphone,
} from "lucide-react"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Добавляем функцию форматирования даты и времени
export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return `${date.toLocaleDateString()} • ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
}

// Или отдельно дата и время
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString();
}

export function formatTime(dateString: string): string {
  return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Карта иконок категорий
export const categoryIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
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

// Карта иконок кошельков
export const walletIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Wallet: WalletIcon,
  Banknote,
  Landmark,
  CreditCard,
  PiggyBank,
  Coins,
  Gem,
  Bitcoin,
  ShoppingBag: ShoppingBag,
  Briefcase: BriefcaseWallet,
  Smartphone,
  Home,
};

// Функция для получения компонента иконки категории
export function getCategoryIconComponent(iconName: string): React.ComponentType<{ className?: string }> {
  return categoryIconMap[iconName] || ShoppingCart;
}

// Функция для получения компонента иконки кошелька
export function getWalletIconComponent(iconName: string): React.ComponentType<{ className?: string }> {
  return walletIconMap[iconName] || WalletIcon;
}