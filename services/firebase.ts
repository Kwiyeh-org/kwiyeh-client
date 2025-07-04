// services/firebase.ts


import axios from 'axios';
import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from './firebaseConfig';
import { GoogleAuthProvider, signInWithCredential, signInWithPopup } from 'firebase/auth';

// 🟢 Only for Web: Import here to allow SSR/Next.js, otherwise dynamic import
import { useAuthStore } from '@/store/authStore'; // Ok to import at top-level for Expo, fine for CRA, Next.js dynamic import used in handler below

import type { UserRole } from '@/store/authStore';

// Complete any in-progress browser auth sessions
WebBrowser.maybeCompleteAuthSession();

// Base URL for your Spring Boot backend
const API_BASE_URL =
  Platform.OS === 'web'
    ? 'http://localhost:8080'
    : 'http://192.168.208.33:8080';

/**
 * Helper function to determine role from redirect path
 */
const determineRoleFromPath = (redirectPath: string): UserRole => {
  if (redirectPath.includes('/talent')) return 'talent';
  if (redirectPath.includes('/client')) return 'client';
  return 'client'; // fallback
};

/**
 * Mobile Google OAuth flow using Expo AuthSession & Firebase
 */
export async function signInWithGoogleMobile(
  redirectPath: '/client' | '/talent/talent-skillForm' = '/client'
) {
  const redirectUri = AuthSession.makeRedirectUri({
    // @ts-ignore: useProxy is supported at runtime though not in types
    useProxy: true,
    scheme: 'kwiyeh',
  });

  try {
    // Import firebaseConfig for the OAuth client ID
    const { firebaseConfig } = require('./firebaseConfig');
    const clientId = process.env.GOOGLE_WEB_CLIENT_ID || firebaseConfig.apiKey;

    const result = await WebBrowser.openAuthSessionAsync(
      `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${encodeURIComponent(clientId)}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=token id_token&` +
        `scope=openid%20email%20profile&` +
        `nonce=${Date.now()}`,
      redirectUri
    );

    if (result.type !== 'success') {
      throw new Error('Authentication cancelled or failed');
    }

    // Grab the id_token from the URL fragment
    const [, hash] = result.url.split('#');
    const params = Object.fromEntries(new URLSearchParams(hash));
    const idToken = params.id_token;
    if (!idToken) throw new Error('No ID token returned');

    // Exchange token for a Firebase credential
    const credential = GoogleAuthProvider.credential(idToken);
    const userCred = await signInWithCredential(auth, credential);
    const userId = userCred.user.uid;

    // Persist user ID locally
    await AsyncStorage.setItem('userId', userId);

    // --- HERE you can update Zustand if you want ---
    // In mobile, it's more common to do updateUser in the calling component

    // Return Firebase userCred
    return userCred;
  } catch (error) {
    console.error('Auth session error:', error);
    throw error;
  }
}

// ─── Email / Password ─────────────────────────────────────────────────────
export const registerUser = async (userData: {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  role: string;
}) => {
  console.log('[registerUser] Request:', userData);
  // Log outgoing request
  console.log('[registerUser] POST', `${API_BASE_URL}/signup`, { userData });
  const response = await fetch(`${API_BASE_URL}/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });
  console.log('[registerUser] Response status:', response.status);
  const data = await response.json();
  console.log('[registerUser] Response data:', data);
  
  // Extract Firebase UID from response - backend returns localId
  const userId = data.localId;
  if (userId) {
    // Store in AsyncStorage for consistency
    await AsyncStorage.setItem('userId', userId);
    console.log('[registerUser] Stored Firebase UID:', userId);
  } else {
    console.warn('[registerUser] No localId in response:', data);
  }
  return data;
};

export const loginUser = async (email: string, password: string, role: string) => {
  console.log('[loginUser] Request:', { email, role });
  // Log outgoing request
  console.log('[loginUser] POST', `${API_BASE_URL}/login`, { email, password, role });
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password, role }),
  });
  console.log('[loginUser] Response status:', response.status);
  const data = await response.json();
  console.log('[loginUser] Response data:', data);
  
  // Extract Firebase UID from response - backend returns localId
  const userId = data.localId;
  if (userId) {
    await AsyncStorage.multiSet([
      ['userId', userId],
      ['idToken', data.idToken],
    ]);
    console.log('[loginUser] Stored Firebase UID:', userId);
  } else {
    console.warn('[loginUser] No localId in response:', data);
  }
  return data;
};

// ─── Unified Google Sign-In ──────────────────────────────────────────────
/**
 * Sign in with Google on any platform
 * @param redirectPath target path after login
 */
export const signInWithGoogle = async (
  redirectPath: '/client' | '/talent/talent-skillForm' = '/client'
) => {
  if (Platform.OS === 'web') {
    // Web: use Firebase popup
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    try {
      // Log outgoing request
      console.log('[signInWithGoogle] Firebase popup sign-in');
      const result = await signInWithPopup(auth, provider);
      const userId = result.user.uid;
      await AsyncStorage.setItem('userId', userId);

      // 🟢 Update Zustand user store right after Google login (WEB)
      const userData = {
        id:        userId,
        name:      result.user.displayName || '',
        email:     result.user.email || '',
        photoURL:  result.user.photoURL || null,
        role:      determineRoleFromPath(redirectPath),
      };
      if (typeof window !== 'undefined') {
        // For SSR: require here is safe, but import at top-level also works in CRA/Expo
        const { useAuthStore } = require('@/store/authStore');
        useAuthStore.getState().updateUser(userData);
      }
      // navigate
      window.location.href = redirectPath;
      return { success: true, userId, redirectPath };
    } catch (e: any) {
      console.error('Web Google Sign-In error', e);
      throw e;
    }
  } else {
    // Native: use mobile flow
    console.log('[signInWithGoogle] Mobile Google sign-in');
    return await signInWithGoogleMobile(redirectPath);
  }
};

export default {
  registerUser,
  loginUser,
  signInWithGoogle,
  signInWithGoogleMobile,
  validateUIDConsistency: async () => {
    try {
      // Import authStore dynamically to avoid circular dependencies
      const { useAuthStore } = require('@/store/authStore');
      const validateUID = useAuthStore.getState().validateUID;
      return await validateUID();
    } catch (error) {
      console.error('[validateUIDConsistency] Failed:', error);
      return false;
    }
  },
};
