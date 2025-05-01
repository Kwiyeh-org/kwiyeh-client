 //services/firebase.ts

import axios from 'axios';
import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '~/supabase/supabase';

// Complete any in-progress browser auth sessions
WebBrowser.maybeCompleteAuthSession();

// Base URL for your Spring Boot backend
const API_BASE_URL =
  Platform.OS === 'web'
    ? 'http://localhost:8080'
    : 'http://192.168.216.33:8080';

/**
 * Mobile Google OAuth flow using Expo AuthSession & Supabase
 * @param redirectPath Path to navigate after auth
 */
export async function signInWithGoogleMobile(
  redirectPath: '/client-dashboard' | '/talent-skillForm' = '/client-dashboard'
): Promise<{ success: boolean; userId: string; redirectPath: string }> {
  // 1) Build the Expo redirect URI (must be registered in Supabase)
  const redirectUri = AuthSession.makeRedirectUri({
    // @ts-ignore: useProxy is supported at runtime though not in types
    useProxy: true,
    scheme: 'kwiyeh',         
  });

  // 2) Get the OAuth URL from Supabase
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUri,
      scopes: 'openid email profile',
    },
  });
  if (error) throw error;

  // 3) Launch the browser / webview
  // Fix for AuthSession.startAsync - use WebBrowser.openAuthSessionAsync instead
  // This is compatible with newer versions of expo-auth-session
  try {
    const result = await WebBrowser.openAuthSessionAsync(
      data.url!,
      redirectUri
    );
    
    // 4) Evaluate the result
    if (result.type !== 'success') {
      throw new Error('Authentication cancelled or failed');
    }
    
    // 5) Retrieve the session from Supabase client
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;
    if (!session) throw new Error('No active session found');

    // 6) Persist user ID locally
    const userId = session.user.id;
    await AsyncStorage.setItem('userId', userId);

    // 7) Decide destination and return
    const isClient = session.user.app_metadata?.role === 'client';
    return {
      success: true,
      userId,
      redirectPath: isClient ? '/client-dashboard' : '/talent-skilForm',
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
  redirectPath: '/client-dashboard' | '/talent-skillForm' = '/client-dashboard'
) => {
  if (Platform.OS === 'web') {
    // Web: redirect to Supabase-hosted OAuth
    const redirectTo = window.location.origin + redirectPath;
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        scopes: 'email profile',
      },
    });
    if (error) throw error;
    if (data.url) window.location.href = data.url;
  } else {
    // Native: use Expo+Supabase flow
    const result = await signInWithGoogleMobile(redirectPath);
    if (result.success) {
      // Use your navigation mechanism; for example, with expo-router:
      // import { useRouter } from 'expo-router';
      // const router = useRouter(); router.push(result.redirectPath);
    }
    return result;
  }
};

// Export default for convenience
export default {
  registerUser,
  loginUser,
  signInWithGoogle,
  signInWithGoogleMobile,
};