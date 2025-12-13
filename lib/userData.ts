// lib/userData.ts
export type Category = {
  id: string;
  name: string;
  icon: string;
  userId: string;
};

export type Wallet = {
  id: number;
  name: string;
  amount: number;
  icon: string;
  userId: string;
};

const CATEGORIES_KEY = 'void_categories';
const WALLETS_KEY = 'void_wallets';

const defaultCategories: Omit<Category, 'userId' | 'id'>[] = [
  { name: 'Food', icon: 'ShoppingCart' },
  { name: 'Transport', icon: 'Bus' },
  { name: 'Health', icon: 'Heart' },
  { name: 'Shopping', icon: 'ShoppingBag' },
  { name: 'Entertainment', icon: 'Gamepad2' },
  { name: 'Travel', icon: 'Plane' },
];

const defaultWallets: Omit<Wallet, 'userId' | 'id'>[] = [
  { name: 'Wallet', amount: 0, icon: 'Wallet' },
  { name: 'Cash', amount: 0, icon: 'Banknote' },
  { name: 'Savings', amount: 0, icon: 'Landmark' },
];

export function getUserCategories(userId: string): Category[] {
  if (typeof window === 'undefined') return [];
  
  const allCategories = JSON.parse(localStorage.getItem(CATEGORIES_KEY) || '[]') as Category[];
  let userCategories = allCategories.filter(cat => cat.userId === userId);

  if (userCategories.length === 0) {
    userCategories = defaultCategories.map((cat, index) => ({
      ...cat,
      id: `${userId}_cat_${Date.now()}_${index}`,
      userId,
    }));
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify([...allCategories, ...userCategories]));
  }

  return userCategories;
}

export function addUserCategory(userId: string, name: string, icon: string): Category {
  const allCategories = JSON.parse(localStorage.getItem(CATEGORIES_KEY) || '[]') as Category[];
  
  const newCategory: Category = {
    id: `${userId}_cat_${Date.now()}`,
    name,
    icon,
    userId,
  };
  
  allCategories.push(newCategory);
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(allCategories));
  
  return newCategory;
}

export function updateUserCategory(userId: string, id: string, name: string, icon: string): void {
  const allCategories = JSON.parse(localStorage.getItem(CATEGORIES_KEY) || '[]') as Category[];
  
  const updatedCategories = allCategories.map(cat =>
    cat.id === id && cat.userId === userId
      ? { ...cat, name, icon }
      : cat
  );
  
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(updatedCategories));
}

export function deleteUserCategory(userId: string, id: string): void {
  const allCategories = JSON.parse(localStorage.getItem(CATEGORIES_KEY) || '[]') as Category[];
  
  const filteredCategories = allCategories.filter(
    cat => !(cat.id === id && cat.userId === userId)
  );
  
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(filteredCategories));
}

export function getUserWallets(userId: string): Wallet[] {
  if (typeof window === 'undefined') return [];
  
  const allWallets = JSON.parse(localStorage.getItem(WALLETS_KEY) || '[]') as Wallet[];
  let userWallets = allWallets.filter(wallet => wallet.userId === userId);

  if (userWallets.length === 0) {
    userWallets = defaultWallets.map((wallet, index) => ({
      ...wallet,
      id: Date.now() + index,
      userId,
    }));
    localStorage.setItem(WALLETS_KEY, JSON.stringify([...allWallets, ...userWallets]));
  }

  return userWallets;
}

export function addUserWallet(userId: string, name: string, amount: number, icon: string): Wallet {
  const allWallets = JSON.parse(localStorage.getItem(WALLETS_KEY) || '[]') as Wallet[];
  
  const newWallet: Wallet = {
    id: Date.now(),
    name,
    amount,
    icon,
    userId,
  };
  
  allWallets.push(newWallet);
  localStorage.setItem(WALLETS_KEY, JSON.stringify(allWallets));
  
  return newWallet;
}

export function updateUserWallet(userId: string, id: number, name: string, amount: number, icon: string): void {
  const allWallets = JSON.parse(localStorage.getItem(WALLETS_KEY) || '[]') as Wallet[];
  
  const updatedWallets = allWallets.map(wallet =>
    wallet.id === id && wallet.userId === userId
      ? { ...wallet, name, amount, icon }
      : wallet
  );
  
  localStorage.setItem(WALLETS_KEY, JSON.stringify(updatedWallets));
}

export function deleteUserWallet(userId: string, id: number): void {
  const allWallets = JSON.parse(localStorage.getItem(WALLETS_KEY) || '[]') as Wallet[];
  
  const filteredWallets = allWallets.filter(
    wallet => !(wallet.id === id && wallet.userId === userId)
  );
  
  localStorage.setItem(WALLETS_KEY, JSON.stringify(filteredWallets));
}

// НОВАЯ ФУНКЦИЯ: Проверка, есть ли транзакции у кошелька
export function getWalletTransactionCount(userId: string, walletId: number): number {
  if (typeof window === 'undefined') return 0;
  
  try {
    const transactionsData = localStorage.getItem('void-transactions-storage');
    if (!transactionsData) return 0;
    
    const parsed = JSON.parse(transactionsData);
    const transactions = parsed.state?.transactions || [];
    
    return transactions.filter(
      (tx: any) => tx.userId === userId && tx.walletId === walletId
    ).length;
  } catch {
    return 0;
  }
}