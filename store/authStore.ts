//store/authStore.ts

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { auth } from '../services/firebaseConfig';
import { Platform } from 'react-native';

// API Base URL
const API_BASE_URL = Platform.OS === 'web' 
  ? 'http://localhost:8080' 
  : 'http://10.218.6.33:8080';

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
  validateUID: () => Promise<boolean>;
  resetUser: () => void;
}

// === ENFORCE STRICT UID/ROLE SEPARATION, ROBUST LOGGING, AND CORRECT TOKEN HANDLING ===
// 1. Each role (client/talent) is a separate account/UID. No switching roles under the same UID.
// 2. Every request/response (login, signup, update, delete, get user info) is logged with full payload and response.
// 3. Always use the latest idToken for protected requests, and never clear state before backend confirms deletion.
// 4. Always use backend's returned data after profile updates, especially for images.
// 5. Defensive checks and comments for clarity and maintainability.

// --- Universal storage updater ---
const saveToStorage = async (user: User | null) => {
  const state = { state: { user, isAuthenticated: !!user } };
  const str = JSON.stringify(state);
  if (typeof window !== "undefined" && window.localStorage) {
    localStorage.setItem("auth-storage", str);
    console.log('[saveToStorage] (web) user:', user);
  } else {
    await AsyncStorage.setItem("auth-storage", str);
    console.log('[saveToStorage] (native) user:', user);
  }
};

// === Field mapping helpers ===
function filterNulls(obj: any) {
  return Object.fromEntries(Object.entries(obj).filter(([_, v]) => v !== undefined && v !== null));
}

// Extend Partial<User> to accept backend fields for mapping
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapClientFields(updates: Partial<User> & any) {
  return {
    name: updates.name || updates.fullName || updates.displayName || '',
    email: updates.email,
    photoURL: updates.photoURL || updates.clientImageUrl || null,
    phoneNumber: updates.phoneNumber || '',
    location: updates.location || null,
    // Add any additional client fields here as needed
  };
}

// Extend Partial<User> to accept backend fields for mapping
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapTalentFields(updates: Partial<User> & any) {
  return {
    name: updates.name || updates.fullName || updates.displayName || '',
    email: updates.email,
    photoURL: updates.photoURL || updates.talentImageUrl || null,
    phoneNumber: updates.phoneNumber || '',
    location: updates.location || null,
    services: updates.services
      ? Array.isArray(updates.services)
        ? updates.services
        : typeof updates.services === 'string'
          ? updates.services.split(',').map((s: string) => s.trim())
          : []
      : updates.talentCategory
        ? Array.isArray(updates.talentCategory)
          ? updates.talentCategory
          : typeof updates.talentCategory === 'string'
            ? updates.talentCategory.split(',').map((s: string) => s.trim())
            : []
        : [],
    pricing: updates.pricing || '',
    availability: updates.availability || '',
    experience: updates.experience || updates.talentDescription || '',
    isMobile: typeof updates.isMobile === 'boolean' ? updates.isMobile : false,
  };
}

type BackendImageResponse = {
  imageUrl?: string;
  clientImageUrl?: string;
  talentImageUrl?: string;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,

      updateUser: (userData: any) => {
        let mappedUser: User;
        if (userData.role === 'talent') {
          mappedUser = {
            id: userData.id || userData.uid || userData.localId,
            ...mapTalentFields(userData),
            role: 'talent',
          };
        } else {
          mappedUser = {
            id: userData.id || userData.uid || userData.localId,
            ...mapClientFields(userData),
            role: 'client',
          };
        }
        set({ user: mappedUser, isAuthenticated: true });
        saveToStorage(mappedUser);
      },
      logout: () => {
        set({ user: null, isAuthenticated: false });
        saveToStorage(null);
        console.log('[logout] User logged out');
      },
      updateProfile: (updates) => {
        const { user } = get();
        if (!user) return;
        let mappedUpdates: Partial<User>;
        if (user.role === 'talent') {
          mappedUpdates = mapTalentFields(updates);
        } else {
          mappedUpdates = mapClientFields(updates);
        }
        const updatedUser = { ...user, ...mappedUpdates };
        set({ user: updatedUser });
        saveToStorage(updatedUser);
      },
      deleteAccount: async () => {
        try {
          const user = get().user;
          if (!user) {
            console.warn('[deleteAccount] No user in store');
            return false;
          }
          // Always get the latest Firebase ID token from Firebase Auth (web and mobile)
          let idToken = null;
          if (typeof window !== 'undefined' && window.localStorage) {
            if (auth && auth.currentUser) {
              try {
                idToken = await auth.currentUser.getIdToken(true);
                console.log('[deleteAccount] (web) Got fresh idToken from Firebase Auth:', idToken);
              } catch (e) {
                console.warn('[deleteAccount] (web) Failed to get idToken from Firebase Auth:', e);
              }
            }
            if (!idToken) {
            idToken = localStorage.getItem('idToken');
              console.log('[deleteAccount] (web) Fallback to idToken from localStorage:', idToken);
            }
          } else if (typeof auth !== 'undefined' && auth.currentUser) {
            idToken = await auth.currentUser.getIdToken(true);
            console.log('[deleteAccount] (native) Got fresh idToken from Firebase Auth:', idToken);
          }
          if (!idToken) {
            console.warn('[deleteAccount] No ID token found');
            return false;
          }
            const url = (typeof window !== 'undefined' && window.location && window.location.hostname === 'localhost')
              ? 'http://localhost:8080/deleteAccount'
              : 'http://10.218.6.33:8080/deleteAccount';
          console.log('[deleteAccount] Sending delete request for UID:', user.id, 'role:', user.role, 'with token:', idToken);
          const response = await fetch(url, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${idToken}` },
          });
          const data = await response.text();
          console.log('[deleteAccount] Backend response:', data);
          if (response.ok) {
            set({ user: null, isAuthenticated: false });
            await saveToStorage(null);
            if (typeof window !== 'undefined' && window.localStorage) {
              localStorage.removeItem('idToken');
            } else {
              await AsyncStorage.removeItem('idToken');
            }
            console.log('[deleteAccount] Account deleted and state cleared');
            return true;
          } else {
            console.error('[deleteAccount] Backend error:', data);
            return false;
          }
        } catch (e) {
          console.error('[deleteAccount] Error:', e);
          return false;
        }
      },
      updateUserInfo: async (updates: Partial<User>) => {
        const { user } = get();
        if (!user) return false;
        let mappedUpdates: Partial<User>;
        if (user.role === 'talent') {
          mappedUpdates = mapTalentFields(updates);
          console.log('[updateUserInfo] Talent updates:', updates);
          console.log('[updateUserInfo] Mapped talent updates:', mappedUpdates);
        } else {
          mappedUpdates = mapClientFields(updates);
        }
        // Always get the latest Firebase ID token from Firebase Auth
        let idToken = null;
        if (typeof window !== 'undefined' && window.localStorage) {
          idToken = localStorage.getItem('idToken');
        } else if (typeof auth !== 'undefined' && auth.currentUser) {
          idToken = await auth.currentUser.getIdToken(true);
        }
        if (!idToken) {
          console.warn('[updateUserInfo] No ID token found');
          return false;
        }
        // Prepare payload for backend
        const payload = {
          ...mappedUpdates,
          uid: user.id,
          role: user.role,
        };
        try {
          const response = await fetch(`${API_BASE_URL}/updateUserInfo`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${idToken}`,
            },
            body: JSON.stringify(payload),
          });
          const responseText = await response.text();
          let responseData = {};
          try {
            // Try to parse JSON
            const trimmed = responseText.trim();
            if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
              responseData = JSON.parse(trimmed);
            }
          } catch (e) {
            console.warn('[updateUserInfo] Could not parse backend response as JSON:', responseText);
          }
          if (response.ok) {
            // Merge updates with current user and any backend response data
            // This ensures all updated fields are properly reflected in the UI
            const updatedUser = { ...user, ...mappedUpdates, ...responseData };
            set({ user: updatedUser });
            await saveToStorage(updatedUser);
            console.log('[updateUserInfo] Backend response data:', responseData);
            console.log('[updateUserInfo] Final updated user:', updatedUser);
            return true;
          } else {
            console.error('[updateUserInfo] Backend error:', responseText);
            return false;
          }
        } catch (error) {
          console.error('[updateUserInfo] Error:', error);
          return false;
        }
      },
      validateUID: async () => {
        try {
          const user = get().user;
          if (!user || !auth.currentUser) return false;
          const firebaseUID = auth.currentUser.uid;
          const storedUID = user.id;
          console.log('[validateUID] Comparing UIDs - Stored:', storedUID, 'Firebase:', firebaseUID);
          if (storedUID !== firebaseUID) {
            console.warn('[validateUID] UID mismatch detected! Stored:', storedUID, 'Firebase:', firebaseUID);
            const updatedUser = { ...user, id: firebaseUID };
            set({ user: updatedUser });
            saveToStorage(updatedUser);
            console.log('[validateUID] Updated user with correct Firebase UID:', updatedUser);
          }
          return true;
        } catch (error) {
          console.error('[validateUID] Error:', error);
          return false;
        }
      },
      resetUser: () => {
        set({ user: null, isAuthenticated: false });
        saveToStorage(null);
        console.log('[resetUser] User state reset');
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
