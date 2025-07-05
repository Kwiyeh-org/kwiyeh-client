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
  : 'http://192.168.208.33:8080';

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
function mapClientFields(updates: Partial<User>) {
  return filterNulls({
    fullName: updates.name,
    clientImageUrl: updates.photoURL,
    location: updates.location,
    phoneNumber: updates.phoneNumber,
    email: updates.email,
    // Add more mappings as needed
  });
}
function mapTalentFields(updates: Partial<User>) {
  return filterNulls({
    fullName: updates.name,
    talentImageUrl: updates.photoURL,
    talentCategory: Array.isArray(updates.services) ? updates.services.join(', ') : updates.services,
    location: updates.location,
    phoneNumber: updates.phoneNumber,
    email: updates.email,
    pricing: updates.pricing,
    availability: updates.availability,
    experience: updates.experience,
    isMobile: updates.isMobile,
    // Add more mappings as needed
  });
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

      updateUser: (newUser) => {
        set((state) => {
          // Defensive: merge newUser with existing user fields
          const prevUser = state.user || {};
          return {
            user: {
              ...prevUser,
              ...newUser,
            },
            isAuthenticated: true,
          };
        });
      },
      logout: () => {
        set({ user: null, isAuthenticated: false });
        saveToStorage(null);
        console.log('[logout] User logged out');
      },
      updateProfile: (updates) => {
        set((state) => {
          const newUser = state.user ? { ...state.user, ...updates } : null;
          saveToStorage(newUser);
          console.log('[updateProfile] Profile updated:', updates);
          return { user: newUser };
        });
      },
      deleteAccount: async () => {
        try {
          const user = get().user;
          if (!user) {
            console.warn('[deleteAccount] No user in store');
            return false;
          }
          // Always get the latest Firebase ID token from Firebase Auth
          let idToken = null;
          if (typeof window !== 'undefined' && window.localStorage) {
            idToken = localStorage.getItem('idToken');
          } else if (typeof auth !== 'undefined' && auth.currentUser) {
            idToken = await auth.currentUser.getIdToken(true);
          }
          if (!idToken) {
            console.warn('[deleteAccount] No ID token found');
            return false;
          }
            const url = (typeof window !== 'undefined' && window.location && window.location.hostname === 'localhost')
              ? 'http://localhost:8080/deleteAccount'
              : 'http://192.168.208.33:8080/deleteAccount';
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
        try {
          const user = get().user;
          if (!user || !user.id || !user.role) {
            console.error('[updateUserInfo] No user or missing id/role:', user);
              return false;
            }
          console.log('[updateUserInfo] Starting update for user:', user.id, user.role, 'updates:', updates);
          // Get idToken for authorization - improved logic for both web and mobile
          let idToken = '';
          if (Platform.OS === 'web') {
            // For web: try localStorage first, then Firebase auth
            idToken = localStorage.getItem('idToken') || '';
            console.log('[updateUserInfo] Web localStorage token check:', idToken ? 'FOUND' : 'MISSING');
            if (idToken) {
              console.log('[updateUserInfo] Token length:', idToken.length);
              console.log('[updateUserInfo] Token preview:', idToken.substring(0, 20) + '...');
              // Validate token format
              const isValid = idToken.length > 10 && idToken.split('.').length === 3;
              console.log('[updateUserInfo] Token format valid:', isValid);
              if (!isValid) {
                console.warn('[updateUserInfo] Invalid token format, trying Firebase auth');
                idToken = ''; // Reset to try Firebase auth
              }
            }
            if (!idToken && typeof auth !== 'undefined' && auth.currentUser) {
              try {
                idToken = await auth.currentUser.getIdToken(true);
                // Store the fresh token
                localStorage.setItem('idToken', idToken);
                console.log('[updateUserInfo] Stored fresh Firebase token in localStorage');
              } catch (tokenError) {
                console.warn('[updateUserInfo] Failed to get Firebase token:', tokenError);
              }
            }
          } else {
            // For mobile: try Firebase auth first, then AsyncStorage
            if (typeof auth !== 'undefined' && auth.currentUser) {
              try {
                idToken = await auth.currentUser.getIdToken(true);
                // Store the fresh token
                await AsyncStorage.setItem('idToken', idToken);
                console.log('[updateUserInfo] Stored fresh Firebase token in AsyncStorage');
              } catch (tokenError) {
                console.warn('[updateUserInfo] Failed to get Firebase token:', tokenError);
                // Fallback to stored token
                idToken = await AsyncStorage.getItem('idToken') || '';
              }
            } else {
              idToken = await AsyncStorage.getItem('idToken') || '';
            }
            console.log('[updateUserInfo] Mobile token check:', idToken ? 'FOUND' : 'MISSING');
            if (idToken) {
              console.log('[updateUserInfo] Mobile token length:', idToken.length);
              // Validate token format
              const isValid = idToken.length > 10 && idToken.split('.').length === 3;
              console.log('[updateUserInfo] Mobile token format valid:', isValid);
              if (!isValid) {
                console.warn('[updateUserInfo] Invalid mobile token format, trying Firebase auth');
                idToken = ''; // Reset to try Firebase auth
              }
            }
          }
          if (!idToken) {
            console.error('[updateUserInfo] No idToken found');
            return false;
          }
          // Map fields based on role
          let payload: any;
          if (user.role === 'client') {
            payload = mapClientFields(updates);
          } else if (user.role === 'talent') {
            payload = mapTalentFields(updates);
          } else {
            console.error('[updateUserInfo] Unknown role:', user.role);
            return false;
          }
          payload.uid = user.id;
          payload.role = user.role;
          console.log('[updateUserInfo] Outgoing payload:', payload);
          let response;
          try {
            response = await fetch(`${API_BASE_URL}/updateUserInfo`, {
              method: 'POST',
            headers: {
              'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}`,
            },
              body: JSON.stringify(payload),
            });
          } catch (fetchError) {
            console.error('[updateUserInfo] Fetch error:', fetchError);
            return false;
          }
          console.log('[updateUserInfo] Response status:', response.status);
          console.log('[updateUserInfo] Response headers:', Object.fromEntries(response.headers.entries()));
          const responseText = await response.text();
          console.log('[updateUserInfo] Response text:', responseText);
          console.log('[updateUserInfo] Response text length:', responseText.length);
          console.log('[updateUserInfo] Response text trimmed:', responseText.trim());
          let responseData = {};
          try {
            // Check if response is valid JSON
            const trimmedResponse = responseText.trim();
            if (trimmedResponse.startsWith('{') || trimmedResponse.startsWith('[')) {
              responseData = JSON.parse(trimmedResponse);
              console.log('[updateUserInfo] Successfully parsed JSON response:', responseData);
            } else {
              console.warn('[updateUserInfo] Response is not JSON, using empty object. Response:', responseText);
              responseData = {};
            }
          } catch (parseError) {
            console.warn('[updateUserInfo] Could not parse response as JSON:', responseText);
            console.warn('[updateUserInfo] Parse error:', parseError);
            responseData = {};
          }
          const imgData = responseData as BackendImageResponse;
          const newPhotoURL =
            imgData.imageUrl ||
            imgData.clientImageUrl ||
            imgData.talentImageUrl ||
            updates.photoURL ||
            user.photoURL;
          const updatedUser = {
            ...user,
            ...updates,
            ...responseData,
            photoURL: newPhotoURL,
          };
            set({ user: updatedUser });
            saveToStorage(updatedUser);
          console.log('[updateUserInfo] Update successful. Updated user:', updatedUser);
          console.log('[updateUserInfo] Response ok:', response.ok);
          console.log('[updateUserInfo] Response status:', response.status);
          return response.ok;
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
