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
  addTransaction: (
    transaction: Omit<Transaction, 'id'> & { date?: string }
  ) => void;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  getUserTransactions: (userId: string) => Transaction[];
  getTransactionsByDateRange: (
    userId: string,
    startDate: Date,
    endDate: Date
  ) => Transaction[];
  // Триггер для обновления
  transactionUpdated: boolean;
  triggerUpdate: () => void;
}

export const useTransactionStore = create<TransactionState>()(
  persist(
    (set, get) => ({
      transactions: [],
      transactionUpdated: false,

      addTransaction: (transaction) => {
        const newTransaction: Transaction = {
          ...transaction,
          id: `${transaction.userId}_tx_${Date.now()}`,
          date: transaction.date || new Date().toISOString(),
        };

        // Обновляем баланс кошелька
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
          transactionUpdated: !state.transactionUpdated, // Триггер для обновления
        }));
      },

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

      deleteTransaction: (id) => {
        const transaction = get().transactions.find((tx) => tx.id === id);

        if (transaction) {
          // Возвращаем деньги на кошелек
          const wallets = getUserWallets(transaction.userId);
          const wallet = wallets.find((w) => w.id === transaction.walletId);

          if (wallet) {
            let newAmount = wallet.amount;

            if (transaction.type === 'income') {
              newAmount -= transaction.amount; // Убираем доход
            } else if (transaction.type === 'expense') {
              newAmount += transaction.amount; // Возвращаем расход
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

      getUserTransactions: (userId) => {
        return get().transactions.filter((tx) => tx.userId === userId);
      },

      getTransactionsByDateRange: (userId, startDate, endDate) => {
        return get().transactions.filter((tx) => {
          if (tx.userId !== userId) return false;
          const txDate = new Date(tx.date);
          return txDate >= startDate && txDate <= endDate;
        });
      },

      triggerUpdate: () => {
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
