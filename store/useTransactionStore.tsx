'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { getUserWallets, updateUserWallet } from '@/lib/userData';

export type TransactionType = 'expense' | 'income';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  comment: string;
  walletId: number;
  categoryId?: string;
  date: string;
  userId: string;
}

interface TransactionState {
  transactions: Transaction[];
  transactionUpdated: boolean;
  // Основные операции
  addTransaction: (
    transaction: Omit<Transaction, 'id'> & { date?: string }
  ) => void;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  deleteTransactionsByWalletId: (userId: string, walletId: number) => void;
  // Получение данных
  getUserTransactions: (userId: string) => Transaction[];
  getTransactionsByDateRange: (
    userId: string,
    startDate: Date,
    endDate: Date
  ) => Transaction[];
  getTransactionCountByWallet: (userId: string, walletId: number) => number;
  // Обновление UI
  triggerUpdate: () => void;
  refreshAllData: () => void;
}

export const useTransactionStore = create<TransactionState>()(
  persist(
    (set, get) => ({
      transactions: [],
      transactionUpdated: false,

      // Добавление транзакции с обновлением баланса
      addTransaction: (transaction) => {
        const newTransaction: Transaction = {
          ...transaction,
          id: `${transaction.userId}_tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          date: transaction.date || new Date().toISOString(),
        };

        // Обновляем баланс кошелька (если это не начальный баланс)
        if (transaction.userId) {
          const wallets = getUserWallets(transaction.userId);
          const wallet = wallets.find((w) => w.id === transaction.walletId);

          if (wallet) {
            let newAmount = wallet.amount;

            if (transaction.type === 'income') {
              newAmount += transaction.amount;
            } else if (transaction.type === 'expense') {
              newAmount -= transaction.amount;
            }

            // Обновляем кошелек
            updateUserWallet(
              transaction.userId,
              wallet.id,
              wallet.name,
              newAmount,
              wallet.icon
            );
          }
        }

        set((state) => ({
          transactions: [...state.transactions, newTransaction],
          transactionUpdated: !state.transactionUpdated,
        }));
      },

      // Обновление транзакции
      updateTransaction: (id, updatedData) => {
        const oldTransaction = get().transactions.find((tx) => tx.id === id);

        if (oldTransaction) {
          // Сначала восстанавливаем старый баланс
          const wallets = getUserWallets(oldTransaction.userId);
          const wallet = wallets.find((w) => w.id === oldTransaction.walletId);

          if (wallet) {
            let restoredAmount = wallet.amount;

            if (oldTransaction.type === 'income') {
              restoredAmount -= oldTransaction.amount;
            } else if (oldTransaction.type === 'expense') {
              restoredAmount += oldTransaction.amount;
            }

            // Применяем обновления
            const newType = updatedData.type || oldTransaction.type;
            const newAmount = updatedData.amount || oldTransaction.amount;

            if (newType === 'income') {
              restoredAmount += newAmount;
            } else if (newType === 'expense') {
              restoredAmount -= newAmount;
            }

            updateUserWallet(
              oldTransaction.userId,
              wallet.id,
              wallet.name,
              restoredAmount,
              wallet.icon
            );
          }
        }

        set((state) => ({
          transactions: state.transactions.map((tx) =>
            tx.id === id ? { ...tx, ...updatedData } : tx
          ),
          transactionUpdated: !state.transactionUpdated,
        }));
      },

      // Удаление транзакции с возвратом баланса
      deleteTransaction: (id) => {
        const transaction = get().transactions.find((tx) => tx.id === id);

        if (transaction) {
          // Возвращаем деньги на кошелек
          const wallets = getUserWallets(transaction.userId);
          const wallet = wallets.find((w) => w.id === transaction.walletId);

          if (wallet) {
            let newAmount = wallet.amount;

            if (transaction.type === 'income') {
              newAmount -= transaction.amount;
            } else if (transaction.type === 'expense') {
              newAmount += transaction.amount;
            }

            updateUserWallet(
              transaction.userId,
              wallet.id,
              wallet.name,
              newAmount,
              wallet.icon
            );
          }
        }

        set((state) => ({
          transactions: state.transactions.filter((tx) => tx.id !== id),
          transactionUpdated: !state.transactionUpdated,
        }));
      },

      // Удаление всех транзакций кошелька (без возврата баланса)
      deleteTransactionsByWalletId: (userId: string, walletId: number) => {
        set((state) => ({
          transactions: state.transactions.filter(
            (tx) => !(tx.userId === userId && tx.walletId === walletId)
          ),
          transactionUpdated: !state.transactionUpdated,
        }));
      },

      // Получение транзакций пользователя
      getUserTransactions: (userId) => {
        return get().transactions.filter((tx) => tx.userId === userId);
      },

      // Получение транзакций за период
      getTransactionsByDateRange: (userId, startDate, endDate) => {
        return get().transactions.filter((tx) => {
          if (tx.userId !== userId) return false;
          const txDate = new Date(tx.date);
          return txDate >= startDate && txDate <= endDate;
        });
      },

      // Количество транзакций кошелька
      getTransactionCountByWallet: (userId, walletId) => {
        return get().transactions.filter(
          (tx) => tx.userId === userId && tx.walletId === walletId
        ).length;
      },

      // Триггер для обновления UI
      triggerUpdate: () => {
        set((state) => ({
          transactionUpdated: !state.transactionUpdated,
        }));
      },

      // Полное обновление данных
      refreshAllData: () => {
        set((state) => ({
          transactionUpdated: !state.transactionUpdated,
        }));
      },
    }),
    {
      name: 'void-transactions-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        transactions: state.transactions,
      }),
    }
  )
);
