//store/authStore.ts

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { auth } from '../services/firebaseConfig';

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
  experience?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  updateUser: (user: User) => void;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
  deleteAccount: () => void;
  updateUserInfo: (updates: Partial<User>) => Promise<boolean>;
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
      deleteAccount: async () => {
        try {
          const user = get().user;
          // Always get the latest ID token from Firebase Auth
          let idToken = null;
          if (auth.currentUser) {
            idToken = await auth.currentUser.getIdToken(true);
          }
          if (user && idToken) {
            const url = (typeof window !== 'undefined' && window.location && window.location.hostname === 'localhost')
              ? 'http://localhost:8080/deleteAccount'
              : 'http://192.168.208.33:8080/deleteAccount';

            // Call backend endpoint with timeout and auth header
            const response = await axios.delete(url, {
              headers: {
                'Authorization': `Bearer ${idToken}`,
                'Content-Type': 'application/json',
              },
              timeout: 10000, // 10 second timeout
            });
            console.log('Delete account response:', response.data);
          }
        } catch (err: any) {
          // Log detailed error information
          console.error('Failed to delete account from backend:', {
            message: err.message,
            status: err.response?.status,
            statusText: err.response?.statusText,
            data: err.response?.data,
            config: {
              url: err.config?.url,
              method: err.config?.method,
              data: err.config?.data,
            }
          });
        } finally {
          set({ user: null, isAuthenticated: false });
          saveToStorage(null);
        }
      },
      updateUserInfo: async (updates: Partial<User>) => {
        try {
          const user = get().user;
          if (!user) return false;

          const url = (typeof window !== 'undefined' && window.location && window.location.hostname === 'localhost')
            ? 'http://localhost:8080/updateUserInfo'
            : 'http://192.168.208.33:8081/updateUserInfo';

          // Get auth token
          let token = null;
          if (typeof window !== "undefined" && window.localStorage) {
            token = localStorage.getItem('idToken');
          } else {
            token = await AsyncStorage.getItem('idToken');
          }

          // Prepare payload based on user role - full structure
          let payload: any;
          
          if (user.role === 'client') {
            payload = {
              uid: user.id,
              email: updates.email || user.email || '',
              fullName: updates.name || user.name || '',
              password: "",
              phoneNumber: updates.phoneNumber || user.phoneNumber || '',
              role: user.role,
              clientImageUrl: updates.photoURL || user.photoURL || "",
              location: updates.location || user.location || null
            };
          } else if (user.role === 'talent') {
            payload = {
              uid: user.id,
              email: updates.email || user.email || '',
              fullName: updates.name || user.name || '',
              password: "",
              phoneNumber: updates.phoneNumber || user.phoneNumber || '',
              role: user.role,
              talentName: updates.name || user.name || '',
              talentDescription: updates.experience || user.experience || '',
              talentCategory: updates.services ? updates.services.join(", ") : (user.services ? user.services.join(", ") : ""),
              talentImageUrl: updates.photoURL || user.photoURL || "",
              pricing: updates.pricing || user.pricing || '',
              availability: updates.availability || user.availability || '',
              location: updates.location || user.location || null
            };
          }

          console.log('Updating user info:', { url, payload });

          const response = await axios.post(url, payload, {
            headers: {
              'Content-Type': 'application/json',
              ...(token && { 'Authorization': `Bearer ${token}` }),
            },
            timeout: 10000,
          });

          console.log('Update user info response:', response.data);

          // If backend update successful, update local store
          if (response.status === 200) {
            const updatedUser = { ...user, ...updates };
            set({ user: updatedUser });
            saveToStorage(updatedUser);
            return true;
          }

          return false;
        } catch (err: any) {
          console.error('Failed to update user info:', {
            message: err.message,
            status: err.response?.status,
            data: err.response?.data,
          });
          return false;
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
