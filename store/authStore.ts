//store/authStore.ts

 import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type UserRole = 'client' | 'talent';

export interface User {
  id: string;
  name: string;
  email: string;
  photoURL: string | null;
  role: UserRole;
  phoneNumber?: string;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  services?: string[];
  pricing?: string;
  availability?: string;
  isMobile?: boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  updateUser: (user: User) => void;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
  deleteAccount: () => void;
}

// --- Universal storage updater ---
const saveToStorage = async (user: User | null) => {
  const state = { state: { user, isAuthenticated: !!user } };
  const str = JSON.stringify(state);
  if (typeof window !== "undefined" && window.localStorage) {
    // Web
    localStorage.setItem("auth-storage", str);
  } else {
    // Native
    await AsyncStorage.setItem("auth-storage", str);
  }
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,

      updateUser: (user) => {
        set({ user, isAuthenticated: true });
        saveToStorage(user);
      },
      logout: () => {
        set({ user: null, isAuthenticated: false });
        saveToStorage(null);
      },
      updateProfile: (updates) => {
        set((state) => {
          const newUser = state.user ? { ...state.user, ...updates } : null;
          saveToStorage(newUser);
          return { user: newUser };
        });
      },
      deleteAccount: () => {
        set({ user: null, isAuthenticated: false });
        saveToStorage(null);
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
