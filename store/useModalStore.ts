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

type ModalStore = {
  openModal: (name: ModalName, data?: any) => void;
  closeModal: (name: ModalName) => void;
  isOpen: (name: ModalName) => boolean;
  modals: Record<ModalName, boolean>;
  modalData: any;
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
      modalData: data 
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