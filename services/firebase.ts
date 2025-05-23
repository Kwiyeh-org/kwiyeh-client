 // services/firebase.ts

import axios from 'axios';
import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from './firebaseConfig';
import { GoogleAuthProvider, signInWithCredential, signInWithPopup } from 'firebase/auth';

// Complete any in-progress browser auth sessions
WebBrowser.maybeCompleteAuthSession();

// Base URL for your Spring Boot backend
const API_BASE_URL =
  Platform.OS === 'web'
    ? 'http://localhost:8080'
    : 'http://192.168.70.33:8080';

/**
 * Mobile Google OAuth flow using Expo AuthSession & Supabase
 * @param redirectPath Path to navigate after auth
 */
export async function signInWithGoogleMobile(
  redirectPath: '/client' | '/talent/modals/talent-skillForm' = '/client'
): Promise<{ success: boolean; userId: string; redirectPath: string }> {
  // 1) Build the Expo redirect URI (still used by Firebase)
  const redirectUri = AuthSession.makeRedirectUri({
    // @ts-ignore: useProxy is supported at runtime though not in types
    useProxy: true,
    scheme: 'kwiyeh',         
  });

  // 2) Launch Expo OAuth session against Google's endpoints
  try {
    // Import firebaseConfig for the OAuth client ID
    const { firebaseConfig } = require('./firebaseConfig');
    
    // For Google OAuth, we need to use a web client ID
    // This is typically from your Google Cloud Console OAuth configuration
    // Here we're using apiKey as a placeholder - you should replace this with your actual OAuth client ID
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
    
    // 3) Grab the id_token from the URL fragment
    const [, hash] = result.url.split('#');
    const params = Object.fromEntries(new URLSearchParams(hash));
    const idToken = params.id_token;
    if (!idToken) throw new Error('No ID token returned');

    // 4) Exchange token for a Firebase credential
    const credential = GoogleAuthProvider.credential(idToken);
    const userCred = await signInWithCredential(auth, credential);
    const userId = userCred.user.uid;

    // 5) Persist user ID locally
    await AsyncStorage.setItem('userId', userId);

    // 6) Decide destination and return
    // (you may store role in a custom claim on your backend)
    return {
      success: true,
      userId,
      redirectPath, // unchanged
    };
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
}) => {
  const { data } = await axios.post(
    `${API_BASE_URL}/signup`,
    userData
  );
  const userId = data.userId ?? data['User created'];
  if (userId) {
    await AsyncStorage.setItem('userId', userId);
  }
  return data;
};

export const loginUser = async (email: string, password: string) => {
  const { data } = await axios.post(
    `${API_BASE_URL}/login`,
    { email, password }
  );
  await AsyncStorage.multiSet([
    ['userId', data.localId],
    ['idToken', data.idToken],
  ]);
  return data;
};

// ─── Unified Google Sign-In ──────────────────────────────────────────────
/**
 * Sign in with Google on any platform
 * @param redirectPath target path after login
 */
export const signInWithGoogle = async (
  redirectPath:  '/client' | '/talent/modals/talent-skillForm' = '/client'
) => {
  if (Platform.OS === 'web') {
    // Web: use Firebase popup
    const provider = new GoogleAuthProvider();
    // Force the account chooser on every call
    provider.setCustomParameters({ prompt: 'select_account' });
    
    try {
      const result = await signInWithPopup(auth, provider);
      const userId = result.user.uid;
      await AsyncStorage.setItem('userId', userId);
      // navigate
      window.location.href = redirectPath;
      return { success: true, userId, redirectPath };
    } catch (e: any) {
      console.error('Web Google Sign-In error', e);
      throw e;
    }
  } else {
    // Native: use our mobile flow
    return await signInWithGoogleMobile(redirectPath);
  }
};

// Export default for convenience
export default {
  registerUser,
  loginUser,
  signInWithGoogle,
  signInWithGoogleMobile,
};