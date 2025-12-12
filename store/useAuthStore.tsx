import { create } from 'zustand';

export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;

  register: (
    username: string,
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  login: (
    emailOrUsername: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => void;
  loadFromCookie: () => void;
}

// Функция для чтения cookie
const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    const cookieValue = parts.pop()?.split(';').shift();
    return cookieValue ? decodeURIComponent(cookieValue) : null;
  }
  return null;
};

// Функция для загрузки данных из cookie
const loadAuthFromCookie = (): {
  user: User | null;
  isAuthenticated: boolean;
} => {
  try {
    const cookieData = getCookie('void-auth-storage');
    if (!cookieData) {
      return { user: null, isAuthenticated: false };
    }

    const parsed = JSON.parse(cookieData);
    return {
      user: parsed.state?.user || null,
      isAuthenticated: parsed.state?.isAuthenticated || false,
    };
  } catch (error) {
    console.error('Error loading auth from cookie:', error);
    return { user: null, isAuthenticated: false };
  }
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,

  register: async (username: string, email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });

      const result = await response.json();

      if (result.success) {
        // Загружаем данные из cookie после успешной регистрации
        get().loadFromCookie();
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Registration failed' };
    }
  },

  login: async (emailOrUsername: string, password: string) => {
    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: emailOrUsername, password }),
      });

      const result = await response.json();

      if (result.success) {
        // Загружаем данные из cookie после успешного логина
        get().loadFromCookie();
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed' };
    }
  },

  logout: async () => {
    try {
      // Вызываем API для logout (если нужно)
      await fetch('/api/auth/logout', { method: 'POST' });

      // Очищаем состояние
      set({ user: null, isAuthenticated: false });

      // Опционально: перезагружаем страницу для очистки всех состояний
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Logout error:', error);
      set({ user: null, isAuthenticated: false });
    }
  },

  checkAuth: () => {
    const authData = loadAuthFromCookie();
    if (authData.user && authData.isAuthenticated) {
      set({ user: authData.user, isAuthenticated: true });
    }
  },

  loadFromCookie: () => {
    const authData = loadAuthFromCookie();
    set({ user: authData.user, isAuthenticated: authData.isAuthenticated });
  },
}));

// Инициализация: загружаем данные из cookie при создании store
if (typeof window !== 'undefined') {
  const initialAuth = loadAuthFromCookie();
  useAuthStore.setState(initialAuth);
}
