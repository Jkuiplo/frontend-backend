import { create } from 'zustand';

type ModalName =
  | 'add'
  | 'addCategory'
  | 'addWallet'
  | 'profile'
  | 'profileMenu'
  | 'settings'
  | 'logout'
  | 'editTransaction';

// Используем конкретный тип для транзакции
import { Transaction } from '@/store/useTransactionStore';

interface ModalData {
  transaction?: Transaction;
  // Добавьте другие возможные типы данных
}

type ModalStore = {
  openModal: (name: ModalName, data?: ModalData) => void;
  closeModal: (name: ModalName) => void;
  isOpen: (name: ModalName) => boolean;
  modals: Record<ModalName, boolean>;
  modalData: ModalData | null;
  closeAll: () => void;
};

export const useModalStore = create<ModalStore>((set, get) => ({
  modals: {
    add: false,
    addCategory: false,
    addWallet: false,
    profile: false,
    profileMenu: false,
    settings: false,
    logout: false,
    editTransaction: false,
  },
  modalData: null,

  openModal: (name, data) =>
    set((state) => ({ 
      modals: { ...state.modals, [name]: true },
      modalData: data || null
    })),

  closeModal: (name) =>
    set((state) => ({ 
      modals: { ...state.modals, [name]: false },
      modalData: null
    })),

  isOpen: (name) => get().modals[name],

  closeAll: () =>
    set((state) => ({
      modals: Object.fromEntries(
        Object.keys(state.modals).map((key) => [key, false])
      ) as Record<ModalName, boolean>,
      modalData: null,
    })),
}));